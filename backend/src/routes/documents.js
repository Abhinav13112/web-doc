const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { validateUploadedFiles } = require('../middleware/validateFile');
const {
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
} = require('../controllers/documentController');

// All document routes require authentication
router.use(requireAuth);

// Document collection routes
router.get('/', getDocuments);
router.post('/upload', handleUpload('files', true, 10), validateUploadedFiles, uploadDocuments);
router.get('/stats', getStats);
router.delete('/trash/empty', emptyTrash);

// Document specific item routes
router.get('/:id', getDocument);
router.get('/:id/download', getDownloadUrl);
router.get('/:id/preview', getPreviewUrl);
router.patch('/:id', updateDocument);
router.delete('/:id/trash', moveToTrash);
router.patch('/:id/restore', restoreFromTrash);
router.delete('/:id/permanent', deletePermanent);

module.exports = router;
