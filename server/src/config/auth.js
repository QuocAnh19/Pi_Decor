import "dotenv/config";

const rawSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : "";
const isProduction = process.env.NODE_ENV === "production";

if (!rawSecret && isProduction) {
  throw new Error(
    "[FATAL] JWT_SECRET is required in production mode. Please set JWT_SECRET in your environment variables."
  );
}

if (!rawSecret) {
  console.warn(
    "[SECURITY WARNING] JWT_SECRET is not defined. Falling back to default 'dev-secret' for development."
  );
}

export const JWT_SECRET = rawSecret || "dev-secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
