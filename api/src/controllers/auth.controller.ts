import type { Request, Response } from "express";
import argon2 from "argon2";
import z from "zod";
import { prisma } from "../models/index.ts";
import type { User } from "../models/index.ts";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../lib/errors.ts";
import { generateAuthTokens } from "../lib/tokens.ts";

interface Token {
  token: string;
  expiresIn: number;
}

// Register
export async function registerUser(req: Request, res: Response) {
  //valider le payload de la requete (nature des valeurs)
  const registerUserBodySchema = z.object({
    firstname: z.string().min(3),
    lastname: z.string().min(2),
    email: z.email(),
    password: z
      .string()
      .min(12)
      .max(100)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[!@#$%&*-+{}?]/),
    confirm: z.string(),
  });
  // verifier les types
  const { firstname, lastname, email, password, confirm } =
    await registerUserBodySchema.parseAsync(req.body);
  // verifier pwd/confirmation
  if (password !== confirm) {
    throw new BadRequestError(
      "Mot de passe et confirmation ne correspondent pas",
    );
  }
  // vérifier que l'email est unique
  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    throw new ConflictError("Email déjà utilisé");
  }
  // hashé le mdp
  const hashedPassword = await argon2.hash(password);
  // crée l'utilisateur en db
  const user = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    },
  });
  res.status(201).json({
    id: user.id,
    firstname: user.firstname,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
}

// Login
export async function loginUser(req: Request, res: Response) {
  // valider le payload de la requete (nature des valeurs)
  const loginUserSchema = z.object({
    email: z.email(),
    password: z.string(),
  });
  const { email, password } = await loginUserSchema.parseAsync(req.body);
  // récupérer l'utilisateur ds la db
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    throw new UnauthorizedError(
      "Le login et le mot de passe ne correspondent pas",
    );
  }
  // vérifier que le mot de passe et le hash correspondent
  const isMatching = await argon2.verify(user.password, password);
  if (!isMatching) {
    throw new UnauthorizedError(
      "Le login et le mot de passe ne correspondent pas",
    );
  }

  // générer les 2 token (access/refresh)
  const { accessToken, refreshToken } = generateAuthTokens(user);

  // stockage du refresh token en DB
  await replaceRefreshTokenInDatabase(refreshToken, user);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  // renvoyer les token vers l'utilisateur
  res.json({
    accessToken,
    refreshToken,
  });
}

function setAccessTokenCookie(res: Response, accessToken: Token) {
  res.cookie("accessToken", accessToken.token, {
    httpOnly: true, // interdit l'accès au cookie par JS côté client
    // secure: true // limite l'envoi du cookie au protocole HTTPS
    sameSite: "none",
    maxAge: accessToken.expiresIn,
  });
}

function setRefreshTokenCookie(res: Response, refreshToken: Token) {
  res.cookie("refreshToken", refreshToken.token, {
    httpOnly: true, // interdit l'accès au cookie par JS côté client
    // secure: true // limite l'envoi du cookie au protocole HTTPS
    sameSite: "none",
    maxAge: refreshToken.expiresIn,
    path: "/api/auth/refresh",
  });
}

async function replaceRefreshTokenInDatabase(refreshToken: Token, user: User) {
  await prisma.refreshToken.deleteMany({ where: { user_id: user.id } });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken.token,
      user_id: user.id,
      issued_at: new Date(),
      expires_at: new Date(new Date().valueOf() + refreshToken.expiresIn),
    },
  });
}
