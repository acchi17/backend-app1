const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { TableClient, TableServiceClient, AzureNamedKeyCredential } = require('@azure/data-tables');
require('dotenv').config();

// Parse connection string to extract account name and key
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const accountName = connectionString.match(/AccountName=([^;]+)/)[1];
const accountKey = connectionString.match(/AccountKey=([^;]+)/)[1];

// Create the shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

// Cache to store SAS tokens with their expiration times
const sasTokenCache = new Map();

/**
 * Generates a SAS token for a blob
 * @param {string} blobName - The name of the blob
 * @param {number} expiryMinutes - Minutes until the SAS token expires (default: 60)
 * @returns {string} The SAS token query string
 */
function generateSasToken(blobName, expiryMinutes = 60) {
  const currentTime = new Date();
  
  // Check if we have a cached token that's still valid
  if (sasTokenCache.has(blobName)) {
    const cachedData = sasTokenCache.get(blobName);
    // If the token is still valid (expiry time is in the future)
    if (cachedData.expiresOn > currentTime) {
      console.log(`Using cached SAS token for blob: ${blobName}`);
      return cachedData.sasToken;
    }
    // Token expired, remove it from cache
    console.log(`Cached SAS token expired for blob: ${blobName}`);
    sasTokenCache.delete(blobName);
  }

  // Generate a new token
  const startsOn = currentTime;
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(startsOn.getMinutes() + expiryMinutes);

  const permissions = new BlobSASPermissions();
  permissions.read = true; // Only allow read access

  const sasOptions = {
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    blobName: blobName,
    permissions: permissions,
    startsOn: startsOn,
    expiresOn: expiresOn,
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  // Store the new token in cache
  sasTokenCache.set(blobName, {
    sasToken: sasToken,
    expiresOn: expiresOn
  });
  console.log(`Generated new SAS token for blob: ${blobName}, expires: ${expiresOn}`);

  return sasToken;
}

/**
 * Clears the SAS token cache
 */
function clearSasTokenCache() {
  sasTokenCache.clear();
  console.log('SAS token cache cleared');
}

// Create Azure Table Storage client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableServiceClient = new TableServiceClient(
  `https://${accountName}.table.core.windows.net`,
  credential
);

// Create a table client for data operations
// Note: You'll need to add AZURE_STORAGE_TABLE_NAME to your .env file
const tableClient = new TableClient(
  `https://${accountName}.table.core.windows.net`,
  process.env.AZURE_STORAGE_TABLE_NAME || 'dataTable',
  credential
);

module.exports = {
  blobServiceClient,
  containerClient,
  generateSasToken,
  clearSasTokenCache,
  tableServiceClient,
  tableClient
};
