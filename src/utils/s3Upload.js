import apiClient from './api';

/**
 * S3 Direct Upload Utility
 * Handles direct file uploads to S3 using presigned URLs
 */

/**
 * Generate a presigned URL for direct S3 upload
 * @param {string} folder - Folder path (e.g., 'private-limited/userId/ticketId')
 * @param {string} fileName - File name (e.g., 'aadhaar-card.pdf')
 * @param {string} contentType - MIME type (e.g., 'image/jpeg', 'application/pdf')
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<{presignedUrl: string, s3Key: string, s3Url: string, expiresIn: number}>}
 */
export const generatePresignedUrl = async (folder, fileName, contentType, expiresIn = 3600) => {
  try {
    const response = await apiClient.post('/upload/presigned-url', {
      folder,
      fileName,
      contentType,
      expiresIn
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to generate presigned URL');
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Generate multiple presigned URLs for batch uploads
 * @param {Array<{folder: string, fileName: string, contentType?: string}>} files - Array of file info
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<Array<{presignedUrl: string, s3Key: string, s3Url: string, expiresIn: number}>>}
 */
export const generatePresignedUrls = async (files, expiresIn = 3600) => {
  try {
    const response = await apiClient.post('/upload/presigned-urls', {
      files,
      expiresIn
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to generate presigned URLs');
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    throw error;
  }
};

/**
 * Upload a file directly to S3 using a presigned URL
 * @param {File} file - The file to upload
 * @param {string} presignedUrl - The presigned URL from generatePresignedUrl
 * @param {Function} onProgress - Optional progress callback (progress: number 0-100)
 * @returns {Promise<void>}
 */
export const uploadFileToS3 = async (file, presignedUrl, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Open PUT request to presigned URL
    xhr.open('PUT', presignedUrl);
    
    // Set content type header
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    // Send file
    xhr.send(file);
  });
};

/**
 * Complete workflow: Generate presigned URL and upload file
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path
 * @param {string} fileName - File name (optional, defaults to file.name)
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<{s3Url: string, s3Key: string}>}
 */
export const uploadFileDirect = async (file, folder, fileName = null, onProgress = null) => {
  try {
    // Use file name if not provided
    const finalFileName = fileName || file.name;
    
    // Generate presigned URL
    const { presignedUrl, s3Url, s3Key } = await generatePresignedUrl(
      folder,
      finalFileName,
      file.type || 'application/octet-stream'
    );

    // Upload file to S3
    await uploadFileToS3(file, presignedUrl, onProgress);

    return {
      s3Url,
      s3Key
    };
  } catch (error) {
    console.error('Error in direct upload:', error);
    throw error;
  }
};

/**
 * Upload multiple files directly to S3
 * @param {Array<File>} files - Array of files to upload
 * @param {string} folder - Folder path
 * @param {Function} onProgress - Optional progress callback (fileIndex, progress)
 * @returns {Promise<Array<{s3Url: string, s3Key: string}>>}
 */
export const uploadFilesDirect = async (files, folder, onProgress = null) => {
  try {
    // Generate presigned URLs for all files
    const fileInfos = files.map(file => ({
      folder,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream'
    }));

    const presignedData = await generatePresignedUrls(fileInfos);

    // Upload all files
    const uploadPromises = presignedData.map(async (data, index) => {
      const file = files[index];
      
      // Create progress callback for this file
      const fileProgressCallback = onProgress 
        ? (progress) => onProgress(index, progress)
        : null;

      await uploadFileToS3(file, data.presignedUrl, fileProgressCallback);
      
      return {
        s3Url: data.s3Url,
        s3Key: data.s3Key
      };
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error in batch direct upload:', error);
    throw error;
  }
};

