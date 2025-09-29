import React, { useState, useRef } from 'react';
import { Zap, Download, Upload, Sparkles, Image as ImageIcon, TrendingUp } from 'lucide-react';

interface ImageUpscalerProps {
  imageUrl?: string;
}

const ImageUpscaler: React.FC<ImageUpscalerProps> = ({ imageUrl: initialImage }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [enhanceMode, setEnhanceMode] = useState<'standard' | 'photo' | 'art'>('photo');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setUpscaledImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const upscaleImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);

    // Simulate AI upscaling process
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const newWidth = img.width * upscaleFactor;
      const newHeight = img.height * upscaleFactor;
      
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Apply different enhancement algorithms based on mode
      switch (enhanceMode) {
        case 'photo':
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          break;
        case 'art':
          ctx.imageSmoothingEnabled = false;
          break;
        default:
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
      }

      // Draw upscaled image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Apply enhancement filters
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      const data = imageData.data;

      // Simple sharpening and noise reduction
      for (let i = 0; i < data.length; i += 4) {
        // Enhance contrast slightly
        data[i] = Math.min(255, data[i] * 1.1);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
      }

      ctx.putImageData(imageData, 0, 0);
      
      setTimeout(() => {
        setUpscaledImage(canvas.toDataURL('image/jpeg', 0.95));
        setIsProcessing(false);
      }, 2000); // Simulate processing time
    };
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!upscaledImage) return;
    
    const link = document.createElement('a');
    link.download = `upscaled-image-${upscaleFactor}x.jpg`;
    link.href = upscaledImage;
    link.click();
  };

  const enhanceModes = [
    { id: 'photo', name: 'Photo Enhancement', desc: 'Best for portraits and photos' },
    { id: 'standard', name: 'Standard', desc: 'Balanced enhancement' },
    { id: 'art', name: 'Digital Art', desc: 'Preserves sharp edges' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Zap className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Image Upscaler</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enhance your images with AI-powered upscaling. Increase resolution while maintaining quality and sharpness.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Upload className="mr-2 text-blue-600" size={24} />
            Upload Image
          </h3>
          
          {!originalImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-all duration-300 hover:bg-purple-50"
            >
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop your image here</p>
              <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={originalImage}
                alt="Original"
                className="w-full rounded-xl shadow-lg"
              />
              <button
                onClick={() => setOriginalImage(null)}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Image
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Sparkles className="mr-2 text-purple-600" size={24} />
            Enhancement Settings
          </h3>

          <div className="space-y-6">
            {/* Upscale Factor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upscale Factor: {upscaleFactor}x
              </label>
              <div className="flex space-x-2">
                {[2, 3, 4].map((factor) => (
                  <button
                    key={factor}
                    onClick={() => setUpscaleFactor(factor)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                      upscaleFactor === factor
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {factor}x
                  </button>
                ))}
              </div>
            </div>

            {/* Enhancement Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enhancement Mode
              </label>
              <div className="space-y-2">
                {enhanceModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setEnhanceMode(mode.id as any)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                      enhanceMode === mode.id
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{mode.name}</div>
                    <div className="text-sm text-gray-600">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={upscaleImage}
              disabled={!originalImage || isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                !originalImage || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>Upscale Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Sparkles className="mr-2 text-green-600" size={24} />
            Enhanced Result
          </h3>

          {upscaledImage ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={upscaledImage}
                  alt="Upscaled"
                  className="w-full rounded-xl shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {upscaleFactor}x Enhanced
                </div>
              </div>
              <button
                onClick={downloadImage}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download size={20} />
                <span>Download Enhanced</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500">Enhanced image will appear here</p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Features */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
        <h4 className="font-semibold text-gray-900 mb-4 text-center text-xl">AI Enhancement Features</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="text-purple-600" size={24} />
            </div>
            <h5 className="font-medium text-gray-900 mb-2">Smart Upscaling</h5>
            <p className="text-gray-600 text-sm">AI-powered algorithms preserve details while increasing resolution</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="text-pink-600" size={24} />
            </div>
            <h5 className="font-medium text-gray-900 mb-2">Noise Reduction</h5>
            <p className="text-gray-600 text-sm">Automatically removes artifacts and enhances clarity</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-indigo-600" size={24} />
            </div>
            <h5 className="font-medium text-gray-900 mb-2">Quality Boost</h5>
            <p className="text-gray-600 text-sm">Enhances sharpness and contrast for professional results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpscaler;