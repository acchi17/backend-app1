const { tableClient, containerClient, generateSasToken } = require('../config/azureStorage');

/**
 * Get text data from Azure Table Storage
 * Returns "overview", "detail", "url", and "imageUrl" data
 */
async function getTextData() {
  try {
    // Query to get all entities from the table
    const entities = [];
    const tableIterator = tableClient.listEntities();
    
    // Get list of all blobs for checking
    const blobList = [];
    const blobIterator = containerClient.listBlobsFlat();
    for await (const blob of blobIterator) {
      blobList.push(blob.name);
    }
    
    for await (const entity of tableIterator) {
      // Create the base entity object
      const entityData = {
        summary: entity.Summary,
        detail: entity.Detail,
        imageUrl: ""
      };
      
      // Check if this entity has an ImageName property and if a matching blob exists
      if (entity.ImageUrl && blobList.includes(entity.ImageUrl)) {
        // Get the blob client for this image
        const blobClient = containerClient.getBlobClient(entity.ImageUrl);
        const url = blobClient.url;
        // Generate SAS token for this blob
        const sasToken = generateSasToken(entity.ImageUrl);
        // Append SAS token to the URL
        const urlWithSas = `${url}?${sasToken}`;
        // Add the image URL to the entity data
        entityData.imageUrl = urlWithSas;
      }
      
      entities.push(entityData);
    }

    return entities;
  } catch (error) {
    console.error('Error fetching data from Azure Table Storage:', error);
    throw error;
  }
}

module.exports = {
  getTextData
};
