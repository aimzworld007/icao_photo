import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, CheckCircle } from 'lucide-react';

interface PhotoUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        onImageUpload(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const sampleImages = [
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
          <Upload className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your passport photo for ICAO compliance verification. We support JPG, PNG, and other common image formats.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Upload className="text-blue-600" size={32} />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Drop your photo here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse from your device
                </p>
                
                <button
                  onClick={openFileDialog}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Choose Photo
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Supported formats: JPG, PNG, GIF, WebP</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview or Sample Images */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {uploadedImage ? (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Photo Uploaded</h3>
              </div>
              
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded photo"
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Ready for Analysis
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={openFileDialog}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Upload Different Photo
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Sparkles className="text-purple-600" size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Try Sample Photos</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Test our verification system with these sample passport photos
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {sampleImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUploadedImage(imageUrl);
                      onImageUpload(imageUrl);
                    }}
                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={imageUrl}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20} />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <ImageIcon className="text-blue-600 mr-2 mt-0.5" size={16} />
                  <div>
                    <p className="text-blue-800 font-medium text-sm">
                      Photo Requirements:
                    </p>
                    <ul className="text-blue-700 text-sm mt-1 space-y-1">
                      <li>• Clear, high-resolution image</li>
                      <li>• Plain white or off-white background</li>
                      <li>• Face clearly visible and centered</li>
                      <li>• Recent photo (less than 6 months)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;