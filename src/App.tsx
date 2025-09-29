import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertTriangle, Download, RotateCw, Crop, Maximize as Resize, FileText, Zap, Sparkles, Shield } from 'lucide-react';
import PhotoUploader from './components/PhotoUploader';
import VerificationResults from './components/VerificationResults';
import ImageEditor from './components/ImageEditor';
import PdfConverter from './components/PdfConverter';
import ImageUpscaler from './components/ImageUpscaler';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'verify' | 'edit' | 'upscale' | 'convert'>('upload');

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setActiveTab('verify');
  };

  const tabs = [
    { id: 'upload', label: 'Upload Photo', icon: Upload, gradient: 'from-blue-500 to-indigo-500' },
    { id: 'verify', label: 'Verify ICAO', icon: Shield, gradient: 'from-green-500 to-emerald-500' },
    { id: 'edit', label: 'Edit Image', icon: Crop, gradient: 'from-orange-500 to-red-500' },
    { id: 'upscale', label: 'AI Upscale', icon: Zap, gradient: 'from-purple-500 to-pink-500' },
    { id: 'convert', label: 'Convert PDF', icon: FileText, gradient: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
            <Sparkles className="text-white" size={36} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ICAO Photo Verification Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools for passport photo verification, editing, and enhancement. 
            Ensure ICAO compliance with AI-powered analysis and premium editing features.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-xl hover:shadow-2xl'
                }`}
              >
                <Icon size={24} />
                <span className="text-lg">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'upload' && (
            <PhotoUploader onImageUpload={handleImageUpload} />
          )}
          
          {activeTab === 'verify' && uploadedImage && (
            <VerificationResults 
              imageUrl={uploadedImage}
              onResults={setVerificationResults}
            />
          )}
          
          {activeTab === 'edit' && uploadedImage && (
            <ImageEditor imageUrl={uploadedImage} />
          )}
          
          {activeTab === 'upscale' && (
            <ImageUpscaler imageUrl={uploadedImage || undefined} />
          )}
          
          {activeTab === 'convert' && (
            <PdfConverter />
          )}
        </div>

        {/* ICAO Standards Info */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ICAO Photo Standards</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                International standards for passport photos ensuring global acceptance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Crop className="text-blue-600" size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-blue-600">Technical Requirements</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Image size: 35mm × 45mm minimum</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Resolution: 600 DPI minimum</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Background: Plain white or off-white</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">No shadows on face or background</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Recent photo (less than 6 months)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="text-purple-600" size={16} />
                  </div>
                  <h3 className="text-xl font-bold text-purple-600">Subject Requirements</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Face centered and looking straight ahead</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Natural expression, mouth closed</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Eyes open and clearly visible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">No glasses (with exceptions)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500" size={14} />
                    </div>
                    <span className="font-medium">Head covering only for religious reasons</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <Sparkles size={16} />
            <span className="text-sm">Professional ICAO Photo Tools - Free for Everyone</span>
            <Sparkles size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;