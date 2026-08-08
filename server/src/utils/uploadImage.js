import "dotenv/config";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "pidecor",
      resource_type: "auto",
    },
  });

  console.log(`[uploadImage.js] Using Cloudinary Storage (${process.env.CLOUDINARY_CLOUD_NAME}).`);
} else {
  storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });

  console.log("[uploadImage.js] Cloudinary credentials not set — using local disk storage.");
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh."));
    }
    cb(null, true);
  },
});

/** Builds the public URL for a saved file (Cloudinary secure_url or local disk static path). */
export function publicUrlFor(req, filenameOrFile) {
  if (!filenameOrFile) return null;

  if (typeof filenameOrFile === "object" && filenameOrFile !== null) {
    if (filenameOrFile.path && filenameOrFile.path.startsWith("http")) {
      return filenameOrFile.path;
    }
    if (filenameOrFile.secure_url) {
      return filenameOrFile.secure_url;
    }
    if (filenameOrFile.filename) {
      filenameOrFile = filenameOrFile.filename;
    }
  }

  if (typeof filenameOrFile === "string" && filenameOrFile.startsWith("http")) {
    return filenameOrFile;
  }

  if (hasCloudinary && typeof filenameOrFile === "string" && filenameOrFile.length > 0) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${filenameOrFile}`;
  }

  return `${req.protocol}://${req.get("host")}/uploads/${filenameOrFile}`;
}
