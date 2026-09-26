import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";

const creds = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(72) });

function friendly(message?: string) {
  if (message && /weak|easy to guess|pwned|leak/i.test(message)) return "That password is too common. Please choose a stronger, unique password.";
  return message ?? "Something went wrong";
}

async function services() { return import("@/integrations/firebase/admin.server"); }

async function assertAdmin(userId: string) {
  const { adminDb } = await services();
  const user = await adminDb.doc(`users/${userId}`).get();
  if (user.data()?.["role"] !== "admin") throw new Error("Only the super admin can do this.");
}

export const hasAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { adminDb } = await services();
  const snapshot = await adminDb.collection("users").where("role", "==", "admin").limit(1).get();
  return { exists: !snapshot.empty };
});

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .validator((data) => creds.parse(data))
  .handler(async ({ data }) => {
    const { adminAuth, adminDb } = await services();
    const existing = await adminDb.collection("users").where("role", "==", "admin").limit(1).get();
    if (!existing.empty) return { ok: false as const, error: "A super admin already exists." };
    try {
      const user = await adminAuth.createUser({ email: data.email, password: data.password, emailVerified: true });
      await adminDb.doc(`users/${user.uid}`).set({ email: data.email, role: "admin", created_at: new Date().toISOString() });
      return { ok: true as const, error: null };
    } catch (error) {
      return { ok: false as const, error: friendly(error instanceof Error ? error.message : undefined) };
    }
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { adminAuth, adminDb } = await services();
    const [authUsers, roleDocs] = await Promise.all([adminAuth.listUsers(1000), adminDb.collection("users").get()]);
    const roles = new Map(roleDocs.docs.map((item) => [item.id, item.data()["role"]]));
    return authUsers.users.map((user) => ({
      id: user.uid, email: user.email ?? "", created_at: user.metadata.creationTime,
      last_sign_in_at: user.metadata.lastSignInTime ?? null, isAdmin: roles.get(user.uid) === "admin",
    }));
  });

export const createAppUser = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((data) => creds.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { adminAuth, adminDb } = await services();
    try {
      const user = await adminAuth.createUser({ email: data.email, password: data.password, emailVerified: true });
      await adminDb.doc(`users/${user.uid}`).set({ email: data.email, role: "user", created_at: new Date().toISOString() });
      return { ok: true as const, error: null };
    } catch (error) {
      return { ok: false as const, error: friendly(error instanceof Error ? error.message : undefined) };
    }
  });

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((data) => z.object({ id: z.string().min(1), password: z.string().min(6).max(72) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { adminAuth } = await services();
    try { await adminAuth.updateUser(data.id, { password: data.password }); return { ok: true as const, error: null }; }
    catch (error) { return { ok: false as const, error: friendly(error instanceof Error ? error.message : undefined) }; }
  });

export const deleteAppUser = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.id === context.userId) throw new Error("You can't delete yourself.");
    const { adminAuth, adminDb } = await services();
    const receipts = await adminDb.collection(`users/${data.id}/receipts`).get();
    const batch = adminDb.batch();
    receipts.docs.forEach((item) => batch.delete(item.ref));
    batch.delete(adminDb.doc(`shop_settings/${data.id}`));
    batch.delete(adminDb.doc(`users/${data.id}`));
    await batch.commit();
    await adminAuth.deleteUser(data.id);
    return { ok: true as const, error: null };
  });
