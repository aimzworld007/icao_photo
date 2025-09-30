import React, { useState } from 'react';
import { FileText, Upload, Download, AlertCircle } from 'lucide-react';

interface PdfConverterProps {
  className?: string;
}

export const PdfConverter: React.FC<PdfConverterProps> = ({ className = '' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
    }, 2000);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <FileText className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">PDF Converter</h2>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Choose a file to convert
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, and TXT files
            </p>
          </label>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">
                  {selectedFile.name}
                </span>
              </div>
              <span className="text-sm text-blue-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!selectedFile || isConverting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isConverting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Converting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Convert File
            </>
          )}
        </button>

        {/* Info Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Conversion Features
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• High-quality document conversion</li>
                <li>• Preserves formatting and layout</li>
                <li>• Secure processing - files are not stored</li>
                <li>• Multiple output formats available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};