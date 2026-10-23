const crypto = require('crypto');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');
const {
  getCategoryFromExtension,
  sanitizeFilename,
  formatBytes
} = require('../utils/fileHelpers');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
const userQuotaMB = parseInt(process.env.USER_STORAGE_QUOTA_MB || '500', 10);
const userQuotaBytes = userQuotaMB * 1024 * 1024;

/**
 * Upload single or multiple documents
 */
async function uploadDocuments(req, res) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided for upload.'
      });
    }

    const uploadedDocs = [];
    const errors = [];

    for (const file of files) {
      try {
        const originalName = sanitizeFilename(file.originalname);
        const ext = path.extname(originalName).toLowerCase();
        const baseNameWithoutExt = path.basename(originalName, ext);
        const category = getCategoryFromExtension(ext);
        const mimeType = file.mimetype || 'application/octet-stream';
        const fileSize = file.size;

        // Unique storage key: userId/uuid_cleanedName
        const uniqueId = crypto.randomUUID();
        const storagePath = `${userId}/${uniqueId}_${originalName.replace(/\s+/g, '_')}`;

        // 1. Upload to Supabase Storage
        // Use supabaseAdmin to ensure storage write permissions if bucket RLS is strict
        const storageClient = supabaseAdmin || client;
        const { error: storageError } = await storageClient.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file.buffer, {
            contentType: mimeType,
            upsert: false
          });

        if (storageError) {
          throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        // 2. Insert metadata record in PostgreSQL
        const { data: docData, error: dbError } = await client
          .from('documents')
          .insert({
            user_id: userId,
            name: originalName,
            original_name: originalName,
            storage_path: storagePath,
            mime_type: mimeType,
            file_ext: ext || 'bin',
            file_size: fileSize,
            category,
            is_favorite: false,
            is_trashed: false,
            tags: []
          })
          .select()
          .single();

        if (dbError) {
          // Rollback storage file if database record insert fails
          await storageClient.storage.from(BUCKET_NAME).remove([storagePath]);
          throw new Error(`Database insert failed: ${dbError.message}`);
        }

        uploadedDocs.push(docData);
      } catch (fileErr) {
        console.error(`Error uploading file ${file.originalname}:`, fileErr);
        errors.push({
          file: file.originalname,
          error: fileErr.message
        });
      }
    }

    if (uploadedDocs.length === 0 && errors.length > 0) {
      return res.status(500).json({
        success: false,
        message: 'All file uploads failed.',
        errors
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedDocs.length} file(s).`,
      data: uploadedDocs,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Fatal upload controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing upload.'
    });
  }
}

/**
 * List documents with searching, filtering, sorting, and pagination
 */
async function getDocuments(req, res) {
  try {
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const {
      category,
      is_favorite,
      is_trashed = 'false',
      search,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 24
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    // Start building query
    let query = client
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Trashed filter
    if (is_trashed === 'true') {
      query = query.eq('is_trashed', true);
    } else {
      query = query.eq('is_trashed', false);
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category.toLowerCase());
    }

    // Favorite filter
    if (is_favorite === 'true') {
      query = query.eq('is_favorite', true);
    }

    // Search filter (name or tags)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.ilike('name', `%${searchTerm}%`);
    }

    // Sorting
    const allowedSortFields = ['created_at', 'name', 'file_size', 'category', 'updated_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const isAsc = order.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: isAsc });

    // Pagination range
    query = query.range(offset, offset + limitNum - 1);

    const { data: documents, count, error } = await query;

    if (error) {
      console.error('Query documents error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch documents: ${error.message}`
      });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      data: documents || [],
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages || 1,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('getDocuments error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching documents.'
    });
  }
}

/**
 * Get dashboard statistics and storage overview
 */
async function getStats(req, res) {
  try {
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    // Fetch all active (non-trashed) documents for stats calculation
    const { data: activeDocs, error: activeErr } = await client
      .from('documents')
      .select('id, name, file_size, category, is_favorite, created_at')
      .eq('user_id', userId)
      .eq('is_trashed', false)
      .order('created_at', { ascending: false });

    if (activeErr) {
      throw activeErr;
    }

    // Count trashed documents
    const { count: trashedCount, error: trashErr } = await client
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_trashed', true);

    if (trashErr) {
      throw trashErr;
    }

    const totalDocs = activeDocs ? activeDocs.length : 0;
    let totalSizeBytes = 0;
    let totalFavorites = 0;

    const categoryDistribution = {
      pdf: { count: 0, bytes: 0 },
      word: { count: 0, bytes: 0 },
      spreadsheet: { count: 0, bytes: 0 },
      presentation: { count: 0, bytes: 0 },
      image: { count: 0, bytes: 0 },
      text: { count: 0, bytes: 0 },
      archive: { count: 0, bytes: 0 },
      other: { count: 0, bytes: 0 }
    };

    if (activeDocs) {
      for (const doc of activeDocs) {
        const size = parseInt(doc.file_size, 10) || 0;
        totalSizeBytes += size;

        if (doc.is_favorite) {
          totalFavorites += 1;
        }

        const cat = categoryDistribution[doc.category] ? doc.category : 'other';
        categoryDistribution[cat].count += 1;
        categoryDistribution[cat].bytes += size;
      }
    }

    // Recent 6 uploads
    const recentUploads = (activeDocs || []).slice(0, 6);

    const percentUsed = Math.min(100, parseFloat(((totalSizeBytes / userQuotaBytes) * 100).toFixed(1)));

    return res.status(200).json({
      success: true,
      data: {
        totalDocuments: totalDocs,
        totalSizeBytes,
        formattedTotalSize: formatBytes(totalSizeBytes),
        storageQuotaBytes: userQuotaBytes,
        formattedStorageQuota: formatBytes(userQuotaBytes),
        percentUsed,
        totalFavorites,
        totalTrashed: trashedCount || 0,
        categoryDistribution,
        recentUploads
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage statistics.'
    });
  }
}

/**
 * Get single document metadata
 */
async function getDocument(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const { data: document, error } = await client
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: document
    });
  } catch (err) {
    console.error('getDocument error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document metadata.'
    });
  }
}

/**
 * Generate secure signed download URL
 */
async function getDownloadUrl(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const { data: document, error: fetchError } = await client
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    const storageClient = supabaseAdmin || client;
    // Expiring signed URL for 1 hour (3600 seconds) with forced attachment download
    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.storage_path, 3600, {
        download: document.original_name || document.name
      });

    if (error || !data?.signedUrl) {
      return res.status(500).json({
        success: false,
        message: `Failed to create download link: ${error ? error.message : 'Unknown storage error'}`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: data.signedUrl,
        filename: document.original_name || document.name,
        expiresInSeconds: 3600
      }
    });
  } catch (err) {
    console.error('getDownloadUrl error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error generating download link.'
    });
  }
}

/**
 * Generate secure signed preview URL
 */
async function getPreviewUrl(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const { data: document, error: fetchError } = await client
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    const storageClient = supabaseAdmin || client;
    // Expiring signed URL for 1 hour (3600 seconds) for inline viewing
    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.storage_path, 3600);

    if (error || !data?.signedUrl) {
      return res.status(500).json({
        success: false,
        message: `Failed to generate preview URL: ${error ? error.message : 'Unknown storage error'}`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        previewUrl: data.signedUrl,
        document,
        expiresInSeconds: 3600
      }
    });
  } catch (err) {
    console.error('getPreviewUrl error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error generating preview URL.'
    });
  }
}

/**
 * Update document details (rename, favorite toggle, description, tags)
 */
