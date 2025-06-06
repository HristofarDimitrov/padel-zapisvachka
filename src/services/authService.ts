import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Admin, Player } from "../types/tournament";

const auth = getAuth();

export const signInAdmin = async (
  email: string,
  password: string
): Promise<Admin | null> => {
  try {
    console.log("Attempting admin login for:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Firebase auth successful, user ID:", userCredential.user.uid);

    const adminDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
    console.log("Admin document exists:", adminDoc.exists());

    if (!adminDoc.exists()) {
      console.log("No admin document found for user");
      await firebaseSignOut(auth);
      return null;
    }

    const adminData = adminDoc.data();
    console.log("Admin data:", adminData);

    return { id: adminDoc.id, ...adminData } as Admin;
  } catch (error) {
    console.error("Error signing in admin:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error code:", (error as any).code);
    }
    return null;
  }
};

export const createPlayerAccount = async (
  email: string,
  password: string,
  name: string
): Promise<Player | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const playerData: Player = {
      id: userCredential.user.uid,
      name,
      email,
      joinedTournaments: [],
    };

    await setDoc(doc(db, "players", userCredential.user.uid), playerData);
    return playerData;
  } catch (error) {
    console.error("Error creating player account:", error);
    return null;
  }
};

export const signInPlayer = async (
  email: string,
  password: string
): Promise<Player | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const playerDoc = await getDoc(doc(db, "players", userCredential.user.uid));

    if (!playerDoc.exists()) {
      await firebaseSignOut(auth);
      return null;
    }

    return { id: playerDoc.id, ...playerDoc.data() } as Player;
  } catch (error) {
    console.error("Error signing in player:", error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};
