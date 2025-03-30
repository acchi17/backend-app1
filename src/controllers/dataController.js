const { getTextData } = require('../services/dataService');

/**
 * Get text data from Azure Table Storage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMainData(req, res) {
  try {
    const textData = await getTextData();
    res.status(200).json(textData);
  } catch (error) {
    console.error('Error in getMainData controller:', error);
    res.status(500).json({ error: 'Failed to retrieve data from Azure Table Storage' });
  }
}

module.exports = {
  getMainData
};
