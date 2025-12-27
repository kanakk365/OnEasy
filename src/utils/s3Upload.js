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

/**
 * View a file (handles base64, S3 URLs, and regular URLs)
 * @param {string} fileData - File data (base64, S3 URL, or regular URL)
 * @returns {Promise<void>}
 */
export const viewFile = async (fileData) => {
  if (!fileData) {
    alert('No file data provided');
    return;
  }

  // Validate fileData is a string (not object, array, etc.)
  if (typeof fileData !== 'string') {
    console.error('Invalid file data type:', typeof fileData, fileData);
    // Try to convert to string if it's null, undefined, or other types
    if (fileData === null || fileData === undefined) {
      alert('No file available to view.');
      return;
    }
    // If it's an object, try to stringify it (but this shouldn't happen)
    if (typeof fileData === 'object') {
      const stringified = JSON.stringify(fileData);
      if (stringified === '{}' || stringified === '[]' || stringified === 'null') {
        alert('Invalid file URL. The document may not be properly uploaded.');
        return;
      }
      // If it has a URL property, use that
      if (fileData.url) {
        fileData = fileData.url;
      } else {
        alert('Invalid file format. The file URL is not valid.');
        return;
      }
    } else {
      alert('Invalid file format. The file URL is not valid.');
      return;
    }
  }

  try {
    // Normalize the fileData (trim whitespace)
    const normalizedData = fileData.trim();
    
    // Validate it's not empty and not just whitespace
    if (!normalizedData || normalizedData.length === 0) {
      alert('Invalid file URL. The URL is empty.');
      return;
    }
    
    // Validate it's not an object string representation
    if (normalizedData === '{}' || normalizedData === '[]' || normalizedData === 'null' || normalizedData === 'undefined') {
      alert('Invalid file URL. The document may not be properly uploaded.');
      return;
    }
    
    // Debug logging
    console.log('Viewing file, data type:', typeof fileData);
    console.log('Viewing file, data length:', normalizedData?.length);
    console.log('Viewing file, data preview:', normalizedData?.substring(0, 100));
    
    // If it's base64 data (starts with data:), create a blob and open it
    if (typeof normalizedData === 'string' && normalizedData.startsWith('data:')) {
      const base64Data = normalizedData.split(',')[1];
      if (!base64Data) {
        alert('Invalid file data format');
        return;
      }
      const mimeType = normalizedData.split(',')[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        });
      } else {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }
    } else if (typeof normalizedData === 'string') {
      // More lenient URL detection - check multiple patterns
      const isHttpUrl = normalizedData.startsWith('http://') || normalizedData.startsWith('https://');
      const isS3Url = normalizedData.includes('.s3.') || normalizedData.includes('amazonaws.com') || normalizedData.includes('s3://');
      const hasProtocol = normalizedData.includes('://');
      const hasPath = normalizedData.includes('/');
      const hasDomain = normalizedData.includes('.') && (normalizedData.includes('.com') || normalizedData.includes('.net') || normalizedData.includes('.org') || normalizedData.includes('.io') || normalizedData.includes('amazonaws'));
      
      // Very lenient: if it's a string and not base64 (doesn't start with data:), treat it as URL
      // This handles S3 URLs, regular URLs, and even paths that might be URLs
      const looksLikeUrl = isHttpUrl || isS3Url || (hasPath && (hasDomain || hasProtocol)) || normalizedData.length > 20 || !normalizedData.startsWith('data:'); // Most strings are URLs
      
      if (looksLikeUrl) {
        // Ensure it has a protocol if missing
        let urlToOpen = normalizedData;
        if (!normalizedData.startsWith('http://') && !normalizedData.startsWith('https://') && !normalizedData.startsWith('s3://')) {
          // If it looks like a URL but missing protocol, assume https
          urlToOpen = `https://${normalizedData}`;
        }
        
        // Check if it's an S3 URL
        if (urlToOpen.includes('.s3.') || urlToOpen.includes('amazonaws.com') || urlToOpen.includes('s3://')) {
          // Get signed URL for S3 file (for private buckets)
          // If this fails, we'll fall back to opening the URL directly
          try {
            const response = await apiClient.post('/admin/get-signed-url', { s3Url: urlToOpen });
            if (response.success && response.signedUrl) {
              window.open(response.signedUrl, '_blank', 'noopener,noreferrer');
              return; // Successfully opened with signed URL
            } else {
              // If response is not successful, show error message
              const errorMsg = response.message || 'Failed to generate signed URL';
              console.error('Failed to get signed URL:', errorMsg);
              alert(`Unable to access file: ${errorMsg}. Trying to open directly...`);
            }
          } catch (error) {
            // Check if it's an access denied error
            const errorMessage = error.message || '';
            const errorResponse = error.response?.data?.message || '';
            
            if (errorMessage.includes('Access Denied') || errorResponse.includes('Access denied') || 
                errorMessage.includes('AccessDenied') || errorResponse.includes('Access denied')) {
              alert('Access denied to this file. The file may not exist or you may not have permission to view it.');
              console.error('Access denied error:', error);
              return; // Don't try to open directly if access is denied
            }
            
            // For other errors, log and try to open directly
            if (errorMessage && !errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_CONNECTION_REFUSED')) {
              console.warn('Could not get signed URL, trying to open directly:', errorMessage);
            }
          }
          // Fallback: Open URL directly (works for public S3 buckets or if signed URL fails)
          // Only try if we didn't get an access denied error
          try {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
          } catch (openError) {
            console.error('Error opening URL directly:', openError);
            alert('Unable to open file. Please contact support if this issue persists.');
          }
        } else {
          // Regular HTTP/HTTPS URL - try to open it
          try {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
          } catch (error) {
            console.error('Error opening URL:', error);
            alert(`Failed to open file URL: ${urlToOpen.substring(0, 50)}...`);
          }
        }
      } else {
        // Only try base64 if it doesn't look like a URL
        // Check if it's valid base64 before attempting decode
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        if (base64Regex.test(normalizedData) && normalizedData.length > 10) {
          try {
            const base64Data = atob(normalizedData);
            const byteNumbers = new Array(base64Data.length);
            for (let i = 0; i < base64Data.length; i++) {
              byteNumbers[i] = base64Data.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            const newWindow = window.open(blobUrl, '_blank');
            if (newWindow) {
              newWindow.addEventListener('load', () => {
                setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              });
            } else {
              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            }
          } catch (error) {
            console.error('Error processing file as base64:', error);
            console.error('File data:', normalizedData.substring(0, 100));
            // Last resort: try opening as URL anyway
            try {
              const urlToTry = normalizedData.startsWith('http') ? normalizedData : `https://${normalizedData}`;
              window.open(urlToTry, '_blank', 'noopener,noreferrer');
            } catch {
              alert('Failed to open file. The file format is not recognized.');
            }
          }
        } else {
          // Last resort: try to open as URL even if it doesn't match patterns
          // Be very lenient - if it's a non-empty string, try to open it
          console.warn('File data does not match URL or base64 patterns, attempting to open as URL:', normalizedData.substring(0, 100));
          if (normalizedData && normalizedData.length > 0) {
            try {
              // Try different URL formats
              let urlToTry = normalizedData;
              if (!normalizedData.startsWith('http://') && !normalizedData.startsWith('https://')) {
                // If it contains a domain-like pattern, add https://
                if (normalizedData.includes('.') || normalizedData.includes('/')) {
                  urlToTry = `https://${normalizedData}`;
                } else {
                  // If it's just a path, it might be a relative URL - try to construct full URL
                  urlToTry = normalizedData;
                }
              }
              console.log('Attempting to open URL:', urlToTry);
              window.open(urlToTry, '_blank', 'noopener,noreferrer');
            } catch (error) {
              console.error('Error opening file:', error);
              console.error('File data:', normalizedData);
              alert(`Failed to open file. Please check the file URL.\n\nFile: ${normalizedData.substring(0, 100)}${normalizedData.length > 100 ? '...' : ''}`);
            }
          } else {
            alert('Invalid file format. The file URL is empty or invalid.');
          }
        }
      }
    } else {
      alert('Invalid file data type');
    }
  } catch (error) {
    console.error('Error viewing file:', error);
    alert('Failed to open file. Please try again.');
  }
};

