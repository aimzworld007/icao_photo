import React, { useCallback, useState } from 'react';
import { Upload, Camera, FileImage, Sparkles } from 'lucide-react';

interface PhotoUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(imageUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
          <Upload className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Start by uploading your passport photo for ICAO compliance verification
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 transform scale-105'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 shadow-xl'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
            {isUploading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            ) : (
              <Upload className="text-blue-600" size={32} />
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Your Passport Photo
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Drag and drop your photo here, or click to select
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <FileImage size={20} />
              <span>Choose File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleCameraCapture}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Supported formats: JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center mb-4">
          <Sparkles className="text-blue-600 mr-2" size={24} />
          <h4 className="font-bold text-blue-900 text-xl">Photo Requirements</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="text-blue-800 space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Photo is recent (taken within 6 months)</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>You're looking directly at the camera</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Background is plain white or off-white</span>
            </li>
          </ul>
          <ul className="text-blue-800 space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>No shadows on your face or background</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Image is clear and in focus</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Natural expression with eyes open</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;
          <li>• Photo is recent (taken within 6 months)</li>
          <li>• You're looking directly at the camera</li>
          <li>• Background is plain white or off-white</li>
          <li>• No shadows on your face or background</li>
          <li>• Image is clear and in focus</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploader;