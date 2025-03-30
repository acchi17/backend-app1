const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/imageRoutes');
const dataRoutes = require('./routes/dataRoutes');
//const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
app.use('/api', imageRoutes);
app.use('/api', dataRoutes);
//app.use('/api', uploadRoutes);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

module.exports = app;
