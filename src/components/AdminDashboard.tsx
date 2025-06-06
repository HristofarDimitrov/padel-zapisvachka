import React, { useState, useEffect } from "react";
import { Tournament } from "../types/tournament";
import {
  createTournament,
  getAllTournaments,
  updateTournamentStatus,
  updatePlayerPosition,
  shufflePlayers,
} from "../services/tournamentService";

const AdminDashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newTournament, setNewTournament] = useState({
    date: "",
    maxPlayers: 8,
  });

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
              <div className="space-x-2">
                <button
                  onClick={() => handleUpdateStatus(tournament.id, "ongoing")}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  disabled={tournament.status !== "upcoming"}
                >
                  Start
                </button>
                <button
                  onClick={() => handleUpdateStatus(tournament.id, "completed")}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  disabled={tournament.status !== "ongoing"}
                >
                  Complete
                </button>
                <button
                  onClick={(e) => {
                    console.log("=== BUTTON CLICK EVENT ===");
                    console.log("Event type:", e.type);
                    console.log(
                      "Button clicked for tournament:",
                      tournament.id
                    );
                    e.preventDefault();
                    handleShuffle(tournament.id);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  disabled={
                    tournament.status !== "ongoing" ||
                    tournament.players.length === 0
                  }
                >
                  Shuffle
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
