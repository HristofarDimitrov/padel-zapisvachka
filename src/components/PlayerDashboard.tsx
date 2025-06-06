import React, { useState, useEffect } from "react";
import { Tournament } from "../types/tournament";
import {
  getAllTournaments,
  getTournamentByCode,
  joinTournament,
} from "../services/tournamentService";
import { Player } from "../types/tournament";

interface PlayerDashboardProps {
  currentPlayer: Player;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ currentPlayer }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const allTournaments = await getAllTournaments();
    setTournaments(allTournaments);
  };

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Player Dashboard</h1>

      {/* Join Tournament Form */}
      <form
        onSubmit={handleJoinTournament}
        className="mb-8 p-4 bg-white rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Join Tournament</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Tournament Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded"
              placeholder="Enter tournament code"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join Tournament
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
                  Status:{" "}
                  {tournament.status.charAt(0).toUpperCase() +
                    tournament.status.slice(1)}
                </p>
                <p className="text-sm text-gray-600">
                  Players: {tournament.currentPlayers}/{tournament.maxPlayers}
                </p>
              </div>
            </div>

            {/* Players List */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Players</h4>
              <div className="space-y-2">
                {tournament.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded ${
                      player.id === currentPlayer.id
                        ? "bg-blue-100"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{player.name}</span>
                      {player.position && (
                        <span className="text-sm text-gray-600">
                          Position: {player.position}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerDashboard;
