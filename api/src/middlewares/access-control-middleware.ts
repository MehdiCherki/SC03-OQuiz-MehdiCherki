import { Role } from "../models/index.ts";
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { config } from "../../config.ts";
import { logger } from "../lib/logger.ts";

export function checkRoles(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extractAccessToken(req);
    const { userId, role } = verifyAndDecodeJWT(token);
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `le role ${role} n'a pas la permission d'accéder à cette resource`,
      );
    }
    req.user = { id: userId, role };
    next();
  };
}

function extractAccessToken(req: Request) {
  const parts = req.headers.authorization?.split(" ");
  if (!parts || parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    throw new UnauthorizedError(
      "Vous n'êtes pas autorisé à accéder à cette resource",
    );
  }
  return parts[1];
}

function verifyAndDecodeJWT(accessToken: string): JwtPayload {
  try {
    const payload = jwt.verify(accessToken, config.jwtSecret, {
      audience: "access",
    }) as JwtPayload;
    return payload;
  } catch (error) {
    logger.warn(error);
    throw new UnauthorizedError(
      "Vous n'êtes pas autorisé à accéder à cette resource",
    );
  }
}
