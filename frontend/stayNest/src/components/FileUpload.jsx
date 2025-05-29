import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      // Call the callback with the uploaded image URL
      onImageUpload(response.data.imageUrl);
      
      // Reset state
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="file-upload">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect} 
      />
      {selectedFile && (
        <div>
          <p>Selected file: {selectedFile.name}</p>
          <button onClick={handleFileUpload}>Upload</button>
        </div>
      )}
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div 
            style={{width: `${uploadProgress}%`}} 
            className="progress"
          >
            {uploadProgress}%
          </div>
        </div>
      )}
      {uploadError && (
        <p className="error">{uploadError}</p>
      )}
    </div>
  );
};

export default FileUpload;
