import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import AdminDashboard from "./components/AdminDashboard";
import PlayerDashboard from "./components/PlayerDashboard";
import { Admin, Player } from "./types/tournament";
import { signOut } from "./services/authService";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentUser, setCurrentUser] = useState<Admin | Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          setCurrentUser({ id: adminDoc.id, ...adminDoc.data() } as Admin);
        } else {
          // Check if user is player
          const playerDoc = await getDoc(doc(db, "players", user.uid));
          if (playerDoc.exists()) {
            setCurrentUser({ id: playerDoc.id, ...playerDoc.data() } as Player);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = (admin: Admin) => {
    setCurrentUser(admin);
  };

  const handlePlayerLogin = (player: Player) => {
    setCurrentUser(player);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Auth onAdminLogin={handleAdminLogin} onPlayerLogin={handlePlayerLogin} />
    );
  }

  const isAdmin = "role" in currentUser && currentUser.role === "admin";
  const displayName = isAdmin ? "Admin" : (currentUser as Player).name;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">
                  {isAdmin ? "Admin Dashboard" : "Player Dashboard"}
                </h1>
              </div>
              <div className="flex items-center">
                <span className="mr-4">{displayName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <PlayerDashboard currentPlayer={currentUser as Player} />
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
