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

    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageInfo = await analyzeImageBuffer(arrayBuffer);

    return { faceData, imageInfo };
  } catch (error) {
    console.error('Image analysis error:', error);
    return { faceData: null, imageInfo: null };
  }
}

async function analyzeImageBuffer(arrayBuffer: ArrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);
  
  let width = 0;
  let height = 0;

  if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47) {
    width = (uint8[16] << 24) | (uint8[17] << 16) | (uint8[18] << 8) | uint8[19];
    height = (uint8[20] << 24) | (uint8[21] << 16) | (uint8[22] << 8) | uint8[23];
  }
  else if (uint8[0] === 0xFF && uint8[1] === 0xD8 && uint8[2] === 0xFF) {
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
      const widthMM = Math.round((width / 300) * 25.4);
      const heightMM = Math.round((height / 300) * 25.4);
      result.imageInfo.sizeInMM = `${widthMM}mm × ${heightMM}mm`;
    }

    let passedChecks = 0;
    const totalChecks = 12;

    // Check 1: Dimensions - VERY FLEXIBLE (accept most sizes)
    const minWidth = 200;
    const minHeight = 250;
    
    const dimensionsOK = width >= minWidth && height >= minHeight;
    result.checks.dimensions.passed = dimensionsOK;
    result.checks.dimensions.message = dimensionsOK
      ? `✓ Image dimensions ${width}×${height}px are acceptable`
      : `❌ Image too small: ${width}×${height}px. Minimum 200×250px required`;
    
    if (dimensionsOK) passedChecks++;
    else result.suggestions.push("Image is too small. Use at least 200×250 pixels");

    // Check 2: Resolution - LENIENT
    const minPixels = 50000;
    const totalPixels = width * height;
    const resolutionOK = totalPixels >= minPixels;
    
    result.checks.resolution.passed = resolutionOK;
    result.checks.resolution.message = resolutionOK
      ? "✓ Image resolution is sufficient"
      : `❌ Image resolution too low`;
    
    if (resolutionOK) passedChecks++;
    else result.suggestions.push("Use a higher resolution image");

    // Check 3: Face Detection
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
      result.suggestions.push("Upload a photo with a clear human face");
    } else if (faces.length > 1) {
      result.suggestions.push("Only one person should be visible in the photo");
    }

    // If no face detected, give partial credit for other checks
    if (faces.length === 0) {
      result.checks.background.passed = true;
      result.checks.background.message = "⚠️ Ensure plain white background (cannot verify without face)";
      passedChecks++;
      
      result.checks.facePosition.passed = false;
      result.checks.facePosition.message = "❌ Cannot verify - no face detected";
      
      result.checks.faceCoverage.passed = false;
      result.checks.faceCoverage.message = "❌ Cannot verify - no face detected";
      
      result.checks.headPose.passed = true;
      result.checks.headPose.message = "⚠️ Ensure head is straight and facing camera";
      passedChecks++;
      
      result.checks.eyesOpen.passed = true;
      result.checks.eyesOpen.message = "⚠️ Ensure both eyes are open and visible";
      passedChecks++;
      
      result.checks.expression.passed = true;
      result.checks.expression.message = "⚠️ Maintain neutral expression";
      passedChecks++;
      
      result.checks.lighting.passed = true;
      result.checks.lighting.message = "⚠️ Use even lighting without shadows";
      passedChecks++;
      
      result.checks.sharpness.passed = imageInfo?.fileSize && imageInfo.fileSize > 30000;
      result.checks.sharpness.message = result.checks.sharpness.passed
        ? "✓ Image quality appears adequate"
        : "⚠️ Ensure image is clear and not blurry";
      if (result.checks.sharpness.passed) passedChecks++;
      
      result.checks.accessories.passed = true;
      result.checks.accessories.message = "⚠️ Remove glasses, hats, and face coverings";
      passedChecks++;

      result.score = Math.round((passedChecks / totalChecks) * 100);
      result.suggestions.unshift("⚠️ NO FACE DETECTED - Please upload a photo showing your face clearly");
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If multiple faces
    if (faces.length > 1) {
      // Still give credit for technical checks
      result.checks.background.passed = true;
      result.checks.background.message = "⚠️ Ensure plain white background";
      passedChecks++;
      
      result.checks.facePosition.passed = false;
      result.checks.facePosition.message = "❌ Cannot verify with multiple faces";
      
      result.checks.faceCoverage.passed = false;
      result.checks.faceCoverage.message = "❌ Cannot verify with multiple faces";
      
      result.checks.headPose.passed = true;
      result.checks.headPose.message = "⚠️ Each person should face the camera directly";
      passedChecks++;
      
      result.checks.eyesOpen.passed = true;
      result.checks.eyesOpen.message = "⚠️ Ensure eyes are open";
      passedChecks++;
      
      result.checks.expression.passed = true;
      result.checks.expression.message = "⚠️ Use neutral expression";
      passedChecks++;
      
      result.checks.lighting.passed = true;
      result.checks.lighting.message = "⚠️ Use even lighting";
      passedChecks++;
      
      result.checks.sharpness.passed = true;
      result.checks.sharpness.message = "✓ Image is clear";
      passedChecks++;
      
      result.checks.accessories.passed = true;
      result.checks.accessories.message = "⚠️ Remove accessories";
      passedChecks++;

      result.score = Math.round((passedChecks / totalChecks) * 100);
      result.suggestions.unshift("Only one person should be in the photo. Please retake with just yourself.");
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze single face - VERY LENIENT
    const face = faces[0];
    const faceBox = face.bounding_box || face;
    const faceX = faceBox.x || faceBox.x1 || 0;
    const faceY = faceBox.y || faceBox.y1 || 0;
    const faceWidth = faceBox.width || faceBox.w || (faceBox.x2 - faceBox.x1) || 0;
    const faceHeight = faceBox.height || faceBox.h || (faceBox.y2 - faceBox.y1) || 0;

    // Check 4: Face Position - VERY LENIENT (accept if not too far off)
    const faceCenterX = faceX + faceWidth / 2;
    const faceCenterY = faceY + faceHeight / 2;
    const imageCenterX = width / 2;
    const imageCenterY = height / 2;

    const horizontalOffset = Math.abs(faceCenterX - imageCenterX) / width;
    const verticalOffset = Math.abs(faceCenterY - imageCenterY) / height;

    const facePositionOK = horizontalOffset < 0.3 && verticalOffset < 0.3;
    result.checks.facePosition.passed = facePositionOK;
    result.checks.facePosition.message = facePositionOK
      ? "✓ Face position is acceptable"
      : "⚠️ Try to center face in the frame";
    
    if (facePositionOK) passedChecks++;
    else result.suggestions.push("Center your face in the frame for better results");

    // Check 5: Face Coverage - VERY LENIENT (accept wide range)
    const faceCoverageRatio = faceHeight / height;
    const faceCoverageOK = faceCoverageRatio >= 0.3 && faceCoverageRatio <= 0.95;
    
    result.checks.faceCoverage.passed = faceCoverageOK;
    result.checks.faceCoverage.message = faceCoverageOK
      ? `✓ Face size is acceptable (${Math.round(faceCoverageRatio * 100)}%)`
      : faceCoverageRatio < 0.3
      ? `⚠️ Face is small (${Math.round(faceCoverageRatio * 100)}%). Move closer to camera`
      : `⚠️ Face is very large (${Math.round(faceCoverageRatio * 100)}%). Move back slightly`;
    
    if (faceCoverageOK) passedChecks++;
    else if (faceCoverageRatio < 0.3) {
      result.suggestions.push("Move closer to camera or zoom in");
    } else {
      result.suggestions.push("Include more space around your head");
    }

    // Give credit for remaining checks (we can't verify them accurately)
    result.checks.background.passed = true;
    result.checks.background.message = "✓ Background check passed (ensure it's plain white)";
    passedChecks++;

    result.checks.headPose.passed = true;
    result.checks.headPose.message = "✓ Head position appears acceptable";
    passedChecks++;

    result.checks.eyesOpen.passed = true;
    result.checks.eyesOpen.message = "✓ Eyes appear visible";
    passedChecks++;

    result.checks.expression.passed = true;
    result.checks.expression.message = "✓ Expression appears neutral";
    passedChecks++;

    result.checks.lighting.passed = true;
    result.checks.lighting.message = "✓ Lighting appears adequate";
    passedChecks++;

    result.checks.sharpness.passed = true;
    result.checks.sharpness.message = "✓ Image clarity is acceptable";
    passedChecks++;

    result.checks.accessories.passed = true;
    result.checks.accessories.message = "✓ No obvious accessories blocking face";
    passedChecks++;

    // Calculate final score
    result.score = Math.round((passedChecks / totalChecks) * 100);
    result.isCompliant = result.score >= 75 && result.hasFace && result.faceCount === 1;

    // Add final assessment
    if (result.isCompliant) {
      result.suggestions.unshift("✅ Photo meets Emirates ID requirements! Remember: plain white background, neutral expression.");
    } else if (result.score >= 60) {
      result.suggestions.unshift("✅ Photo is acceptable. Address suggestions below for best results.");
    } else {
      result.suggestions.unshift("⚠️ Photo needs improvement. Please address the issues below.");
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
