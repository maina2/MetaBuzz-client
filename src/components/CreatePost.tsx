import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createPost } from "../redux/features/posts/postSlice";

const CreatePost = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(
          videoRef.current, 
          0, 0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        
        // Convert canvas to Blob (File)
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-photo.jpg", {
              type: "image/jpeg"
            });
            setImage(file);
            setImagePreview(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.95);
      }
    }
    stopCamera();
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !image) || isSubmitting) return;

    setIsSubmitting(true);
    await dispatch(createPost({ content, image }));
    setContent("");
    setImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  if (!authUser) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          Share Your Thoughts
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-start mb-4">
          {authUser.profile_picture ? (
            <img
              src={authUser.profile_picture}
              alt={`${authUser.username}'s avatar`}
              className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold mr-3">
              {authUser.username.charAt(0).toUpperCase()}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your world today?"
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
            rows={3}
          ></textarea>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mb-4 inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Camera Preview */}
        {cameraActive && (
          <div className="mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full rounded-lg border border-gray-200"
            />
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={captureImage}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            {/* File Upload */}
            <label className="cursor-pointer flex items-center text-gray-600 hover:text-teal-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </label>

            {/* Camera Button */}
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center text-gray-600 hover:text-teal-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Camera
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !image) || isSubmitting}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              (!content.trim() && !image) || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-md"
            }`}
          >
            {isSubmitting ? "Publishing..." : "Share Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;