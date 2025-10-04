import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, Camera, Shield, Sparkles } from 'lucide-react';

interface ICAOCheck {
  passed: boolean;
  message: string;
}

interface ICAOVerificationResult {
  isCompliant: boolean;
  hasFace: boolean;
  faceCount: number;
  checks: {
    hasSingleFace: ICAOCheck;
    facePosition: ICAOCheck;
    eyesOpen: ICAOCheck;
    mouthClosed: ICAOCheck;
    headPose: ICAOCheck;
    glasses: ICAOCheck;
    lighting: ICAOCheck;
    background: ICAOCheck;
  };
  score: number;
  suggestions: string[];
}

interface VerificationResultsProps {
  imageUrl: string;
  onResults: (results: any) => void;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({ imageUrl, onResults }) => {
  const [result, setResult] = useState<ICAOVerificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-icao-photo`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error + (data.details ? ': ' + data.details : ''));
        setIsAnalyzing(false);
        return;
      }

      setResult(data);
      onResults(data);
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <XCircle className="text-red-500" size={20} />
    );
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
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

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-red-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Analysis Failed</h3>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={analyzeImage}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const checksList = [
    { key: 'hasSingleFace', label: 'Single Face Detection', icon: <Eye className="w-5 h-5" /> },
    { key: 'headPose', label: 'Head Position', icon: <Eye className="w-5 h-5" /> },
    { key: 'eyesOpen', label: 'Eyes Open & Visible', icon: <Eye className="w-5 h-5" /> },
    { key: 'mouthClosed', label: 'Neutral Expression', icon: <Eye className="w-5 h-5" /> },
    { key: 'glasses', label: 'No Glasses', icon: <Eye className="w-5 h-5" /> },
    { key: 'lighting', label: 'Lighting Quality', icon: <Camera className="w-5 h-5" /> },
    { key: 'facePosition', label: 'Face Position & Size', icon: <Camera className="w-5 h-5" /> },
    { key: 'background', label: 'Background', icon: <Camera className="w-5 h-5" /> },
  ];

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
                result.score >= 80 ? 'bg-green-500' :
                result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mt-8 text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold shadow-lg ${
              result.score >= 80 ? 'bg-green-100 text-green-800' :
              result.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              <Shield className="mr-2" size={20} />
              ICAO Score: {result.score}%
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  result.score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  result.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              {result.isCompliant ? '✓ ICAO Compliant' : '✗ Not ICAO Compliant'}
            </p>
          </div>
        </div>

        {/* Verification Results */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Sparkles className="mr-3 text-indigo-600" size={28} />
            Detailed Analysis
          </h3>

          <div className="space-y-4">
            {checksList.map((check) => {
              const checkData = result.checks[check.key as keyof typeof result.checks];
              return (
                <div
                  key={check.key}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(checkData.passed)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(checkData.passed)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        {check.icon}
                        <span className="font-bold text-gray-900 text-lg">
                          {check.label}
                        </span>
                      </div>
                      <p className="text-gray-700">{checkData.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="mr-2 text-yellow-500" size={20} />
                Recommendations:
              </h4>
              <ul className="text-gray-700 space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{suggestion.startsWith('✓') ? '✓' : '•'}</span>
                    <span>{suggestion.replace('✓ ', '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResults;
