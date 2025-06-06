import React, { useState } from "react";
import {
  signInAdmin,
  signInPlayer,
  createPlayerAccount,
} from "../services/authService";
import { Admin, Player } from "../types/tournament";

interface AuthProps {
  onAdminLogin: (admin: Admin) => void;
  onPlayerLogin: (player: Player) => void;
}

const Auth: React.FC<AuthProps> = ({ onAdminLogin, onPlayerLogin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdmin
              ? "Admin Login"
              : isSignUp
              ? "Create Account"
              : "Player Login"}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setIsAdmin(false);
                setIsSignUp(false);
                setError("");
              }}
              className={`px-4 py-2 rounded ${
                !isAdmin ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Player Login
            </button>
            <button
              onClick={() => {
                setIsAdmin(false);
                setIsSignUp(true);
                setError("");
              }}
              className={`px-4 py-2 rounded ${
                isSignUp ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setIsAdmin(true);
                setIsSignUp(false);
                setError("");
              }}
              className={`px-4 py-2 rounded ${
                isAdmin ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Admin Login
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              {!isAdmin && isSignUp && (
                <div>
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isAdmin
                  ? "Sign in as Admin"
                  : isSignUp
                  ? "Create Account"
                  : "Sign in as Player"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
