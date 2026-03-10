if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS environment variable is required");
}

export const config = {
  port: parseInt(process.env.PORT || "3000"),
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  isProd: process.env.NODE_ENV === "production" || false,
  jwtSecret: process.env.JWT_SECRET,
};
