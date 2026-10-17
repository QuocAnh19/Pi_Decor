import { useState, useEffect, useId, FormEvent, ChangeEvent } from "react";
import { createServiceSchema } from "@pidecor/shared";
import { Modal, Input, Textarea, Button } from "../../../components/ui";
import type { ServiceCategory, ServiceAccent } from "../../../lib/types";
import { ServiceGeneralFields } from "./ServiceGeneralFields";
import { ServiceItemsEditor } from "./ServiceItemsEditor";
import { ServiceMediaUploader } from "./ServiceMediaUploader";
import styles from "./ServiceFormModal.module.scss";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: ServiceCategory | null;
  onSubmit: (data: FormData | Partial<ServiceCategory>) => Promise<void>;
  loading?: boolean;
}

export function ServiceFormModal({
  isOpen,
  onClose,
  service,
  onSubmit,
  loading = false,
}: ServiceFormModalProps) {
  const brandId = useId();
  const titleId = useId();
  const taglineId = useId();
  const iconId = useId();
  const descId = useId();
  const hrefId = useId();
  const ctaId = useId();
  const orderId = useId();
  const coverUrlId = useId();
  const imageUrlId = useId();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [tagline, setTagline] = useState("");
  const [accent, setAccent] = useState<ServiceAccent>("wedding");
  const [icon, setIcon] = useState("HeartIcon");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [href, setHref] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Liên hệ tư vấn");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState<number>(0);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setTitle(service.title || "");
      setBrand(service.brand || "");
      setTagline(service.tagline || "");
      setAccent(service.accent || "wedding");
      setIcon(service.icon || "HeartIcon");
      setDescription(service.description || "");
      setItems(Array.isArray(service.items) ? [...service.items] : []);
      setHref(service.href || "");
      setCtaLabel(service.ctaLabel || "Liên hệ tư vấn");
      setFeatured(Boolean(service.featured));
      setOrder(service.order ?? 0);
      setCoverUrl(service.cover || "");
      setImageUrl((service as unknown as { image_url?: string }).image_url || "");
    } else {
      setTitle("");
      setBrand("");
      setTagline("");
      setAccent("wedding");
      setIcon("HeartIcon");
      setDescription("");
      setItems([""]);
      setHref("");
      setCtaLabel("Liên hệ tư vấn");
      setFeatured(false);
      setOrder(0);
      setCoverUrl("");
      setImageUrl("");
    }
    setCoverFile(null);
    setImageFile(null);
    setError(null);
  }, [service, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const filteredItems = items.map((i) => i.trim()).filter(Boolean);

    // Validate using Zod schema from @pidecor/shared
    const validationResult = createServiceSchema.safeParse({
      title,
      brand: brand || title,
      tagline,
      description,
      icon,
      accent,
      items: filteredItems,
      href: href || null,
      cta_label: ctaLabel,
      featured,
      cover: coverUrl || null,
      image_url: imageUrl || null,
      order,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setError(firstIssue?.message || "Dữ liệu nhập vào chưa hợp lệ.");
      return;
    }

    if (coverFile || imageFile) {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("brand", (brand || title).trim());
      if (tagline) formData.append("tagline", tagline.trim());
      if (description) formData.append("description", description.trim());
      if (icon) formData.append("icon", icon.trim());
      if (accent) formData.append("accent", accent);
      formData.append("items", JSON.stringify(filteredItems));
      if (href) formData.append("href", href.trim());
      formData.append("cta_label", ctaLabel.trim());
      formData.append("featured", String(featured));
      formData.append("order", String(order));

      if (coverFile) {
        formData.append("cover", coverFile);
      } else if (coverUrl) {
        formData.append("cover", coverUrl);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("image_url", imageUrl);
      }

      await onSubmit(formData);
    } else {
      await onSubmit({
        title: title.trim(),
        brand: (brand || title).trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        icon: icon.trim(),
        accent,
        items: filteredItems,
        href: href.trim() || null,
        ctaLabel: ctaLabel.trim(),
        featured,
        order,
        cover: coverUrl.trim() || null,
        ...(imageUrl.trim() ? { image_url: imageUrl.trim() } : {}),
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <div className={styles.errorText} role="alert">
            {error}
          </div>
        )}

        <ServiceGeneralFields
          titleId={titleId}
          brandId={brandId}
          taglineId={taglineId}
          iconId={iconId}
          orderId={orderId}
          title={title}
          brand={brand}
          tagline={tagline}
          accent={accent}
          icon={icon}
          order={order}
          onTitleChange={setTitle}
          onBrandChange={setBrand}
          onTaglineChange={setTagline}
          onAccentChange={setAccent}
          onIconChange={setIcon}
          onOrderChange={setOrder}
        />

        <div className={styles.fieldGroup}>
          <label htmlFor={descId} className={styles.label}>
            Mô tả tóm tắt
          </label>
          <Textarea
            id={descId}
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả nội dung gói dịch vụ xuất hiện trong thẻ..."
          />
        </div>

        <ServiceItemsEditor items={items} onChange={setItems} />

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor={hrefId} className={styles.label}>
              Đường dẫn liên kết (Href)
            </label>
            <Input
              id={hrefId}
              value={href}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHref(e.target.value)}
              placeholder="VD: /studio hoặc để trống"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={ctaId} className={styles.label}>
              Nhãn nút bấm (CTA Label)
            </label>
            <Input
              id={ctaId}
              value={ctaLabel}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCtaLabel(e.target.value)}
              placeholder="VD: Liên hệ tư vấn"
            />
          </div>
        </div>

        <ServiceMediaUploader
          coverUrlId={coverUrlId}
          imageUrlId={imageUrlId}
          coverUrl={coverUrl}
          imageUrl={imageUrl}
          onCoverFileChange={setCoverFile}
          onCoverUrlChange={setCoverUrl}
          onImageFileChange={setImageFile}
          onImageUrlChange={setImageUrl}
        />

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span>Dịch vụ nổi bật (Hiển thị ô Bento lớn trên Trang chủ)</span>
        </label>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Huỷ bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : service ? "Lưu thay đổi" : "Tạo dịch vụ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
