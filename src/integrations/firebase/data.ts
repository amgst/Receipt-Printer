import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { currentUser, db } from "./client";

async function uid() {
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in.");
  return user.uid;
}

export async function getUserRole() {
  const userId = await uid();
  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.data()?.["role"] as "admin" | "user" | undefined;
}

export async function getSettings<T>() {
  const userId = await uid();
  const snapshot = await getDoc(doc(db, "shop_settings", userId));
  return snapshot.exists() ? ({ user_id: userId, ...snapshot.data() } as T) : null;
}

export async function saveSettings(data: Record<string, unknown>) {
  const userId = await uid();
  await setDoc(doc(db, "shop_settings", userId), { ...data, updated_at: serverTimestamp() }, { merge: true });
}

export async function addReceipt(data: Record<string, unknown>) {
  const userId = await uid();
  await addDoc(collection(db, "users", userId, "receipts"), {
    ...data,
    user_id: userId,
    created_at: serverTimestamp(),
  });
}

export async function listReceipts<T>() {
  const userId = await uid();
  const snapshot = await getDocs(query(collection(db, "users", userId, "receipts"), orderBy("created_at", "desc"), limit(500)));
  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      ...data,
      created_at: data["created_at"]?.toDate?.().toISOString() ?? new Date().toISOString(),
    } as T;
  });
}

export async function getReceipt<T>(id: string) {
  const userId = await uid();
  const snapshot = await getDoc(doc(db, "users", userId, "receipts", id));
  if (!snapshot.exists()) throw new Error("Receipt not found.");
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export async function updateReceipt(id: string, data: Record<string, unknown>) {
  const userId = await uid();
  await updateDoc(doc(db, "users", userId, "receipts", id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteReceipt(id: string) {
  const userId = await uid();
  await deleteDoc(doc(db, "users", userId, "receipts", id));
}
