const { containerClient, generateSasToken } = require('../config/azureStorage');

async function listImages() {
  const imageUrls = [];
  let blobs = containerClient.listBlobsFlat();

  for await (const blob of blobs) {
    // const url = containerClient.getBlobClient(blob.name).url;
    // imageUrls.push(url);
    const blobClient = containerClient.getBlobClient(blob.name);
    const url = blobClient.url;
    
    // Generate SAS token for this blob
    const sasToken = generateSasToken(blob.name);
    
    // Append SAS token to the URL
    const urlWithSas = `${url}?${sasToken}`;
    
    imageUrls.push(urlWithSas);
  }

  return imageUrls;
}

module.exports = {
  listImages
};
