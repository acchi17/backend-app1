const express = require('express');
const { getMainData } = require('../controllers/dataController');

const router = express.Router();

// Route to get text data from Azure Table Storage
router.get('/data', getMainData);

module.exports = router;
