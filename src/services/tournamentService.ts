import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Tournament, TournamentPlayer, Team } from "../types/tournament";

const tournamentsCollection = collection(db, "tournaments");

export const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createTournament = async (
  date: string,
  maxPlayers: number,
  adminId: string
): Promise<string> => {
  const joinCode = generateJoinCode();
  const tournamentData: Omit<Tournament, "id"> = {
    date,
    joinCode,
    maxPlayers,
    currentPlayers: 0,
    status: "upcoming",
    players: [],
    createdAt: Timestamp.now().toDate().toISOString(),
    createdBy: adminId,
  };

  const docRef = await addDoc(tournamentsCollection, tournamentData);
  return docRef.id;
};

export const getTournamentByCode = async (
  code: string
): Promise<Tournament | null> => {
  const q = query(tournamentsCollection, where("joinCode", "==", code));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Tournament;
};

export const joinTournament = async (
  tournamentId: string,
  player: TournamentPlayer
): Promise<boolean> => {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const tournamentDoc = await getDoc(tournamentRef);

  if (!tournamentDoc.exists()) return false;

  const tournament = tournamentDoc.data() as Tournament;

  if (tournament.currentPlayers >= tournament.maxPlayers) return false;

  await updateDoc(tournamentRef, {
    players: [...tournament.players, player],
    currentPlayers: tournament.currentPlayers + 1,
  });

  return true;
};

export const updateTournamentStatus = async (
  tournamentId: string,
  status: Tournament["status"]
): Promise<void> => {
  console.log("=== UPDATING TOURNAMENT STATUS ===");
  console.log("Tournament ID:", tournamentId);
  console.log("New Status:", status);

  const tournamentRef = doc(db, "tournaments", tournamentId);

  // First check current document
  const currentDoc = await getDoc(tournamentRef);
  console.log("Current document exists:", currentDoc.exists());
  console.log("Current document data:", currentDoc.data());

  // Then update
  await updateDoc(tournamentRef, { status });
  console.log("Status update completed");

  // Verify the update
  const updatedDoc = await getDoc(tournamentRef);
  console.log("Updated document data:", updatedDoc.data());
};

export const updatePlayerPosition = async (
  tournamentId: string,
  playerId: string,
  position: number
): Promise<void> => {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const tournamentDoc = await getDoc(tournamentRef);

  if (!tournamentDoc.exists()) return;

  const tournament = tournamentDoc.data() as Tournament;
  const updatedPlayers = tournament.players.map((p) =>
    p.id === playerId ? { ...p, position } : p
  );

  await updateDoc(tournamentRef, { players: updatedPlayers });
};

export function generateTeams(players: TournamentPlayer[]): Team[] {
  const teams: Team[] = [];
  for (let i = 0; i < players.length; i += 2) {
    const teamPlayers = players.slice(i, i + 2);
    if (teamPlayers.length === 2) {
      teams.push({
        id: `team-${teams.length + 1}`,
        players: teamPlayers,
      });
    }
  }
  return teams;
}

export const shufflePlayers = async (tournamentId: string): Promise<void> => {
  console.log("Starting shuffle for tournament:", tournamentId);
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const tournamentDoc = await getDoc(tournamentRef);

  if (!tournamentDoc.exists()) {
    console.error("Tournament not found");
    return;
  }

  const tournament = tournamentDoc.data() as Tournament;
  console.log("Current players:", tournament.players);

  if (tournament.players.length === 0) {
    console.error("No players to shuffle");
    return;
  }

  // Shuffle the players array
  const shuffledPlayers = [...tournament.players].sort(
    () => Math.random() - 0.5
  );
  console.log("Shuffled players:", shuffledPlayers);

  // Assign positions in pairs (1-2, 3-4, etc.)
  const playersWithPositions = shuffledPlayers.map((player, index) => {
    const pairPosition = Math.floor(index / 2) + 1;
    const pairNumber = (index % 2) + 1;
    console.log(
      `Assigning player ${player.name} to pair ${pairPosition}, number ${pairNumber}`
    );
    return {
      ...player,
      position: pairPosition,
      pairNumber: pairNumber,
    };
  });
  console.log("Players with positions:", playersWithPositions);

  // Generate teams
  const teams = generateTeams(playersWithPositions);
  console.log("Generated teams:", teams);

  try {
    // First, verify we can read the document
    const currentDoc = await getDoc(tournamentRef);
    console.log("Current document exists:", currentDoc.exists());
    console.log("Current document data:", currentDoc.data());

    // Then attempt to update
    console.log("Attempting to update document...");
    await updateDoc(tournamentRef, {
      players: playersWithPositions,
      teams: teams,
      lastShuffled: new Date().toISOString(),
    });
    console.log("Tournament updated successfully");

    // Verify the update
    const updatedDoc = await getDoc(tournamentRef);
    console.log("Updated document data:", updatedDoc.data());
  } catch (error) {
    console.error("Error updating tournament:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    throw error;
  }
};

export const getAllTournaments = async (): Promise<Tournament[]> => {
  const querySnapshot = await getDocs(tournamentsCollection);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Tournament[];
};

export const deleteTournament = async (tournamentId: string): Promise<boolean> => {
  try {
    const tournamentRef = doc(db, "tournaments", tournamentId);
    await deleteDoc(tournamentRef);
    return true;
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return false;
  }
};
