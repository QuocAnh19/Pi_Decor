import { ChangeEvent } from "react";
import { Input } from "../../../components/ui";
import { resolveIcon } from "../../../lib/icons";
import type { ServiceAccent } from "../../../lib/types";
import styles from "./ServiceFormModal.module.scss";

export const ACCENT_OPTIONS: { value: ServiceAccent; label: string; dotClass: string }[] = [
  { value: "wedding", label: "PiWedding (Gold/Rose)", dotClass: styles.dotWedding },
  { value: "kids", label: "PiKids (Pastel/Peach)", dotClass: styles.dotKids },
  { value: "event", label: "PiEvent (Navy/Slate)", dotClass: styles.dotEvent },
];

interface ServiceGeneralFieldsProps {
  titleId: string;
  brandId: string;
  taglineId: string;
  iconId: string;
  orderId: string;
  title: string;
  brand: string;
  tagline: string;
  accent: ServiceAccent;
  icon: string;
  order: number;
  onTitleChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onTaglineChange: (v: string) => void;
  onAccentChange: (v: ServiceAccent) => void;
  onIconChange: (v: string) => void;
  onOrderChange: (v: number) => void;
}

export function ServiceGeneralFields({
  titleId,
  brandId,
  taglineId,
  iconId,
  orderId,
  title,
  brand,
  tagline,
  accent,
  icon,
  order,
  onTitleChange,
  onBrandChange,
  onTaglineChange,
  onAccentChange,
  onIconChange,
  onOrderChange,
}: ServiceGeneralFieldsProps) {
  const IconComp = resolveIcon(icon);

  return (
    <>
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor={titleId} className={styles.label}>
            Tiêu đề dịch vụ *
          </label>
          <Input
            id={titleId}
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
            placeholder="VD: Dấu mốc đầu đời"
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor={brandId} className={styles.label}>
            Nhãn hiệu (Brand)
          </label>
          <Input
            id={brandId}
            value={brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onBrandChange(e.target.value)}
            placeholder="VD: PiKids / PiWedding"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor={taglineId} className={styles.label}>
            Lời đề tựa (Tagline)
          </label>
          <Input
            id={taglineId}
            value={tagline}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onTaglineChange(e.target.value)}
            placeholder="VD: Thôi nôi, sinh nhật lung linh"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tông màu (Accent Daub)</label>
          <div className={styles.accentPicker}>
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.accentOption} ${accent === opt.value ? styles.accentActive : ""}`}
                onClick={() => onAccentChange(opt.value)}
              >
                <span className={`${styles.dot} ${opt.dotClass}`} />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor={iconId} className={styles.label}>
            Biểu tượng (Icon)
          </label>
          <div className={styles.iconPreview}>
            <div className={styles.iconBox}>
              <IconComp style={{ width: 22, height: 22 }} />
            </div>
            <Input
              id={iconId}
              value={icon}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onIconChange(e.target.value)}
              placeholder="HeartIcon, SparklesIcon, KidsIcon..."
            />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor={orderId} className={styles.label}>
            Thứ tự hiển thị (Order)
          </label>
          <Input
            id={orderId}
            type="number"
            value={order}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onOrderChange(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}
