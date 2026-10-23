const multer = require('multer');
const path = require('path');
const { isBlockedExtension, sanitizeFilename } = require('../utils/fileHelpers');

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);
const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

// Memory storage allows direct stream/buffer upload to Supabase Storage
// avoiding platform-dependent ephemeral filesystem writes
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (isBlockedExtension(ext)) {
    return cb(new Error(`File extension '${ext}' is blocked for security reasons. Executables and system scripts cannot be uploaded.`), false);
  }

  // Pre-sanitize the filename
  file.originalname = sanitizeFilename(file.originalname);
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 10 // Max 10 files per single upload request
  },
  fileFilter
});

// Middleware wrapper to catch Multer errors and format clean JSON responses
function handleUpload(field = 'files', isArray = true, maxCount = 10) {
  const uploader = isArray ? upload.array(field, maxCount) : upload.single(field);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds the allowed limit of ${maxFileSizeMB} MB.`
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. You can upload a maximum of ${maxCount} files at once.`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed validation.'
        });
      }
      next();
    });
  };
}

module.exports = {
  handleUpload,
  maxFileSizeMB
};
