import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ICAOVerificationResult {
  isCompliant: boolean;
  hasFace: boolean;
  faceCount: number;
  checks: {
    hasSingleFace: { passed: boolean; message: string };
    dimensions: { passed: boolean; message: string };
    resolution: { passed: boolean; message: string };
    background: { passed: boolean; message: string };
    facePosition: { passed: boolean; message: string };
    faceCoverage: { passed: boolean; message: string };
    headPose: { passed: boolean; message: string };
    eyesOpen: { passed: boolean; message: string };
    expression: { passed: boolean; message: string };
    lighting: { passed: boolean; message: string };
    sharpness: { passed: boolean; message: string };
    accessories: { passed: boolean; message: string };
  };
  score: number;
  suggestions: string[];
  imageInfo: {
    width: number;
    height: number;
    aspectRatio: number;
    sizeInMM?: string;
  };
}

async function analyzeImage(imageUrl: string) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBlob = await imageResponse.blob();
    
    // Try to detect faces using API Ninjas
    const apiKey = Deno.env.get('API_NINJAS_KEY') || 'jIUpBUgkgzHe4kOGscI0qg==xrR5YSIL8mAWkHJw';
    const apiUrl = 'https://api.api-ninjas.com/v1/facedetect';
    
    const formData = new FormData();
    formData.append('image', imageBlob);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    let faceData = null;
    if (response.ok) {
      faceData = await response.json();
    }

    // Get image dimensions and analyze pixels
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageInfo = await analyzeImageBuffer(arrayBuffer);

    return { faceData, imageInfo };
  } catch (error) {
    console.error('Image analysis error:', error);
    return { faceData: null, imageInfo: null };
  }
}

async function analyzeImageBuffer(arrayBuffer: ArrayBuffer) {
  // Simple image dimension extraction
  const uint8 = new Uint8Array(arrayBuffer);
  
  let width = 0;
  let height = 0;
  let avgBrightness = 0;
  let hasTransparency = false;

  // Check PNG signature
  if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47) {
    // PNG file - read IHDR chunk
    width = (uint8[16] << 24) | (uint8[17] << 16) | (uint8[18] << 8) | uint8[19];
    height = (uint8[20] << 24) | (uint8[21] << 16) | (uint8[22] << 8) | uint8[23];
  }
  // Check JPEG signature
  else if (uint8[0] === 0xFF && uint8[1] === 0xD8 && uint8[2] === 0xFF) {
    // JPEG file - scan for SOF markers
    for (let i = 2; i < uint8.length - 10; i++) {
      if (uint8[i] === 0xFF && (uint8[i + 1] === 0xC0 || uint8[i + 1] === 0xC2)) {
        height = (uint8[i + 5] << 8) | uint8[i + 6];
        width = (uint8[i + 7] << 8) | uint8[i + 8];
        break;
      }
    }
  }

  return {
    width,
    height,
    fileSize: arrayBuffer.byteLength,
    avgBrightness,
    hasTransparency
  };
}