async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;
    const { name, is_favorite, description, tags } = req.body;

    const updates = {};

    if (name !== undefined) {
      const sanitized = sanitizeFilename(name);
      if (!sanitized) {
        return res.status(400).json({
          success: false,
          message: 'Document name cannot be blank.'
        });
      }
      updates.name = sanitized;
    }

    if (is_favorite !== undefined) {
      updates.is_favorite = Boolean(is_favorite);
    }

    if (description !== undefined) {
      updates.description = typeof description === 'string' ? description.trim() : null;
    }

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update parameters provided.'
      });
    }

    const { data: updatedDoc, error } = await client
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !updatedDoc) {
      return res.status(400).json({
        success: false,
        message: error ? error.message : 'Document update failed or document not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully.',
      data: updatedDoc
    });
  } catch (err) {
    console.error('updateDocument error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating document.'
    });
  }
}

/**
 * Move document to Trash (Soft delete)
 */
async function moveToTrash(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const { data: trashedDoc, error } = await client
      .from('documents')
      .update({
        is_trashed: true,
        trashed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !trashedDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or could not be moved to trash.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `'${trashedDoc.name}' moved to trash.`,
      data: trashedDoc
    });
  } catch (err) {
    console.error('moveToTrash error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to move document to trash.'
    });
  }
}

/**
 * Restore document from Trash
 */
async function restoreFromTrash(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    const { data: restoredDoc, error } = await client
      .from('documents')
      .update({
        is_trashed: false,
        trashed_at: null
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !restoredDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found in trash.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `'${restoredDoc.name}' restored from trash.`,
      data: restoredDoc
    });
  } catch (err) {
    console.error('restoreFromTrash error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore document.'
    });
  }
}

/**
 * Permanently delete single document (deletes file from Supabase Storage and row from DB)
 */
async function deletePermanent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    // Fetch document to obtain storage path
    const { data: document, error: fetchError } = await client
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    const storageClient = supabaseAdmin || client;

    // 1. Delete physical object from Supabase Storage
    if (document.storage_path) {
      const { error: storageError } = await storageClient.storage
        .from(BUCKET_NAME)
        .remove([document.storage_path]);

      if (storageError) {
        console.warn(`Storage delete warning for ${document.storage_path}:`, storageError.message);
      }
    }

    // 2. Delete row from database
    const { error: dbError } = await client
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) {
      return res.status(500).json({
        success: false,
        message: `Database delete failed: ${dbError.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `'${document.name}' has been permanently deleted.`
    });
  } catch (err) {
    console.error('deletePermanent error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to permanently delete document.'
    });
  }
}

/**
 * Empty all documents in Trash for the current user
 */
async function emptyTrash(req, res) {
  try {
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    // 1. Retrieve all trashed documents
    const { data: trashedDocs, error: fetchError } = await client
      .from('documents')
      .select('id, storage_path')
      .eq('user_id', userId)
      .eq('is_trashed', true);

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch trashed documents: ${fetchError.message}`
      });
    }

    if (!trashedDocs || trashedDocs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Trash is already empty.'
      });
    }

    const storageClient = supabaseAdmin || client;
    const pathsToRemove = trashedDocs.map(d => d.storage_path).filter(Boolean);

    // 2. Remove files from storage
    if (pathsToRemove.length > 0) {
      const { error: storageError } = await storageClient.storage
        .from(BUCKET_NAME)
        .remove(pathsToRemove);

      if (storageError) {
        console.warn('Batch storage removal warning:', storageError.message);
      }
    }

    // 3. Delete records from database
    const { error: deleteError } = await client
      .from('documents')
      .delete()
      .eq('user_id', userId)
      .eq('is_trashed', true);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: `Failed to clear trash from database: ${deleteError.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Permanently deleted ${trashedDocs.length} document(s) from trash.`
    });
  } catch (err) {
    console.error('emptyTrash error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to empty trash.'
    });
  }
}

module.exports = {
  uploadDocuments,
  getDocuments,
  getStats,
  getDocument,
  getDownloadUrl,
  getPreviewUrl,
  updateDocument,
  moveToTrash,
  restoreFromTrash,
  deletePermanent,
  emptyTrash
};
