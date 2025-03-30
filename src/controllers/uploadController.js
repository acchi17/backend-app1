const { containerClient } = require('../config/azureStorage');
const { container } = require('../config/cosmosdb');
const { v4: uuidv4 } = require('uuid');

async function uploadData(req, res) {
  try {
    const { textData } = req.body;
    const imageFile = req.file;

    // 画像をAzure Blob Storageにアップロード
    const blobName = `${uuidv4()}-${imageFile.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(imageFile.buffer);

    // 画像のURL取得
    const imageUrl = blockBlobClient.url;

    // テキストデータと画像URLをCosmos DBに保存
    const uploadData = {
      id: uuidv4(),
      textData: JSON.parse(textData), // テキストデータの配列
      imageUrl: imageUrl,
      uploadedAt: new Date().toISOString()
    };

    const { resource: createdItem } = await container.items.create(uploadData);

    res.status(201).json({
      message: 'アップロード成功',
      data: createdItem
    });
  } catch (error) {
    console.error('アップロードエラー:', error);
    res.status(500).json({
      message: 'アップロード中にエラーが発生しました',
      error: error.message
    });
  }
}

module.exports = {
  uploadData
};
