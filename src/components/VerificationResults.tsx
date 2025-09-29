import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, Palette, Ruler, Camera, Shield, Sparkles } from 'lucide-react';

interface VerificationResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
  icon: React.ReactNode;
}

interface VerificationResultsProps {
  imageUrl: string;
  onResults: (results: VerificationResult[]) => void;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({ imageUrl, onResults }) => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    
    // Simulate image analysis
    setTimeout(() => {
      const analysisResults: VerificationResult[] = [
        {
          category: 'Image Quality',
          status: 'pass',
          message: 'Image resolution and clarity are acceptable',
          icon: <Camera className="w-5 h-5" />
        },
        {
          category: 'Background Color',
          status: 'warning',
          message: 'Background appears slightly off-white',
          suggestion: 'Ensure background is pure white or very light off-white',
          icon: <Palette className="w-5 h-5" />
        },
        {
          category: 'Face Position',
          status: 'pass',
          message: 'Face is properly centered and positioned',
          icon: <Eye className="w-5 h-5" />
        },
        {
          category: 'Image Dimensions',
          status: 'fail',
          message: 'Image dimensions do not meet ICAO standards',
          suggestion: 'Resize image to 35mm × 45mm (minimum 413 × 531 pixels at 300 DPI)',
          icon: <Ruler className="w-5 h-5" />
        },
        {
          category: 'Shadow Detection',
          status: 'pass',
          message: 'No significant shadows detected on face or background',
          icon: <Eye className="w-5 h-5" />
        },
        {
          category: 'Expression & Eyes',
          status: 'pass',
          message: 'Natural expression with eyes open and visible',
          icon: <Eye className="w-5 h-5" />
        }
      ];

      setResults(analysisResults);
      onResults(analysisResults);

      const passCount = analysisResults.filter(r => r.status === 'pass').length;
      const score = Math.round((passCount / analysisResults.length) * 100);
      setOverallScore(score);
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'fail':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-gray-100">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Photo</h3>
          <p className="text-gray-600 text-lg">AI is checking your photo against ICAO standards...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
          <Shield className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ICAO Verification Results</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive analysis of your photo against international standards
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Preview */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Camera className="mr-3 text-blue-600" size={28} />
            Your Photo
          </h3>
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Uploaded photo" 
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
            <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-xl">
              <div className={`w-6 h-6 rounded-full ${
                overallScore >= 80 ? 'bg-green-500' : 
                overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="mt-8 text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold shadow-lg ${
              overallScore >= 80 ? 'bg-green-100 text-green-800' :
              overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              <Shield className="mr-2" size={20} />
              ICAO Score: {overallScore}%
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  overallScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  overallScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Verification Results */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Sparkles className="mr-3 text-purple-600" size={28} />
            Detailed Analysis
          </h3>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      {result.icon}
                      <span className="font-bold text-gray-900 text-lg">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{result.message}</p>
                    {result.suggestion && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-blue-800">
                          <strong>Suggestion:</strong> {result.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="mr-2 text-yellow-500" size={20} />
              Pro Tips:
            </h4>
            <ul className="text-gray-700 space-y-2">
              <li>• Use our image editor to resize and crop your photo</li>
              <li>• Ensure proper lighting with no harsh shadows</li>
              <li>• Take photo against a plain white background</li>
              <li>• Keep a neutral expression with mouth closed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationResults;