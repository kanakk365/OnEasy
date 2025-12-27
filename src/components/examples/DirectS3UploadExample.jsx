import React, { useState } from 'react';
import { useDirectS3Upload } from '../../hooks/useDirectS3Upload';

/**
 * Example component demonstrating direct S3 upload usage
 * This is a reference implementation - adapt to your needs
 */
function DirectS3UploadExample() {
  const { uploadFile, uploading, progress, error, reset } = useDirectS3Upload();
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [folder] = useState('example-uploads'); // Replace with your folder structure

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (example: max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      const { s3Url } = await uploadFile(
        file,
        folder,
        file.name
      );
      
      setUploadedUrl(s3Url);
      console.log('File uploaded successfully:', s3Url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    }
  };

  const handleReset = () => {
    reset();
    setUploadedUrl(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Direct S3 Upload Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
      </div>

      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <div>Uploading... {Math.round(progress)}%</div>
          <progress value={progress} max="100" style={{ width: '100%' }} />
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {uploadedUrl && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'green', marginBottom: '10px' }}>
            ✅ Upload successful!
          </div>
          <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
            URL: {uploadedUrl}
          </div>
          <button onClick={handleReset} style={{ marginTop: '10px' }}>
            Reset
          </button>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <h3>Usage in your code:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`import { useDirectS3Upload } from '../../hooks/useDirectS3Upload';

const { uploadFile, uploading, progress, error } = useDirectS3Upload();

const handleUpload = async (file) => {
  const { s3Url } = await uploadFile(
    file,
    'your-folder-path',
    'filename.pdf'
  );
  // Use s3Url in your form data
};`}
        </pre>
      </div>
    </div>
  );
}

export default DirectS3UploadExample;

