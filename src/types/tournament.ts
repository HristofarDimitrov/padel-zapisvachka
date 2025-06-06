export interface Tournament {
  id: string;
  date: string;
  joinCode: string;
  maxPlayers: number;
  currentPlayers: number;
  status: "upcoming" | "ongoing" | "completed";
  players: TournamentPlayer[];
  createdAt: string;
  createdBy: string;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  position?: number;
  pairNumber?: number; // 1 or 2 to indicate first or second player in the pair
  joinedAt: string;
}

export interface Admin {
  id: string;
  username: string;
  role: "admin";
}

export interface Player {
  id: string;
  name: string;
  email: string;
  joinedTournaments: string[]; // Array of tournament IDs
}
