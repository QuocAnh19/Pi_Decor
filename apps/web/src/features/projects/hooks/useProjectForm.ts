import React, { useState, useEffect, useRef, FormEvent } from "react";
import { toProjectItem, extractGalleryState, extractGalleryUrls } from "../../../lib/mappers";
import type { Project, ProjectPayload } from "../../../lib/types";
import { ProjectItem, CATEGORY_TAG_OPTIONS, SAMPLE_STOCK_IMAGES } from "../types";
import type { ProjectFormProps } from "../components/ProjectForm";

function buildInitialFormData(
  project: Project | ProjectItem | null,
  venueName?: string
): Omit<ProjectItem, "id"> {
  const normalized = project ? toProjectItem(project) : null;
  return {
    title: normalized?.title ?? "",
    categoryId: normalized?.categoryId ?? "piwedding",
    tag: normalized?.tag ?? "Gia Tiên",
    location: normalized?.location ?? (venueName ? `Tại ${venueName}` : "Tư gia, Đà Nẵng"),
    src: normalized?.src ?? SAMPLE_STOCK_IMAGES[0],
    gallery: normalized?.gallery ?? [],
    description: normalized?.description ?? "",
    date: normalized?.date || new Date().toISOString().split("T")[0],
    budget: normalized?.budget ?? "Thỏa thuận",
    status: normalized?.status ?? "active",
    priceTier: normalized?.priceTier ?? "standard",
  };
}

/**
 * Quản lý state và các thao tác tải ảnh, bộ sưu tập và submit của ProjectForm.
 */
export function useProjectForm(props: ProjectFormProps) {
  const { venueName, project, onCancel } = props;

  const [formData, setFormData] = useState<Omit<ProjectItem, "id">>(() =>
    buildInitialFormData(project, venueName)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    const normalized = project ? toProjectItem(project) : null;
    return extractGalleryState(normalized?.gallery).urls;
  });
  const [customSpans, setCustomSpans] = useState<Record<number, string>>(() => {
    const normalized = project ? toProjectItem(project) : null;
    return extractGalleryState(normalized?.gallery).spans;
  });

  useEffect(() => {
    if (project) {
      const normalized = toProjectItem(project);
      setFormData(buildInitialFormData(normalized, venueName));
      const { urls, spans } = extractGalleryState(normalized.gallery);
      setGalleryUrls(urls);
      setCustomSpans(spans);
    }
  }, [project, venueName]);

  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(() =>
    Math.min(Math.max(galleryUrls.length + 2, 6), 10)
  );
  const [submitting, setSubmitting] = useState(false);

  const slotFileInputRef = useRef<HTMLInputElement>(null);
  const targetSlotIndexRef = useRef<number | null>(null);

  const handleCategoryChange = (newCatId: string) => {
    const availableTags = CATEGORY_TAG_OPTIONS[newCatId] || [];
    const defaultTag = availableTags[0] || "Gia Tiên";
    setFormData((prev) => ({
      ...prev,
      categoryId: newCatId,
      tag: availableTags.includes(prev.tag) ? prev.tag : defaultTag,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, src: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSlotClick = (slotIdx: number) => {
    targetSlotIndexRef.current = slotIdx;
    if (slotFileInputRef.current) {
      slotFileInputRef.current.value = "";
      slotFileInputRef.current.click();
    }
  };

  const handleSlotFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slotIdx = targetSlotIndexRef.current;
    if (slotIdx === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    setSelectedGalleryFiles((prev) => {
      const next = [...prev];
      next[slotIdx] = file;
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setGalleryUrls((prev) => {
          const next = [...prev];
          next[slotIdx] = reader.result as string;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultiGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 10 - galleryUrls.length;
    if (availableSlots <= 0) {
      alert("Bộ sưu tập đã đủ 10 ảnh!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      setSelectedGalleryFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setGalleryUrls((prev) => {
            if (prev.length >= 10) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
    setSelectedGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setCustomSpans((prev) => {
      const next: Record<number, string> = {};
      Object.keys(prev).forEach((k) => {
        const num = Number(k);
        if (num < idx) next[num] = prev[num];
        else if (num > idx) next[num - 1] = prev[num];
      });
      return next;
    });
  };

  const handleMakeCover = (url: string) => {
    setFormData((prev) => ({ ...prev, src: url }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên dự án!");
      return;
    }

    setSubmitting(true);
    try {
      if (props.venueName !== undefined) {
        const payload: ProjectPayload = {
          title: formData.title.trim(),
          wedding_date: formData.date || null,
          style_tags: [formData.categoryId, formData.tag],
          cover_image: formData.src,
          gallery: extractGalleryUrls(formData.gallery),
          published: formData.status !== "draft",
          price_tier: formData.priceTier || "standard",
        };
        await props.onSubmit(payload);
      } else {
        await props.onSubmit(
          formData,
          selectedFile,
          galleryUrls,
          selectedGalleryFiles,
          customSpans
        );
      }
      onCancel();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu dự án!");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    galleryUrls,
    customSpans,
    setCustomSpans,
    activeSlotCount,
    setActiveSlotCount,
    submitting,
    slotFileInputRef,
    handleCategoryChange,
    handleFileUpload,
    handleSlotClick,
    handleSlotFileSelected,
    handleMultiGalleryUpload,
    handleRemoveGalleryItem,
    handleMakeCover,
    handleSubmit,
  };
}
