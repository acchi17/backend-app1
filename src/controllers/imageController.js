const { listImages } = require('../services/imageService');

async function getImages(req, res) {
  try {
    const images = await listImages();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
}

module.exports = {
  getImages
};
