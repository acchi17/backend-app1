const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { uploadData } = require('../controllers/uploadController');

const router = express.Router();

// 画像とテキストデータのアップロードルート
router.post('/upload', upload.single('image'), uploadData);

module.exports = router;
