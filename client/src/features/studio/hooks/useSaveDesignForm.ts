import { useState } from "react";
import { api } from "../../../lib/api";
import { captureStudioThumbnail, generateBrandedDesignImage } from "../utils/captureThumbnail";
import { buildDesignSnapshot } from "../../../lib/mappers";
import type { SlotConfig, SlotDefinition } from "../types";

interface UseSaveDesignFormOptions {
  slotConfig: SlotConfig;
  templateId: string;
  templateName: string;
  slots: SlotDefinition[];
}

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Quản lý state biểu mẫu, chụp ảnh phối cảnh có watermark và gửi lead cho SaveDesignModal.
 */
export function useSaveDesignForm({
  slotConfig,
  templateId,
  templateName,
  slots,
}: UseSaveDesignFormOptions) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    const cleanPhone = phone.replace(/[\s.\-()]/g, "");
    const VN_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;
    if (!VN_PHONE_REGEX.test(cleanPhone)) {
      setError("Số điện thoại không đúng định dạng VN (VD: 0905 123 456).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalPreviewImage: string | undefined = undefined;

      try {
        const rawCaptured = await captureStudioThumbnail();
        if (rawCaptured) {
          const branded = await generateBrandedDesignImage(rawCaptured, {
            customerName: name.trim(),
            phone: phone.trim(),
            weddingDate: weddingDate ? String(weddingDate) : "",
            templateName: templateName || "Phối cảnh Tiệc cưới",
            hotline: "0789 241 260",
            website: "pidecor.vn",
            address: "372 Trần Đại Nghĩa, Đà Nẵng",
          });
          finalPreviewImage = branded || rawCaptured;
        }
      } catch (capErr) {
        console.warn("Could not capture or brand customer preview:", capErr);
      }

      setExportedImageUrl(finalPreviewImage || null);

      await api.submitLead({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        wedding_date: weddingDate || undefined,
        message: message.trim()
          ? `[Lưu thiết kế Studio]\n${message.trim()}`
          : "[Lưu thiết kế Studio]",
        design_snapshot: buildDesignSnapshot({
          templateId,
          templateName,
          slotConfig,
          slots,
          previewImage: finalPreviewImage,
          savedBy: "customer",
        }),
      });

      if (finalPreviewImage) {
        const sanitizedName =
          name.trim().replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ_]/g, "_") || "Studio";
        triggerDownload(finalPreviewImage, `PiDecor_ThietKe_${sanitizedName}.jpg`);
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gửi thiết kế thất bại, thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleManualDownload = () => {
    if (exportedImageUrl) {
      const sanitizedName =
        name.trim().replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ_]/g, "_") || "Studio";
      triggerDownload(exportedImageUrl, `PiDecor_ThietKe_${sanitizedName}.jpg`);
    }
  };

  return {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    weddingDate,
    setWeddingDate,
    message,
    setMessage,
    loading,
    error,
    success,
    exportedImageUrl,
    handleSubmit,
    handleManualDownload,
  };
}
