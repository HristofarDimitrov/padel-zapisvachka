import React, { useState, useEffect } from "react";
import { Tournament } from "../types/tournament";
import {
  getAllTournaments,
  getTournamentByCode,
  joinTournament,
} from "../services/tournamentService";
import { Player } from "../types/tournament";
import { Calendar, Users, Trophy, AlertCircle, Loader2, Copy, Check } from "lucide-react";

interface PlayerDashboardProps {
  currentPlayer: Player;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ currentPlayer }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "ongoing" | "past">("upcoming");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const allTournaments = await getAllTournaments();
      setTournaments(allTournaments);
    } catch (error) {
      console.error("Error loading tournaments:", error);
      setError("Failed to load tournaments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const tournament = await getTournamentByCode(joinCode);
      if (!tournament) {
        setError("Invalid tournament code");
        return;
      }

      if (tournament.status !== "upcoming") {
        setError("This tournament is no longer accepting players");
        return;
      }

      if (tournament.currentPlayers >= tournament.maxPlayers) {
        setError("This tournament is full");
        return;
      }

      const success = await joinTournament(tournament.id, {
        id: currentPlayer.id,
        name: currentPlayer.name,
        joinedAt: new Date().toISOString(),
      });

      if (success) {
        setJoinCode("");
        loadTournaments();
      } else {
        setError("Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      setError("Failed to join tournament");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    switch (activeTab) {
      case "upcoming":
        return tournament.status === "upcoming";
      case "ongoing":
        return tournament.status === "ongoing";
      case "past":
        return tournament.status === "completed";
      default:
        return true;
    }
  });

  const getTabCount = (status: "upcoming" | "ongoing" | "past") => {
    return tournaments.filter((t) => {
      switch (status) {
        case "upcoming":
          return t.status === "upcoming";
        case "ongoing":
          return t.status === "ongoing";
        case "past":
          return t.status === "completed";
        default:
          return false;
      }
    }).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {currentPlayer.name}!
          </h1>
          <p className="text-gray-600">
            Join tournaments and track your progress
          </p>
        </div>

        {/* Join Tournament Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-blue-500" />
              Join Tournament
            </h2>
          </div>
          <form onSubmit={handleJoinTournament} className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tournament code"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join"
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Tournaments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Tournaments</h2>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium border-b-2 ${activeTab === "upcoming"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Upcoming ({getTabCount("upcoming")})
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium border-b-2 ${activeTab === "ongoing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Ongoing ({getTabCount("ongoing")})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium border-b-2 ${activeTab === "past"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Past ({getTabCount("past")})
              </button>
            </nav>
          </div>

          {/* Tournaments List */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No tournaments found</p>
              </div>
            ) : (
              filteredTournaments.map((tournament) => (
                <div key={tournament.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(tournament.date).toLocaleString()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {tournament.currentPlayers}/{tournament.maxPlayers} Players
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {tournament.status === "upcoming" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Code:</span>
                        <button
                          onClick={() => handleCopyCode(tournament.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {copiedCode === tournament.id ? (
                            <>
                              <Check className="h-4 w-4 mr-1 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              {tournament.id}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Players List */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Players</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {tournament.players.map((player) => (
                        <div
                          key={player.id}
                          className={`p-2 rounded-md ${player.id === currentPlayer.id
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{player.name}</span>
                            {player.position && (
                              <span className="text-xs text-gray-500">
                                Position: {player.position}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
