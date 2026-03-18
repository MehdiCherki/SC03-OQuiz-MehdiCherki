import path from "node:path";
import crypto from "node:crypto";
import formidable from "formidable";

export const uploadDir = path.join(import.meta.dirname, "../../uploads");

export const formParser = formidable({
  uploadDir,
  keepExtensions: true,
  filename(name, ext, part, form) {
    const currentDate = new Date();
    const newName = crypto.randomBytes(16).toString("hex");
    return `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}/${newName}${ext}`;
  },
});
