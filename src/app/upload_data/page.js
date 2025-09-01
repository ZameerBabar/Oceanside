'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const DataUploadComponent = () => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    } else {
      setUploadStatus('error');
      setUploadMessage('Please select a valid JSON file');
      setSelectedFile(null);
    }
  };

  const uploadToFirebase = async (docId, data) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading data to Firebase...');

      await setDoc(doc(db, 'reviewReports', docId), {
        ...data,
        uploadedAt: serverTimestamp(),
      });

      setUploadStatus('success');
      setUploadMessage(`Data for month ${docId} uploaded successfully!`);
      setSelectedFile(null);
      
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to upload data. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      // Validate JSON structure and get document ID (the month/year key)
      const dateKeys = Object.keys(jsonData);
      if (dateKeys.length !== 1) {
        throw new Error('JSON file must contain exactly one top-level key representing the month/year (e.g., "2024-07").');
      }

      const docId = dateKeys[0];
      const monthData = jsonData[docId];
      
      // Basic validation for the inner data structure
      if (!monthData.newReviews || !monthData.ratings || !monthData.staffMentions || !monthData.staffMentionsData || !monthData.notableNegativeReviews) {
        throw new Error('Invalid data structure. The month object must contain newReviews, ratings, staffMentions, staffMentionsData, and notableNegativeReviews.');
      }

      await uploadToFirebase(docId, monthData);
    } catch (error) {
      console.error('File processing error:', error);
      setUploadStatus('error');
      setUploadMessage(`Error: ${error.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#34916aff]"></div>;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-md" style={{ border: '1px solid #d4edc9' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#34916aff' }}>
        Upload Review Report Data
      </h2>
      
      <div className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-[#34916aff] text-white px-6 py-3 rounded-lg hover:bg-[#2d7a5a] transition-colors"
              >
                Choose JSON File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500">
              Upload your monthly review report data in JSON format
            </p>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-[#34916aff]" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                className="bg-[#34916aff] text-white px-4 py-2 rounded-lg hover:bg-[#2d7a5a] transition-colors disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload to Firebase'}
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadMessage && (
          <div className="flex items-center space-x-3 p-4 rounded-lg" 
              style={{ 
                backgroundColor: uploadStatus === 'success' ? '#f0f9ff' : 
                                 uploadStatus === 'error' ? '#fef2f2' : '#f9fafb',
                border: `1px solid ${uploadStatus === 'success' ? '#bfdbfe' : 
                                     uploadStatus === 'error' ? '#fecaca' : '#e5e7eb'}`
              }}>
            {getStatusIcon()}
            <p className="text-sm font-medium">{uploadMessage}</p>
          </div>
        )}

        {/* JSON Format Example */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Expected JSON Format:</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-3 rounded border">
{`{
  "YYYY-MM": {
    "newReviews": {
      "count": 125,
      "change": "+108 vs prior"
    },
    "ratings": [
      {
        "month": "July",
        "year": "2024",
        "location": "Flagler",
        "platform": "Google",
        "totalReviews": 50,
        "breakdown": {
          "5_stars": 33,
          "4_stars": 10
        },
        "average_this_month": 4.34,
        "average_last_month": 4.5
      }
    ],
    "staffMentions": {
      "count": 2,
      "period": "July 2024"
    },
    "staffMentionsData": [
      {
        "month": "July",
        "year": "2024",
        "location": "Flagler",
        "name": "Marina",
        "positive_mentions": 1,
        "negative_mentions": 0
      }
    ],
    "notableNegativeReviews": [
      {
        "month": "July",
        "year": "2024",
        "location": "Ormond",
        "platform": "Google",
        "reviewer_name": "Jane Dillon",
        "review_text": "..."
      }
    ]
  }
}`}
          </pre>
        </div>

        {/* Download Template Button */}
        <div className="text-center">
          <button 
            onClick={() => {
              const template = {
                "YYYY-MM": {
                  newReviews: {
                    count: 0,
                    change: ""
                  },
                  ratings: [],
                  staffMentions: {
                    count: 0,
                    period: ""
                  },
                  staffMentionsData: [],
                  notableNegativeReviews: []
                }
              };
              
              const dataStr = JSON.stringify(template, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'review-report-template.json';
              link.click();
            }}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Download JSON Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataUploadComponent;