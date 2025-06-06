import React, { useState } from "react";
import {
  signInAdmin,
  signInPlayer,
  createPlayerAccount,
} from "../services/authService";
import { Admin, Player } from "../types/tournament";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthProps {
  onAdminLogin: (admin: Admin) => void;
  onPlayerLogin: (player: Player) => void;
}

const Auth: React.FC<AuthProps> = ({ onAdminLogin, onPlayerLogin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isAdmin) {
        const admin = await signInAdmin(formData.email, formData.password);
        if (admin) {
          onAdminLogin(admin);
        } else {
          setError("Invalid admin credentials");
        }
      } else {
        if (isSignUp) {
          const player = await createPlayerAccount(
            formData.email,
            formData.password,
            formData.name
          );
          if (player) {
            onPlayerLogin(player);
          } else {
            setError("Failed to create account");
          }
        } else {
          const player = await signInPlayer(formData.email, formData.password);
          if (player) {
            onPlayerLogin(player);
          } else {
            setError("Invalid credentials");
          }
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: "player" | "signup" | "admin") => {
    setIsAdmin(mode === "admin");
    setIsSignUp(mode === "signup");
    setError("");
    setFormData({ email: "", password: "", name: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isAdmin
              ? "Admin Login"
              : isSignUp
                ? "Create Account"
                : "Player Login"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isAdmin
              ? "Access the admin dashboard"
              : isSignUp
                ? "Create your player account"
                : "Sign in to your player account"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleModeChange("player")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${!isAdmin && !isSignUp
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Player Login
            </button>
            <button
              onClick={() => handleModeChange("signup")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${isSignUp
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleModeChange("admin")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${isAdmin
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {!isAdmin && isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {!isAdmin && !isSignUp && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    {isAdmin
                      ? "Sign in as Admin"
                      : isSignUp
                        ? "Create Account"
                        : "Sign in as Player"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