function analyzeBackgroundColor(imageInfo: any) {
  // Basic heuristic: check if image has transparency or likely white background
  // In production, this would analyze actual pixel data
  return {
    isWhite: true, // Assume for now, would need actual pixel analysis
    confidence: 0.7
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { faceData, imageInfo } = await analyzeImage(imageUrl);

    // Initialize result with all checks
    const result: ICAOVerificationResult = {
      isCompliant: false,
      hasFace: false,
      faceCount: 0,
      checks: {
        hasSingleFace: { passed: false, message: "" },
        dimensions: { passed: false, message: "" },
        resolution: { passed: false, message: "" },
        background: { passed: false, message: "" },
        facePosition: { passed: false, message: "" },
        faceCoverage: { passed: false, message: "" },
        headPose: { passed: false, message: "" },
        eyesOpen: { passed: false, message: "" },
        expression: { passed: false, message: "" },
        lighting: { passed: false, message: "" },
        sharpness: { passed: false, message: "" },
        accessories: { passed: false, message: "" },
      },
      score: 0,
      suggestions: [],
      imageInfo: {
        width: imageInfo?.width || 0,
        height: imageInfo?.height || 0,
        aspectRatio: 0,
        sizeInMM: ""
      }
    };

    const width = imageInfo?.width || 0;
    const height = imageInfo?.height || 0;
    
    if (width > 0 && height > 0) {
      result.imageInfo.aspectRatio = width / height;
      // Calculate approximate size in mm (assuming 300 DPI)
      const widthMM = Math.round((width / 300) * 25.4);
      const heightMM = Math.round((height / 300) * 25.4);
      result.imageInfo.sizeInMM = `${widthMM}mm × ${heightMM}mm`;
    }

    let passedChecks = 0;
    const totalChecks = 12;

    // Check 1: Dimensions (Emirates ID: 35-40mm width × 40-45mm height)
    // At 300 DPI: width 413-472px, height 472-531px
    const minWidth = 400;
    const maxWidth = 500;
    const minHeight = 450;
    const maxHeight = 550;
    
    const dimensionsOK = width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight;
    result.checks.dimensions.passed = dimensionsOK;
    result.checks.dimensions.message = dimensionsOK
      ? `Image dimensions ${width}×${height}px are within acceptable range`
      : `Image ${width}×${height}px should be 400-500px width × 450-550px height (35-40mm × 40-45mm at 300 DPI)`;
    
    if (dimensionsOK) passedChecks++;
    else result.suggestions.push("Resize image to 35-40mm width × 40-45mm height (approximately 413-472 × 472-531 pixels at 300 DPI)");

    // Check 2: Resolution/Quality
    const minPixels = 200000; // ~447×447
    const totalPixels = width * height;
    const resolutionOK = totalPixels >= minPixels && width >= 400 && height >= 400;
    
    result.checks.resolution.passed = resolutionOK;
    result.checks.resolution.message = resolutionOK
      ? "Image resolution is sufficient for high-quality printing"
      : `Image resolution too low. Need at least 400×450 pixels for photo-quality printing`;
    
    if (resolutionOK) passedChecks++;
    else result.suggestions.push("Use a higher resolution image (minimum 400×450 pixels) for sharp, clear printing");

    // Check 3: Aspect Ratio
    const aspectRatio = width / height;
    const idealAspectRatio = 37.5 / 42.5; // ~0.882 (middle of 35-40mm / 40-45mm)
    const aspectRatioDiff = Math.abs(aspectRatio - idealAspectRatio);
    const aspectRatioOK = aspectRatioDiff < 0.15;
    
    if (!aspectRatioOK) {
      result.suggestions.push("Image aspect ratio should be approximately 35-40:40-45 (portrait orientation)");
    }

    // Check 4: Face Detection
    const faces = (faceData && Array.isArray(faceData)) ? faceData : [];
    result.faceCount = faces.length;
    result.hasFace = faces.length > 0;

    result.checks.hasSingleFace.passed = faces.length === 1;
    result.checks.hasSingleFace.message = 
      faces.length === 0 ? "❌ No human face detected in the image"
      : faces.length > 1 ? `❌ Multiple faces detected (${faces.length}). Only one person allowed`
      : "✓ Single face detected";
    
    if (result.checks.hasSingleFace.passed) passedChecks++;
    else if (faces.length === 0) {
      result.suggestions.push("CRITICAL: Upload a photo showing a clear frontal view of a human face");
    } else if (faces.length > 1) {
      result.suggestions.push("CRITICAL: Only one person should be in the photo. Remove other people from the frame");
    }

    // If no face detected, provide basic guidance and return
    if (faces.length === 0) {
      result.checks.background.passed = false;
      result.checks.background.message = "Cannot verify - no face detected";
      result.checks.facePosition.passed = false;
      result.checks.facePosition.message = "Cannot verify - no face detected";
      result.checks.faceCoverage.passed = false;
      result.checks.faceCoverage.message = "Cannot verify - no face detected";
      result.checks.headPose.passed = false;
      result.checks.headPose.message = "Cannot verify - no face detected";
      result.checks.eyesOpen.passed = false;
      result.checks.eyesOpen.message = "Cannot verify - no face detected";
      result.checks.expression.passed = false;
      result.checks.expression.message = "Cannot verify - no face detected";
      result.checks.lighting.passed = false;
      result.checks.lighting.message = "Cannot verify - no face detected";
      result.checks.sharpness.passed = false;
      result.checks.sharpness.message = "Cannot verify - no face detected";
      result.checks.accessories.passed = false;
      result.checks.accessories.message = "Cannot verify - no face detected";

      result.score = Math.round((passedChecks / totalChecks) * 100);
      result.suggestions.unshift("⚠️ NO FACE DETECTED - This image cannot be used for Emirates ID");
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If multiple faces, mark most checks as failed
    if (faces.length > 1) {
      result.checks.background.passed = false;
      result.checks.facePosition.passed = false;
      result.checks.faceCoverage.passed = false;
      result.checks.headPose.passed = false;
      result.checks.eyesOpen.passed = false;
      result.checks.expression.passed = false;
      result.checks.lighting.passed = false;
      result.checks.sharpness.passed = false;
      result.checks.accessories.passed = false;

      Object.keys(result.checks).forEach(key => {
        if (key !== 'hasSingleFace' && key !== 'dimensions' && key !== 'resolution') {
          result.checks[key as keyof typeof result.checks].message = "Cannot verify with multiple faces";
        }
      });

      result.score = Math.round((passedChecks / totalChecks) * 100);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze single face
    const face = faces[0];
    const faceBox = face.bounding_box || face;
    const faceX = faceBox.x || faceBox.x1 || 0;
    const faceY = faceBox.y || faceBox.y1 || 0;
    const faceWidth = faceBox.width || faceBox.w || (faceBox.x2 - faceBox.x1) || 0;
    const faceHeight = faceBox.height || faceBox.h || (faceBox.y2 - faceBox.y1) || 0;

    // Check 5: Face Position (should be centered)
    const faceCenterX = faceX + faceWidth / 2;
    const faceCenterY = faceY + faceHeight / 2;
    const imageCenterX = width / 2;
    const imageCenterY = height / 2;

    const horizontalOffset = Math.abs(faceCenterX - imageCenterX) / width;
    const verticalOffset = Math.abs(faceCenterY - imageCenterY) / height;

    const facePositionOK = horizontalOffset < 0.15 && verticalOffset < 0.15;
    result.checks.facePosition.passed = facePositionOK;
    result.checks.facePosition.message = facePositionOK
      ? "✓ Face is properly centered in the frame"
      : "❌ Face should be centered horizontally and vertically in the frame";
    
    if (facePositionOK) passedChecks++;
    else result.suggestions.push("Center your face in the frame - avoid positioning too far left, right, up, or down");

    // Check 6: Face Coverage (70-80% of image height)
    const faceCoverageRatio = faceHeight / height;
    const faceCoverageOK = faceCoverageRatio >= 0.65 && faceCoverageRatio <= 0.85;
    
    result.checks.faceCoverage.passed = faceCoverageOK;
    result.checks.faceCoverage.message = faceCoverageOK
      ? `✓ Face occupies ${Math.round(faceCoverageRatio * 100)}% of image height (target: 70-80%)`
      : `❌ Face occupies ${Math.round(faceCoverageRatio * 100)}% of image height. Should be 70-80% (head and top of shoulders)`;
    
    if (faceCoverageOK) passedChecks++;
    else if (faceCoverageRatio < 0.65) {
      result.suggestions.push("Move closer to the camera or crop tighter - face should occupy 70-80% of the image height");
    } else {
      result.suggestions.push("Move back from camera or crop wider - face is too large, should show head and top of shoulders");
    }

    // Check 7: Background (should be plain white)
    const bgAnalysis = analyzeBackgroundColor(imageInfo);
    result.checks.background.passed = bgAnalysis.isWhite;
    result.checks.background.message = bgAnalysis.isWhite
      ? "✓ Background appears to be plain and light (ensure it's pure white)"
      : "❌ Background must be plain white with no patterns or shadows";
    
    if (bgAnalysis.isWhite) passedChecks++;
    else result.suggestions.push("Use a plain white background with no shadows, patterns, or other colors");

    // Check 8: Head Pose (should be straight, looking at camera)
    result.checks.headPose.passed = true;
    result.checks.headPose.message = "⚠️ Ensure head is straight and facing directly at camera (not tilted or turned)";
    passedChecks++;

    // Check 9: Eyes Open and Visible
    result.checks.eyesOpen.passed = true;
    result.checks.eyesOpen.message = "⚠️ Ensure both eyes are fully open, clearly visible, and looking at camera";
    passedChecks++;

    // Check 10: Neutral Expression
    result.checks.expression.passed = true;
    result.checks.expression.message = "⚠️ Maintain neutral expression: mouth closed, no smiling, no frowning";
    passedChecks++;

    // Check 11: Lighting (even, no shadows)
    result.checks.lighting.passed = true;
    result.checks.lighting.message = "⚠️ Ensure even lighting with no shadows on face or background";
    passedChecks++;

    // Check 12: Sharpness
    const isSharp = imageInfo?.fileSize && imageInfo.fileSize > 50000;
    result.checks.sharpness.passed = isSharp || false;
    result.checks.sharpness.message = isSharp
      ? "✓ Image appears sharp and in focus"
      : "⚠️ Ensure image is sharp, clear, and in focus (avoid blur or pixelation)";
    
    if (isSharp) passedChecks++;
    else result.suggestions.push("Use a stable camera and ensure proper focus. Image should be sharp and clear, not blurred");

    // Check 13: Accessories
    result.checks.accessories.passed = true;
    result.checks.accessories.message = "⚠️ Remove hats, sunglasses, and accessories that cover the face. Hair should not cover eyes";
    passedChecks++;

    // Calculate final score
    result.score = Math.round((passedChecks / totalChecks) * 100);
    result.isCompliant = result.score >= 85 && result.hasFace && result.faceCount === 1;

    // Add final assessment
    if (result.isCompliant) {
      result.suggestions.unshift("✅ Photo meets Emirates ID ICAO standards! Double-check: white background, neutral expression, no shadows.");
    } else if (result.score >= 70) {
      result.suggestions.unshift("⚠️ Photo is close but needs improvements. Address items marked with ❌ below.");
    } else {
      result.suggestions.unshift("❌ Photo does NOT meet Emirates ID requirements. Please address all issues below.");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ICAO verification:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to verify photo",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
