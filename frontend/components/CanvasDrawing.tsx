"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Send } from "lucide-react";

export function CanvasDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [recognitionResult, setRecognitionResult] = useState<number | null>(null);
  const letters = [
    'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ',
    'ಒ', 'ಓ', 'ಔ', 'ಅಂ', 'ಅಃ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ',
    'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
    'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ',
    'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'
  ];
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Enable image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set initial canvas state
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8; // Increased line width for better visibility
    ctx.lineCap = "round";
    ctx.lineJoin = "round"; // Smooth line joins
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === "pen" ? "white" : "black";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setRecognitionResult(null); // Clear the previous result
  };

  const processImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement("canvas");
    const scaleFactor = 4; // Increase internal resolution
    tempCanvas.width = 28 * scaleFactor;
    tempCanvas.height = 28 * scaleFactor;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) return;

    // Enable high-quality image processing
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    // Draw with higher resolution
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);

    // Create final 28x28 canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = 28;
    finalCanvas.height = 28;
    const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!finalCtx) return;

    // Enable high-quality downsampling
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    // Draw final image
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, 28, 28);
    finalCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, 28, 28);

    // Get the processed image as base64 with maximum quality JPEG
    const processedImage = finalCanvas.toDataURL("image/jpeg", 1.0);
    const backendURL=process.env.NEXT_PUBLIC_BACKEND_URL;
    // Send to backend
    try {
      const response = await fetch(`${backendURL}/api/recognize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: processedImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send image to server");
      }

      const data = await response.json();
      setRecognitionResult(data.prediction); // Store the prediction from backend
      console.log("Recognition result:", data);
    } catch (error) {
      console.error("Error sending image:", error);
      setRecognitionResult(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-4">
        <Button
          variant={tool === "pen" ? "default" : "outline"}
          onClick={() => setTool("pen")}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Pen
        </Button>
        <Button variant="outline" onClick={clearCanvas}>
          Clear
        </Button>
      </div>

      <div className="border-4 border-gray-300 rounded-lg">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
        />
      </div>

      {recognitionResult !== null && (
        <div className="mt-4 text-xl font-bold">
          Recognized Alphabet: {letters[recognitionResult-1]}
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <Button onClick={processImage} className="gap-2">
          <Send className="w-4 h-4" />
          Submit
        </Button>
        <Button variant="outline" onClick={processImage} className="gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
}