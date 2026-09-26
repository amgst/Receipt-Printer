import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { currentUser } = await import("./client").then(async (m) => ({ currentUser: await m.currentUser() }));
    const token = await currentUser?.getIdToken();
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const header = getRequest().headers.get("authorization");
    if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const { adminAuth } = await import("./admin.server");
    const claims = await adminAuth.verifyIdToken(header.slice(7));
    return next({ context: { userId: claims.uid, claims } });
  },
);
