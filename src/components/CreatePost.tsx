import { useState, useRef } from "react";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
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
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </label>
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
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Publishing...
              </div>
            ) : (
              "Share Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
