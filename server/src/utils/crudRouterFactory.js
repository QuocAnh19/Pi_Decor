import { Router } from "express";
import { db } from "../config/database.js";
import { verifyToken, requireAdmin } from "../middlewares/verifyToken.js";
import { validate } from "../middlewares/validate.js";
import { uploadImage, publicUrlFor } from "./uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../services/media.service.js";

/**
 * Creates a standard CRUD Express router for a given database table.
 * Implements GET "/", POST "/", PATCH "/:id", DELETE "/:id" with standard security,
 * image upload handling, and validation matching the pattern in materials and venues.
 *
 * @param {Object} options
 * @param {string} options.table - Database collection/table name (e.g. "venues", "testimonials")
 * @param {boolean} [options.listPublic=true] - Whether GET / is public or requires admin authentication
 * @param {import("zod").ZodSchema} [options.createSchema] - Validation schema for POST /
 * @param {import("zod").ZodSchema} [options.updateSchema] - Validation schema for PATCH /:id
 * @param {string|null} [options.uploadField=null] - Form field name for single image upload via Multer
 * @param {string} [options.notFoundMessage="Không tìm thấy dữ liệu."] - 404 error message
 * @param {Function} [options.transformOnCreate] - Optional hook (item, req) => transformedItem
 * @param {Function} [options.transformOnUpdate] - Optional hook (patch, existing, req) => transformedPatch
 * @param {Function} [options.transformOnList] - Optional hook (list, req) => transformedList
 * @param {Function} [options.beforeDelete] - Optional hook (existing, req) => Promise<void>
 * @param {boolean|Function|Array} [options.createHandler] - Custom handler or false to omit POST /
 * @param {boolean|Function|Array} [options.listHandler] - Custom handler or false to omit GET /
 * @returns {import("express").Router}
 */
export function createCrudRouter({
  table,
  listPublic = true,
  createSchema,
  updateSchema,
  uploadField = null,
  notFoundMessage = "Không tìm thấy dữ liệu.",
  transformOnCreate,
  transformOnUpdate,
  transformOnList,
  beforeDelete,
  createHandler,
  listHandler,
} = {}) {
  const router = Router();

  // ── GET / ─────────────────────────────────────────────────────────────
  const listMiddlewares = [];
  if (!listPublic) {
    listMiddlewares.push(verifyToken, requireAdmin);
  }

  if (typeof listHandler === "function" || Array.isArray(listHandler)) {
    const handlers = Array.isArray(listHandler) ? listHandler : [listHandler];
    router.get("/", ...listMiddlewares, ...handlers);
  } else if (listHandler !== false) {
    router.get("/", ...listMiddlewares, async (req, res) => {
      let list = await db.get(table);
      if (req.query.city) {
        const city = String(req.query.city).trim().toLowerCase();
        list = list.filter((item) => item.city && String(item.city).trim().toLowerCase() === city);
      }
      if (typeof transformOnList === "function") {
        list = await transformOnList(list, req);
      }
      res.json(list);
    });
  }

  // ── POST / ────────────────────────────────────────────────────────────
  if (typeof createHandler === "function" || Array.isArray(createHandler)) {
    const handlers = Array.isArray(createHandler) ? createHandler : [createHandler];
    router.post("/", ...handlers);
  } else if (createHandler !== false) {
    const createMiddlewares = [verifyToken, requireAdmin];
    if (uploadField) {
      createMiddlewares.push(uploadImage.single(uploadField));
    }
    if (createSchema) {
      createMiddlewares.push(validate(createSchema));
    }

    router.post("/", ...createMiddlewares, async (req, res) => {
      let item = {
        ...(req.body ?? {}),
      };

      if (req.file) {
        item.image_url = publicUrlFor(req, req.file);
      }

      try {
        if (typeof transformOnCreate === "function") {
          item = await transformOnCreate(item, req);
        }
      } catch (err) {
        const status = err.status || 400;
        return res.status(status).json({ message: err.message || "Dữ liệu không hợp lệ." });
      }

      const created = await db.insert(table, item);
      res.status(201).json(created);
    });
  }

  // ── PATCH /:id ────────────────────────────────────────────────────────
  const updateMiddlewares = [verifyToken, requireAdmin];
  if (uploadField) {
    updateMiddlewares.push(uploadImage.single(uploadField));
  }
  if (updateSchema) {
    updateMiddlewares.push(validate(updateSchema));
  }

  router.patch("/:id", ...updateMiddlewares, async (req, res) => {
    const all = await db.get(table);
    const existing = all.find((item) => String(item.id) === String(req.params.id));
    if (!existing) {
      return res.status(404).json({ message: notFoundMessage });
    }

    let patch = {
      ...(req.body ?? {}),
    };

    if (req.file) {
      patch.image_url = publicUrlFor(req, req.file);
    }

    try {
      if (typeof transformOnUpdate === "function") {
        patch = await transformOnUpdate(patch, existing, req);
      }
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).json({ message: err.message || "Dữ liệu không hợp lệ." });
    }

    // Xóa ảnh cũ nếu trường ảnh đơn đã thay đổi
    const oldImg = existing.image_url || existing.cover_image;
    const newImg = patch.image_url || patch.cover_image;
    if (newImg !== undefined && oldImg) {
      await cleanupRemovedMedia(oldImg, newImg);
    }

    const updated = await db.updateById(table, req.params.id, patch);
    res.json(updated);
  });

  // ── DELETE /:id ───────────────────────────────────────────────────────
  router.delete("/:id", verifyToken, requireAdmin, async (req, res, next) => {
    try {
      const all = await db.get(table);
      const existing = all.find((item) => String(item.id) === String(req.params.id));
      if (!existing) {
        return res.status(404).json({ message: notFoundMessage });
      }

      if (typeof beforeDelete === "function") {
        await beforeDelete(existing, req);
      }

      const removed = await db.removeById(table, req.params.id);
      if (!removed) {
        return res.status(404).json({ message: notFoundMessage });
      }

      await deleteMediaOf(existing, "image_url", "cover_image", "avatar_url", "photos");

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
