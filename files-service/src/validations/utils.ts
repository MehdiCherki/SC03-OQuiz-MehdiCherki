import { z } from "zod";

export const queryParamsGetFileSchema = z.object({
  resize: z
    .string()
    .regex(/^\d+(x\d+)?$/)
    .transform(value => {
      const [width, height] = value.split("x").map(Number);
      return { width, height };
    })
    .optional(),
  quality: z.coerce.number().min(1).max(100).optional(),
  rotate: z.coerce.number().int().max(360).min(-360).optional(),
  blur: z.coerce.number().int().min(0).optional(),
  format: z.enum(["webp", "jpg", "png", "jpeg"]).optional(),
  negate: z
    .enum(["true", "false"])
    .transform(v => v === "true")
    .optional(),
  tint: z
    .string()
    .regex(/^#[0-9A-Fa-f]{3,6}$/)
    .optional(),
  crop: z
    .string()
    .regex(/^\d+,\d+,\d+,\d+$/)
    .transform(v => {
      const [left, top, width, height] = v.split(",").map(Number);
      return {
        left,
        top,
        width,
        height,
      };
    })
    .optional(),
});

export const idParamsSchema = z.object({
  id: z.coerce.number().positive().int(),
});
