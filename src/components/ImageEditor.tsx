import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Crop, Maximize as Resize, Download, Undo, Redo, Contrast, Sun, Palette, Scissors } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editedImage, setEditedImage] = useState<string>(imageUrl);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [cropMode, setCropMode] = useState(false);
  
  useEffect(() => {
    loadImageToCanvas();
  }, [imageUrl, rotation, brightness, contrast]);

  const loadImageToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Update edited image
      setEditedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = imageUrl;
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ICAO standard dimensions (35mm x 45mm at 300 DPI = 413 x 531 pixels)
    const targetWidth = 413;
    const targetHeight = 531;

    const img = new Image();
    img.onload = () => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      setEditedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = editedImage;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'icao-passport-photo.jpg';
    link.href = editedImage;
    link.click();
  };

  const presetSizes = [
    { name: 'ICAO Standard', width: 413, height: 531 },
    { name: 'US Passport', width: 400, height: 400 },
    { name: '2x2 inches', width: 600, height: 600 },
    { name: '35x45mm', width: 413, height: 531 },
  ];

  const handlePresetResize = (width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      setEditedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = editedImage;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
          <Scissors className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Image Editor</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fine-tune your photo with professional editing tools to meet ICAO standards
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Original Image */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Palette className="mr-2 text-gray-600" size={24} />
            Original Image
          </h3>
          <img 
            src={imageUrl} 
            alt="Original" 
            className="w-full rounded-xl shadow-lg"
          />
        </div>

        {/* Edited Image */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Scissors className="mr-2 text-orange-600" size={24} />
            Enhanced Image
          </h3>
          <img 
            src={editedImage} 
            alt="Edited" 
            className="w-full rounded-xl shadow-lg mb-6"
          />
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Download size={20} />
            <span>Download Enhanced</span>
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Crop className="mr-2 text-blue-600" size={24} />
            Editing Tools
          </h3>
          
          <div className="space-y-6">
            {/* Rotation */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">
                Rotate Image
              </label>
              <button
                onClick={handleRotate}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <RotateCw size={20} />
                <span>Rotate 90°</span>
              </button>
            </div>

            {/* Brightness */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">
                <Sun size={16} className="inline mr-1" />
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">
                <Contrast size={16} className="inline mr-1" />
                Contrast: {contrast}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Preset Sizes */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">
                <Resize size={16} className="inline mr-1" />
                Resize to Standard
              </label>
              <div className="space-y-2">
                {presetSizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => handlePresetResize(size.width, size.height)}
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 py-3 px-4 rounded-lg text-sm transition-all duration-300 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                  >
                    {size.name} ({size.width} × {size.height})
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Resize */}
            <div>
              <button
                onClick={handleResize}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Resize size={20} />
                <span>Auto Resize for ICAO</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;