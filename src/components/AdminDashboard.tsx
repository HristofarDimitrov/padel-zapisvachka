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
import { Trash2, AlertTriangle, UserPlus, X } from "lucide-react";
import { AddPlayerModal } from "./AddPlayerModal";

const AdminDashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newTournament, setNewTournament] = useState({
    date: "",
    maxPlayers: 8,
  });
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Create Tournament Form */}
      <form
        onSubmit={handleCreateTournament}
        className="mb-8 p-4 bg-white rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Date</label>
            <input
              type="datetime-local"
              value={newTournament.date}
              onChange={(e) =>
                setNewTournament({ ...newTournament, date: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Max Players</label>
            <input
              type="number"
              value={newTournament.maxPlayers}
              onChange={(e) =>
                setNewTournament({
                  ...newTournament,
                  maxPlayers: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
              min="2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Tournament
          </button>
        </div>
      </form>

      {/* Tournaments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Tournaments</h2>
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">
                  Tournament on {new Date(tournament.date).toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">
                  Join Code: {tournament.joinCode}
                </p>
                <p className="text-sm text-gray-600">
                  Players: {tournament.currentPlayers}/{tournament.maxPlayers}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {tournament.status}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(tournament.id, "ongoing")}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={tournament.status !== "upcoming"}
                >
                  Start
                </button>
                <button
                  onClick={() => handleUpdateStatus(tournament.id, "completed")}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={tournament.status !== "ongoing"}
                >
                  Complete
                </button>
                <button
                  onClick={() => handleShuffle(tournament.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    tournament.status !== "ongoing" ||
                    tournament.players.length === 0
                  }
                >
                  Shuffle
                </button>
                <button
                  onClick={() => {
                    setSelectedTournament(tournament);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center space-x-1"
                  disabled={tournament.currentPlayers >= tournament.maxPlayers}
                >
                  <UserPlus size={16} />
                  <span>Add Player</span>
                </button>
                <button
                  onClick={() => handleDeleteTournament(tournament)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Players List */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Players</h4>
              <div className="space-y-4">
                {tournament.players.length === 0 ? (
                  <p className="text-gray-500">No players joined yet</p>
                ) : (
                  Array.from(
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
                          className="p-3 bg-gray-50 rounded"
                        >
                          <div className="font-medium mb-2">
                            Pair {position || "Unassigned"}
                          </div>
                          <div className="space-y-2">
                            {pairPlayers.map((player) => (
                              <div
                                key={`player-${player.id}`}
                                className="flex items-center justify-between p-2 bg-white rounded shadow-sm"
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{player.name}</span>
                                  <span className="text-sm text-gray-500">
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
                                    className="w-16 p-1 border rounded"
                                    placeholder="Position"
                                    min="1"
                                  />
                                  <button
                                    onClick={() => handleRemovePlayer(tournament.id, player.id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Remove player"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Teams List */}
            {tournament.teams && tournament.teams.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Teams</h4>
                <div className="space-y-2">
                  {tournament.teams.map((team) => (
                    <div key={team.id} className="p-2 bg-blue-50 rounded">
                      <span className="font-medium">{team.id}:</span>
                      {team.players.map((player) => (
                        <span key={player.id} className="ml-2">
                          {player.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simple Matchups List (round-robin) */}
            {tournament.teams && tournament.teams.length > 1 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Matchups</h4>
                <div className="space-y-2">
                  {tournament.teams.map((teamA, i) =>
                    tournament.teams!.slice(i + 1).map((teamB) => (
                      <div
                        key={teamA.id + "-" + teamB.id}
                        className="p-2 bg-green-50 rounded"
                      >
                        <span className="font-medium">{teamA.id}</span> vs{" "}
                        <span className="font-medium">{teamB.id}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold">Delete Tournament</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the tournament scheduled for{" "}
              {new Date(tournamentToDelete.date).toLocaleString()}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTournamentToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
