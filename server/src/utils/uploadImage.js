import "dotenv/config";
import fs from "fs";
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
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB limit
    fieldSize: 10 * 1024 * 1024, // 10MB limit for text fields to prevent LIMIT_FIELD_VALUE errors
  },
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

/**
 * Extracts Cloudinary public_id from a full Cloudinary URL.
 * Example URL: https://res.cloudinary.com/qngilpft/image/upload/v1723456789/pidecor/abc123.jpg
 * Returns: "pidecor/abc123"
 */
export function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = url.substring(uploadIndex + "/upload/".length);

    // Strip version prefix if present (e.g. v1723456789/ or v1/)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

    // Strip query parameters if present
    const queryIndex = pathAfterUpload.indexOf("?");
    if (queryIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, queryIndex);
    }

    // Strip file extension (.jpg, .png, .svg, .webp, etc.)
    const lastDotIndex = pathAfterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }

    return pathAfterUpload ? decodeURIComponent(pathAfterUpload) : null;
  } catch (err) {
    console.error("[extractCloudinaryPublicId] Error parsing URL:", err);
    return null;
  }
}

/**
 * Deletes a single image file synchronously from Cloudinary (if configured) AND local disk.
 */
export async function deleteImageFile(urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== "string" || !urlOrPath.trim()) return;

  const target = urlOrPath.trim();

  // 1. Delete from Cloudinary if it's a Cloudinary URL and credentials are set
  if (hasCloudinary && target.includes("cloudinary.com")) {
    const publicId = extractCloudinaryPublicId(target);
    if (publicId) {
      try {
        let res = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
        if (res.result === "not_found") {
          res = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "raw" });
        }
        console.log(`[deleteImageFile] Cloudinary destroy '${publicId}':`, res);
      } catch (err) {
        console.error(`[deleteImageFile] Cloudinary error deleting '${publicId}':`, err.message || err);
      }
    }
  }

  // 2. Delete from local disk uploads folder
  if (target.includes("/uploads/") || (!target.startsWith("http") && target.length > 0)) {
    try {
      let filename = target;
      if (target.includes("/uploads/")) {
        filename = target.split("/uploads/").pop();
      }
      filename = path.basename(filename); // sanitize against path traversal
      if (filename) {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          console.log(`[deleteImageFile] Local disk file unlinked '${filename}'.`);
        }
      }
    } catch (err) {
      console.error(`[deleteImageFile] Local disk error deleting '${target}':`, err.message || err);
    }
  }
}

/**
 * Deletes multiple images from Cloudinary and local disk asynchronously.
 */
export async function deleteMultipleImageFiles(urlsOrPaths) {
  if (!Array.isArray(urlsOrPaths)) return;
  for (const item of urlsOrPaths) {
    if (typeof item === "string" && item.trim()) {
      await deleteImageFile(item.trim());
    }
  }
}
