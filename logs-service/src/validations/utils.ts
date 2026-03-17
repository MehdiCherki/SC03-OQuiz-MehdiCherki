import { z } from "zod";
import { ObjectId } from "mongodb";

export const IdParamSchema = z.object({
  logId: z
    .string()
    .min(1, "L'ID ne peut pas être nul")
    .refine(id => ObjectId.isValid(id), { message: "L'ID n'est pas valide'" }),
});
