import { useState, useCallback } from 'react';
import { uploadFileDirect, uploadFilesDirect } from '../utils/s3Upload';

/**
 * React Hook for Direct S3 Uploads
 * 
 * @example
 * const { uploadFile, uploadFiles, uploading, progress, error } = useDirectS3Upload();
 * 
 * // Single file upload
 * await uploadFile(file, 'private-limited/userId/ticketId', 'document.pdf');
 * 
 * // Multiple files upload
 * await uploadFiles([file1, file2], 'private-limited/userId/ticketId');
 */
export const useDirectS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a single file directly to S3
   * @param {File} file - The file to upload
   * @param {string} folder - Folder path (e.g., 'private-limited/userId/ticketId')
   * @param {string} fileName - Optional file name (defaults to file.name)
   * @returns {Promise<{s3Url: string, s3Key: string}>}
   */
  const uploadFile = useCallback(async (file, folder, fileName = null) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFileDirect(
        file,
        folder,
        fileName,
        (progressValue) => setProgress(progressValue)
      );

      setUploading(false);
      setProgress(100);
      return result;
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      setProgress(0);
      throw err;
    }
  }, []);

  /**
   * Upload multiple files directly to S3
   * @param {Array<File>} files - Array of files to upload
   * @param {string} folder - Folder path
   * @returns {Promise<Array<{s3Url: string, s3Key: string}>>}
   */
  const uploadFiles = useCallback(async (files, folder) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const results = await uploadFilesDirect(
        files,
        folder,
        (fileIndex, progressValue) => {
          // Calculate overall progress
          const totalFiles = files.length;
          const fileProgress = progressValue / totalFiles;
          const completedFiles = fileIndex;
          const overallProgress = (completedFiles / totalFiles) * 100 + fileProgress;
          setProgress(Math.min(overallProgress, 100));
        }
      );

      setUploading(false);
      setProgress(100);
      return results;
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      setProgress(0);
      throw err;
    }
  }, []);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadFiles,
    uploading,
    progress,
    error,
    reset
  };
};

