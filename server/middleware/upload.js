const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Creates a multer-cloudinary storage engine for a given folder
 * @param {string} folder - Cloudinary folder path
 * @param {string[]} allowedFormats - e.g. ['jpg', 'png', 'webp']
 */
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `golf-charity/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    },
  });

// For charity images
const charityStorage = createStorage('charities');

// For winner proof screenshots (also allow pdf via png rendering)
const proofStorage = createStorage('winner-proofs', ['jpg', 'jpeg', 'png', 'webp', 'pdf']);

// File size limits
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

// File filter — only allow images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadCharityImage = multer({
  storage: charityStorage,
  limits,
  fileFilter: imageFilter,
});

const uploadProof = multer({
  storage: proofStorage,
  limits,
  fileFilter: imageFilter,
});

module.exports = { uploadCharityImage, uploadProof };
