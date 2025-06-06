import React, { useState, useEffect } from "react";
import { Tournament } from "../types/tournament";
import {
  createTournament,
  getAllTournaments,
  updateTournamentStatus,
  updatePlayerPosition,
  shufflePlayers,
  deleteTournament,
  addPlayerToTournament,
  removePlayerFromTournament,
} from "../services/tournamentService";
import { Trash2, AlertTriangle, UserPlus, X, Calendar, Users, Trophy, Settings, Plus, Clock, CheckCircle, Copy, Check } from "lucide-react";
import { AddPlayerModal } from "./AddPlayerModal";

type TournamentTab = "upcoming" | "ongoing" | "past";

const AdminDashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newTournament, setNewTournament] = useState({
    date: "",
    maxPlayers: 4,
  });
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TournamentTab>("upcoming");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    tournaments.forEach((tournament) => {
      console.log("=== TOURNAMENT DEBUG INFO ===");
      console.log("ID:", tournament.id);
      console.log("Status:", tournament.status);
      console.log("Players:", tournament.players);
      console.log("Players Count:", tournament.players.length);
      console.log(
        "Is Shuffle Button Disabled:",
        tournament.status !== "ongoing" || tournament.players.length === 0
      );
      console.log("==========================");
    });
  }, [tournaments]);

  const loadTournaments = async () => {
    const allTournaments = await getAllTournaments();
    setTournaments(allTournaments);
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const tournamentId = await createTournament(
      newTournament.date,
      newTournament.maxPlayers,
      "admin-id" // This should come from the authenticated admin
    );
    if (tournamentId) {
      setNewTournament({ date: "", maxPlayers: 8 });
      loadTournaments();
    }
  };

  const handleUpdateStatus = async (
    tournamentId: string,
    status: Tournament["status"]
  ) => {
    await updateTournamentStatus(tournamentId, status);
    loadTournaments();
  };

  const handleUpdatePosition = async (
    tournamentId: string,
    playerId: string,
    position: number
  ) => {
    await updatePlayerPosition(tournamentId, playerId, position);
    loadTournaments();
  };

  const handleShuffle = async (tournamentId: string) => {
    console.log("=== SHUFFLE BUTTON CLICKED ===");
    console.log("Tournament ID:", tournamentId);
    try {
      // Get current tournament data
      const tournament = tournaments.find((t) => t.id === tournamentId);
      console.log("Tournament found:", !!tournament);
      console.log("Tournament status:", tournament?.status);
      console.log("Number of players:", tournament?.players.length);

      if (!tournament) {
        console.error("Tournament not found");
        return;
      }

      if (tournament.status !== "ongoing") {
        console.error("Tournament is not in ongoing state");
        return;
      }

      if (tournament.players.length === 0) {
        console.error("No players to shuffle");
        return;
      }

      console.log("Calling shufflePlayers function...");
      await shufflePlayers(tournamentId);
      console.log("Shuffle completed, reloading tournaments...");
      await loadTournaments();
      console.log("Tournaments reloaded");
    } catch (error) {
      console.error("Error in handleShuffle:", error);
    }
  };

  const handleDeleteTournament = async (tournament: Tournament) => {
    setTournamentToDelete(tournament);
  };

  const confirmDelete = async () => {
    if (!tournamentToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteTournament(tournamentToDelete.id);
      if (success) {
        await loadTournaments();
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
    } finally {
      setIsDeleting(false);
      setTournamentToDelete(null);
    }
  };

  const handleAddPlayer = async (player: { id?: string; name: string; email?: string }) => {
    if (!selectedTournament) return;

    try {
      await addPlayerToTournament(selectedTournament.id, player);
      await loadTournaments();
    } catch (error) {
      console.error("Error adding player:", error);
      throw error;
    }
  };

  const handleRemovePlayer = async (tournamentId: string, playerId: string) => {
    try {
      await removePlayerFromTournament(tournamentId, playerId);
      await loadTournaments();
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
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

  const getTabCount = (status: TournamentTab) => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tournament Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Tournament
          </button>
        </div>

        {/* Create Tournament Form */}
        {showCreateForm && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Tournament</h2>
            </div>
            <form onSubmit={handleCreateTournament} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newTournament.date}
                    onChange={(e) =>
                      setNewTournament({ ...newTournament, date: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Players
                  </label>
                  <input
                    type="number"
                    value={newTournament.maxPlayers}
                    onChange={(e) =>
                      setNewTournament({
                        ...newTournament,
                        maxPlayers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    min="2"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tournament Tabs */}
        <div className="mb-4 sm:mb-6 border-b border-gray-200">
          <nav className="-mb-px flex justify-between sm:justify-start sm:space-x-8">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`${activeTab === "upcoming"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 sm:flex-none whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center justify-center sm:justify-start`}
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Up</span>
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {getTabCount("upcoming")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ongoing")}
              className={`${activeTab === "ongoing"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 sm:flex-none whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center justify-center sm:justify-start`}
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Ongoing</span>
              <span className="sm:hidden">Now</span>
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {getTabCount("ongoing")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`${activeTab === "past"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 sm:flex-none whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center justify-center sm:justify-start`}
            >
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Past</span>
              <span className="sm:hidden">Past</span>
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {getTabCount("past")}
              </span>
            </button>
          </nav>
        </div>

        {/* Tournaments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredTournaments.length === 0 ? (
            <div className="col-span-2 text-center py-8 sm:py-12">
              <div className="text-gray-500">
                {activeTab === "upcoming" && (
                  <>
                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg font-medium">No upcoming tournaments</p>
                    <p className="mt-1 text-sm sm:text-base">Create a new tournament to get started</p>
                  </>
                )}
                {activeTab === "ongoing" && (
                  <>
                    <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg font-medium">No ongoing tournaments</p>
                    <p className="mt-1 text-sm sm:text-base">Start an upcoming tournament to see it here</p>
                  </>
                )}
                {activeTab === "past" && (
                  <>
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg font-medium">No past tournaments</p>
                    <p className="mt-1 text-sm sm:text-base">Complete tournaments will appear here</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        <Calendar className="inline-block h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                        {new Date(tournament.date).toLocaleString()}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {tournament.currentPlayers}/{tournament.maxPlayers} Players
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${tournament.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-800"
                        : tournament.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDeleteTournament(tournament)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                        title="Delete tournament"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Join Code</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {tournament.joinCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(tournament.joinCode)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Copy join code"
                        >
                          {copiedCode === tournament.joinCode ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => handleUpdateStatus(tournament.id, "ongoing")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={tournament.status !== "upcoming"}
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Start
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(tournament.id, "completed")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={tournament.status !== "ongoing"}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleShuffle(tournament.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        tournament.status !== "ongoing" ||
                        tournament.players.length === 0
                      }
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Shuffle
                    </button>
                    <button
                      onClick={() => setSelectedTournament(tournament)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={tournament.currentPlayers >= tournament.maxPlayers}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Player
                    </button>
                  </div>

                  {/* Players List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Players</h4>
                    {tournament.players.length === 0 ? (
                      <p className="text-sm text-gray-500">No players joined yet</p>
                    ) : (
                      <div className="space-y-3">
                        {Array.from(
                          new Set(tournament.players.map((p) => p.position || 0))
                        )
                          .sort()
                          .map((position) => {
                            const pairPlayers = tournament.players.filter(
                              (p) => (p.position || 0) === position
                            );
                            return (
                              <div
                                key={`pair-${position}`}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="font-medium text-sm text-gray-700 mb-2">
                                  Pair {position || "Unassigned"}
                                </div>
                                <div className="space-y-2">
                                  {pairPlayers.map((player) => (
                                    <div
                                      key={`player-${player.id}`}
                                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-md p-2 shadow-sm gap-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">
                                          {player.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          (Player {player.pairNumber || "Unassigned"})
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="number"
                                          value={player.position || ""}
                                          onChange={(e) =>
                                            handleUpdatePosition(
                                              tournament.id,
                                              player.id,
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-16 px-2 py-1 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Position"
                                          min="1"
                                        />
                                        <button
                                          onClick={() =>
                                            handleRemovePlayer(tournament.id, player.id)
                                          }
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                          title="Remove player"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Teams List */}
                  {tournament.teams && tournament.teams.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Teams</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tournament.teams.map((team) => (
                          <div
                            key={team.id}
                            className="bg-blue-50 rounded-lg p-3 text-sm"
                          >
                            <div className="font-medium text-blue-900 mb-1">
                              {team.id}
                            </div>
                            <div className="space-y-1">
                              {team.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="text-blue-800"
                                >
                                  {player.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold">Delete Tournament</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the tournament scheduled for{" "}
              {new Date(tournamentToDelete.date).toLocaleString()}? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setTournamentToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {selectedTournament && (
        <AddPlayerModal
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onAddPlayer={handleAddPlayer}
          tournamentId={selectedTournament.id}
          currentPlayers={selectedTournament.players || []}
          maxPlayers={selectedTournament.maxPlayers}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
