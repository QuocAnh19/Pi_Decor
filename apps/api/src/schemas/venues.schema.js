import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string({ required_error: "Thiếu tên địa điểm." }).min(1, "Thiếu tên địa điểm.").max(200),
  type: z
    .enum(["hotel", "restaurant", "resort", "sảnh tiệc"], {
      errorMap: () => ({ message: "Loại địa điểm không hợp lệ." }),
    })
    .optional()
    .default("hotel"),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  lat: z.coerce
    .number({ required_error: "Thiếu tọa độ lat." })
    .min(-90, "Tọa độ lat không hợp lệ.")
    .max(90, "Tọa độ lat không hợp lệ."),
  lng: z.coerce
    .number({ required_error: "Thiếu tọa độ lng." })
    .min(-180, "Tọa độ lng không hợp lệ.")
    .max(180, "Tọa độ lng không hợp lệ."),
  cover_image: z.string().nullable().optional(),
});

export const updateVenueSchema = createVenueSchema.partial();
