// shared/session.ts
import "server-only";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

const getEncodedKey = () => {
  const secretKey = process.env.SESSION_SECRET; // Server-only: do not use NEXT_PUBLIC_ prefix
  if (!secretKey) throw new Error("SESSION_SECRET env var is required");
  return new TextEncoder().encode(secretKey);
};

export async function encrypt(payload: object) {
  const encodedKey = getEncodedKey();
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined = "") {
  try {
    if (!token) return;
    const encodedKey = getEncodedKey();
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("❌ Failed to verify session", error);
    return null;
  }
}
