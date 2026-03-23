const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || './uploads');

function getUploadDir(subdir) {
  const dir = subdir ? path.join(UPLOADS_DIR, subdir) : path.join(UPLOADS_DIR, 'images');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function createMulterStorage(prefix, subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, getUploadDir(subdir)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const token = crypto.randomBytes(8).toString('hex');
      cb(null, `${prefix}_${token}${ext}`);
    },
  });
}

function imageFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format image invalide (jpg, jpeg, png, webp)'));
  }
}

const maxUploadBytes = parseInt(process.env.MAX_UPLOAD_MB || '5') * 1024 * 1024;

function createUploader(prefix, subdir) {
  return multer({
    storage: createMulterStorage(prefix, subdir),
    fileFilter: imageFilter,
    limits: { fileSize: maxUploadBytes },
  });
}

function deleteUploadedImage(reference) {
  if (!reference) return;
  const candidate = reference.includes('/')
    ? path.join(UPLOADS_DIR, reference)
    : path.join(UPLOADS_DIR, 'images', reference);
  if (fs.existsSync(candidate)) {
    fs.unlinkSync(candidate);
  }
}

module.exports = { createUploader, deleteUploadedImage, UPLOADS_DIR };
