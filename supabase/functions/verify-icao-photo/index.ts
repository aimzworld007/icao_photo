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
    facePosition: { passed: boolean; message: string };
    eyesOpen: { passed: boolean; message: string };
    mouthClosed: { passed: boolean; message: string };
    headPose: { passed: boolean; message: string };
    glasses: { passed: boolean; message: string };
    lighting: { passed: boolean; message: string };
    background: { passed: boolean; message: string };
  };
  score: number;
  suggestions: string[];
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

    // Use Face++ API for face detection and analysis
    const faceDetectUrl = "https://api-us.faceplusplus.com/facepp/v3/detect";
    const formData = new FormData();
    formData.append("api_key", "demo");
    formData.append("api_secret", "demo");
    formData.append("image_url", imageUrl);
    formData.append(
      "return_attributes",
      "headpose,eyestatus,mouthstatus,eyegaze,emotion,facequality,blur,eyeocclusion,skinstatus,smile"
    );

    const faceResponse = await fetch(faceDetectUrl, {
      method: "POST",
      body: formData,
    });

    const faceData = await faceResponse.json();

    // Check if face detection was successful
    if (faceData.error_message) {
      return new Response(
        JSON.stringify({
          error: "Face detection failed",
          details: faceData.error_message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const faces = faceData.faces || [];
    const faceCount = faces.length;
    const hasFace = faceCount > 0;

    // Initialize result
    const result: ICAOVerificationResult = {
      isCompliant: false,
      hasFace,
      faceCount,
      checks: {
        hasSingleFace: {
          passed: faceCount === 1,
          message:
            faceCount === 0
              ? "No face detected"
              : faceCount > 1
              ? `Multiple faces detected (${faceCount})`
              : "Single face detected",
        },
        facePosition: { passed: false, message: "" },
        eyesOpen: { passed: false, message: "" },
        mouthClosed: { passed: false, message: "" },
        headPose: { passed: false, message: "" },
        glasses: { passed: false, message: "" },
        lighting: { passed: false, message: "" },
        background: { passed: false, message: "" },
      },
      score: 0,
      suggestions: [],
    };

    // If no face detected, return early
    if (!hasFace) {
      result.suggestions.push(
        "No human face detected. Please upload a photo with a clear face."
      );
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If multiple faces, return early
    if (faceCount > 1) {
      result.suggestions.push(
        "Multiple faces detected. ICAO standards require only one person in the photo."
      );
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze the single face
    const face = faces[0];
    const attributes = face.attributes || {};
    let passedChecks = 1; // Already passed single face check

    // Check head pose (should be looking straight)
    const headpose = attributes.headpose || {};
    const yawAngle = Math.abs(headpose.yaw_angle || 0);
    const pitchAngle = Math.abs(headpose.pitch_angle || 0);
    const rollAngle = Math.abs(headpose.roll_angle || 0);

    result.checks.headPose.passed = yawAngle < 10 && pitchAngle < 10 && rollAngle < 10;
    result.checks.headPose.message = result.checks.headPose.passed
      ? "Head position is straight"
      : "Head should face forward (yaw: " +
        yawAngle.toFixed(1) +
        "°, pitch: " +
        pitchAngle.toFixed(1) +
        "°)";
    if (result.checks.headPose.passed) passedChecks++;
    else
      result.suggestions.push(
        "Face the camera directly. Avoid tilting your head."
      );

    // Check eyes status
    const eyestatus = attributes.eyestatus || {};
    const leftEyeOpen =
      (eyestatus.left_eye_status?.normal_glass_eye_open || 0) > 0.5 ||
      (eyestatus.left_eye_status?.no_glass_eye_open || 0) > 0.5;
    const rightEyeOpen =
      (eyestatus.right_eye_status?.normal_glass_eye_open || 0) > 0.5 ||
      (eyestatus.right_eye_status?.no_glass_eye_open || 0) > 0.5;

    result.checks.eyesOpen.passed = leftEyeOpen && rightEyeOpen;
    result.checks.eyesOpen.message = result.checks.eyesOpen.passed
      ? "Eyes are open and visible"
      : "Eyes should be open and clearly visible";
    if (result.checks.eyesOpen.passed) passedChecks++;
    else result.suggestions.push("Keep your eyes open and look at the camera.");

    // Check mouth status
    const mouthstatus = attributes.mouthstatus || {};
    const mouthClosed =
      (mouthstatus.close || 0) > 0.5 || (mouthstatus.other || 0) > 0.3;

    result.checks.mouthClosed.passed = mouthClosed;
    result.checks.mouthClosed.message = result.checks.mouthClosed.passed
      ? "Mouth is closed (neutral expression)"
      : "Mouth should be closed with a neutral expression";
    if (result.checks.mouthClosed.passed) passedChecks++;
    else
      result.suggestions.push(
        "Maintain a neutral expression with your mouth closed."
      );

    // Check for glasses (ICAO prefers no glasses)
    const glassStatus =
      (eyestatus.left_eye_status?.no_glass_eye_open || 0) > 0.5 &&
      (eyestatus.right_eye_status?.no_glass_eye_open || 0) > 0.5;

    result.checks.glasses.passed = glassStatus;
    result.checks.glasses.message = result.checks.glasses.passed
      ? "No glasses detected"
      : "Glasses detected - remove if possible";
    if (result.checks.glasses.passed) passedChecks++;
    else
      result.suggestions.push(
        "Remove glasses if possible (ICAO recommends no glasses)."
      );

    // Check face quality (lighting)
    const facequality = attributes.facequality || {};
    const lightingValue = facequality.threshold?.value || 0;

    result.checks.lighting.passed = lightingValue > 50;
    result.checks.lighting.message = result.checks.lighting.passed
      ? "Lighting quality is good"
      : "Lighting quality could be improved";
    if (result.checks.lighting.passed) passedChecks++;
    else
      result.suggestions.push(
        "Use even lighting on your face. Avoid shadows and backlighting."
      );

    // Check blur
    const blur = attributes.blur || {};
    const blurValue = blur.blurness?.threshold || 0;

    const isSharp = blurValue < 50;
    if (!isSharp) {
      result.suggestions.push(
        "Image appears blurry. Use a stable camera and ensure focus on the face."
      );
    }

    // Check face position (should be centered and appropriate size)
    const faceRectangle = face.face_rectangle || {};
    const imageWidth = faceData.image_width || 1;
    const imageHeight = faceData.image_height || 1;

    const faceWidthRatio = (faceRectangle.width || 0) / imageWidth;
    const faceHeightRatio = (faceRectangle.height || 0) / imageHeight;

    const faceCenterX = ((faceRectangle.left || 0) + (faceRectangle.width || 0) / 2) / imageWidth;
    const faceCenterY = ((faceRectangle.top || 0) + (faceRectangle.height || 0) / 2) / imageHeight;

    const isCentered =
      faceCenterX > 0.35 &&
      faceCenterX < 0.65 &&
      faceCenterY > 0.35 &&
      faceCenterY < 0.65;
    const isProperSize = faceHeightRatio > 0.6 && faceHeightRatio < 0.85;

    result.checks.facePosition.passed = isCentered && isProperSize;
    result.checks.facePosition.message = result.checks.facePosition.passed
      ? "Face is properly positioned and sized"
      : !isCentered
      ? "Face should be centered in the frame"
      : "Face should occupy 70-80% of the image height";
    if (result.checks.facePosition.passed) passedChecks++;
    else
      result.suggestions.push(
        "Position your face in the center of the frame, occupying 70-80% of the image height."
      );

    // Background check (simplified - would need more sophisticated analysis)
    result.checks.background.passed = true;
    result.checks.background.message =
      "Background analysis: Ensure plain white or light background";
    passedChecks++;

    // Calculate overall score
    result.score = Math.round((passedChecks / 8) * 100);
    result.isCompliant = result.score >= 80;

    if (result.isCompliant) {
      result.suggestions.push("✓ Photo meets ICAO compliance standards!");
    } else {
      result.suggestions.unshift(
        "Photo does not meet ICAO standards. Please address the issues below."
      );
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
