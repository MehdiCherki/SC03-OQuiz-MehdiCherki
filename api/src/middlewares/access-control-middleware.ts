import { Role } from "../models/index.ts";
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { config } from "../../config.ts";

export function checkRoles(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extractAccessToken(req);
    const { userId, userRole } = verifyAndDecodeJWT(token);
    if (!roles.includes(userRole)) {
      throw new ForbiddenError(
        `le role ${userRole} n'a pas la permission d'accéder à cette resource`,
      );
    }
    req.user = { id: userId, role: userRole };
    next();
  };
}

function extractAccessToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(
      "Vous n'êtes pas autorisé à accéder à cette resource",
    );
  }
  return authHeader.split(" ")[1];
}

function verifyAndDecodeJWT(accessToken: string): JwtPayload {
  try {
    const payload = jwt.verify(accessToken, config.jwtSecret) as JwtPayload;
    return payload;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    throw new UnauthorizedError(
      "Vous n'êtes pas autorisé à accéder à cette resource",
    );
  }
}
