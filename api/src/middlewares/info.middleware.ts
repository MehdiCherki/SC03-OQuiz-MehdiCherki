import type { Request, Response } from "express";

export function infoMiddleware(req: Request, res: Response) {
  const url = req.url;
  const ip = req.ip;
  const userAgent = req.get("user-agent");
  res.json({ url, ip, userAgent });
}
