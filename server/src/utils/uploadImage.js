import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

/**
 * utils/uploadImage.js
 * ─────────────────────
 * Ecovera writes uploads straight to Server/src/uploads via Multer's disk
 * storage — fine on a machine with a persistent disk, but the technical
 * proposal (Mục 2.5 / Mục 5) calls this out as the one pattern NOT to
 * repeat, because Render Free's filesystem is wiped on every restart.
 *
 * This file keeps the same Multer-based call signature so routes don't
 * change, but isolates the storage engine in one place. Today it writes to
 * local disk (great for local dev). Before deploying to Render, swap the
 * `storage` below for `multer-storage-cloudinary` (or stream `req.file.buffer`
 * to the Cloudinary SDK with `multer.memoryStorage()`) — nothing else in the
 * codebase needs to change.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh."));
    }
    cb(null, true);
  },
});

/** Builds the public URL for a file saved by the storage engine above. */
export function publicUrlFor(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}
