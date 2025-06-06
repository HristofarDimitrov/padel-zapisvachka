import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Loader2 } from 'lucide-react';
import { Player, TournamentPlayer } from '../types/tournament';
import { getAllPlayers } from '../services/tournamentService';

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlayer: (player: { id?: string; name: string; email?: string }) => void;
    tournamentId: string;
    currentPlayers: TournamentPlayer[];
    maxPlayers: number;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
    isOpen,
    onClose,
    onAddPlayer,
    tournamentId,
    currentPlayers,
    maxPlayers,
}) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [customName, setCustomName] = useState('');
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPlayers();
        }
    }, [isOpen]);

    const loadPlayers = async () => {
        setLoading(true);
        try {
            console.log("Fetching players...");
            const allPlayers = await getAllPlayers();
            console.log("Players fetched:", allPlayers);
            setPlayers(allPlayers);
        } catch (error) {
            console.error("Error loading players:", error);
            setError('Failed to load players');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsAdding(true);

        try {
            if (selectedPlayer) {
                // Check if player is already in the tournament
                const isPlayerAlreadyAdded = currentPlayers.some(
                    (p) => p.id === selectedPlayer.id
                );
                if (isPlayerAlreadyAdded) {
                    setError("This player is already in the tournament");
                    return;
                }
                onAddPlayer(selectedPlayer);
            } else if (customName.trim()) {
                onAddPlayer({
                    name: customName.trim(),
                });
            }
            onClose();
        } catch (error) {
            console.error("Error adding player:", error);
            setError('Failed to add player');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        setSelectedPlayer(null);
        setCustomName('');
        setSearchTerm('');
        setError('');
        onClose();
    };

    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Player to Tournament</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                    Players: {currentPlayers.length}/{maxPlayers}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search existing players */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Existing Players
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or email"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Player list */}
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                        {loading ? (
                            <div className="p-4 text-center">
                                <Loader2 className="animate-spin mx-auto" size={20} />
                            </div>
                        ) : filteredPlayers.length > 0 ? (
                            <div className="divide-y">
                                {filteredPlayers.map((player) => {
                                    const isAlreadyAdded = currentPlayers.some(
                                        (p) => p.id === player.id
                                    );
                                    const isSelected = selectedPlayer?.id === player.id;
                                    return (
                                        <button
                                            key={player.id}
                                            type="button"
                                            onClick={() => setSelectedPlayer(player)}
                                            disabled={isAlreadyAdded}
                                            className={`w-full p-3 text-left transition-colors ${isSelected
                                                ? 'bg-blue-100 border-l-4 border-blue-500'
                                                : 'hover:bg-gray-50'
                                                } ${isAlreadyAdded
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{player.name}</div>
                                                    {player.email && (
                                                        <div className="text-sm text-gray-500">{player.email}</div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="text-blue-500">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            {isAlreadyAdded && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Already added to tournament
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No players found
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Add custom player */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Custom Player
                        </label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter player name"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isAdding}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || (!selectedPlayer && !customName.trim()) || currentPlayers.length >= maxPlayers}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    <span>Add Player</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 