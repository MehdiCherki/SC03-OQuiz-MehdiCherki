// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — pas de types pour ce module
import { xss } from "express-xss-sanitizer";
import type { RequestHandler } from "express";

export const xssSanitizer: RequestHandler = xss();
