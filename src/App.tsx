import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Crop, FileText, Zap, Sparkles, Shield, Moon, Sun, Heart } from 'lucide-react';
import PhotoUploader from './components/PhotoUploader';
import VerificationResults from './components/VerificationResults';
import ImageEditor from './components/ImageEditor';
import PdfConverter from './components/PdfConverter';
import ImageUpscaler from './components/ImageUpscaler';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [, setVerificationResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'verify' | 'edit' | 'upscale' | 'convert'>('upload');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="w-full px-4 py-6 md:py-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 md:mb-6 shadow-2xl">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ICAO Photo Verification Suite
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Professional-grade tools for passport photo verification, editing, and enhancement.
            Ensure ICAO compliance with AI-powered analysis and premium editing features.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 md:mb-12 gap-2 md:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 text-sm md:text-base lg:text-lg ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-105`
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-xl hover:shadow-2xl'
                }`}
              >
                <Icon size={20} className="md:w-6 md:h-6" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="w-full">
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
        <div className="mt-12 md:mt-20 w-full px-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 border border-gray-100 dark:border-slate-700">
            <div className="text-center mb-6 md:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">ICAO Photo Standards</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                International standards for passport photos ensuring global acceptance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-12">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Crop className="text-blue-600" size={16} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">Technical Requirements</h3>
                </div>
                <ul className="space-y-3 md:space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Image size: 35mm × 45mm minimum</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Resolution: 600 DPI minimum</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Background: Plain white or off-white</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">No shadows on face or background</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
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
                  <h3 className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400">Subject Requirements</h3>
                </div>
                <ul className="space-y-3 md:space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Face centered and looking straight ahead</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Natural expression, mouth closed</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Eyes open and clearly visible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">No glasses (with exceptions)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="text-green-500 dark:text-green-400" size={14} />
                    </div>
                    <span className="font-medium">Head covering only for religious reasons</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 pb-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Sparkles size={16} />
              <span className="text-sm">Professional ICAO Photo Tools - Free for Everyone</span>
              <Sparkles size={16} />
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-500 fill-current" />
              <span>by</span>
              <a
                href="https://www.ainulislam.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                Ainul Islam
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;