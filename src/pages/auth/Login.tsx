import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/features/auth/authSlice";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData) as any);
  };

  if (isAuthenticated) {
    navigate("/home"); // Redirect to home page after login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:scale-105">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-fade-in">
            Welcome Back to <span className="text-amber-600">MetaBuzz</span>
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in-delay">
            Your gateway to <span className="font-semibold text-teal-600">connecting, sharing, and thriving</span> in a vibrant community.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 focus:ring-4 focus:ring-teal-300 focus:outline-none transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-teal-600 hover:text-teal-700 font-semibold transition-all"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;