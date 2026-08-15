import React, { useState, useEffect } from "react";
import {
  SlotDefinition,
  SlotType,
  getDefaultSlotDimensions,
} from "../../types";
import { Modal, Input, Select } from "../../../../components/ui";
import styles from "./AddSlotModal.module.scss";

export interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSlot: Omit<SlotDefinition, "id" | "templateId">) => void;
  existingSlots?: SlotDefinition[];
  existingSlotKeys: string[];
  initialNormPos?: { normX: number; normY: number };
  mode?: "admin" | "customer";
}

const ADMIN_SLOT_TYPE_OPTIONS = [
  { value: "drape", label: "Rèm nền (drape)" },
  { value: "drape_detail", label: "Rèm chi tiết (drape_detail)" },
  { value: "flower", label: "Cụm hoa (flower)" },
  { value: "text_name", label: "Dãy chữ số (text_name)" },
];

const CUSTOMER_SLOT_TYPE_OPTIONS = [
  { value: "flower", label: "🌸 Cụm hoa trang trí" },
  { value: "drape_detail", label: "🎀 Dải lụa vắt mềm" },
  { value: "text_name", label: "✍️ Bảng tên Cô Dâu & Chú Rể" },
  { value: "drape", label: "🪟 Rèm vải nền" },
];

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingSlots = [],
  existingSlotKeys,
  initialNormPos,
  mode = "admin",
}) => {
  const isCustomer = mode === "customer";
  const [slotKey, setSlotKey] = useState("");
  const [label, setLabel] = useState("");
  const [slotType, setSlotType] = useState<SlotType>(isCustomer ? "flower" : "drape");
  const [required, setRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSlotKey("");
      setLabel("");
      setSlotType(isCustomer ? "flower" : "drape");
      setRequired(false);
      setErrorMessage("");
    }
  }, [isOpen, isCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalKey = slotKey.trim().toLowerCase();

    if (isCustomer) {
      // Auto generate friendly unique key for customer
      if (!finalKey) {
        const prefix = slotType === "flower" ? "flower" : slotType === "drape_detail" ? "drape-sub" : slotType;
        const uniqueNum = Date.now().toString().slice(-4);
        finalKey = `${prefix}-${uniqueNum}`;
      }
      if (!label.trim()) {
        const defaultNames: Record<string, string> = {
          flower: "Cụm hoa mới",
          drape_detail: "Dải lụa vắt mới",
          text_name: "Bảng tên mới",
          drape: "Rèm nền mới",
        };
        setLabel(defaultNames[slotType] || "Vị trí mới");
      }
    } else {
      if (!finalKey) {
        setErrorMessage("Vui lòng nhập Slot Key!");
        return;
      }

      if (!/^[a-z0-9-]+$/.test(finalKey)) {
        setErrorMessage(
          "Slot Key chỉ được chứa chữ thường (a-z), số (0-9) và dấu gạch ngang (-)!",
        );
        return;
      }

      if (existingSlotKeys.includes(finalKey)) {
        setErrorMessage(
          `Slot Key '${finalKey}' đã tồn tại trong template này!`,
        );
        return;
      }

      if (!label.trim()) {
        setErrorMessage("Vui lòng nhập Tên hiển thị!");
        return;
      }
    }

    const sameTypeSlot = existingSlots.find((s) => s.slotType === slotType);
    const defaultDims = getDefaultSlotDimensions(slotType);
    const normWidth = sameTypeSlot?.normWidth ?? defaultDims.normWidth;
    const normHeight = sameTypeSlot?.normHeight ?? defaultDims.normHeight;

    const finalLabel = label.trim() || (slotType === "flower" ? "Cụm hoa trang trí" : "Vị trí mới");

    onAdd({
      slotKey: finalKey,
      label: finalLabel,
      slotType,
      normX: initialNormPos?.normX ?? 0.5,
      normY: initialNormPos?.normY ?? 0.5,
      normWidth,
      normHeight,
      allowScale: true,
      allowRotate: true,
      mirrorX: false,
      zIndex: sameTypeSlot?.zIndex ?? 5,
      sortOrder: existingSlotKeys.length + 1,
      required: isCustomer ? false : required,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCustomer ? "✨ Thêm Vị Trí Trang Trí Mới" : "Thêm slot mới"}
      maxWidth="480px"
    >
      {errorMessage && (
        <div className={styles.errorMessage}>⚠️ {errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Select
          label="Loại Hạng Mục Trang Trí"
          value={slotType}
          onChange={(e) => setSlotType(e.target.value as SlotType)}
          options={isCustomer ? CUSTOMER_SLOT_TYPE_OPTIONS : ADMIN_SLOT_TYPE_OPTIONS}
        />

        <Input
          label={isCustomer ? "Tên gọi vị trí (Tùy chọn)" : "Tên hiển thị"}
          type="text"
          placeholder={isCustomer ? "VD: Cụm hoa góc dưới, Dải lụa phụ..." : "VD: Cụm Hoa Bên Phải"}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        {!isCustomer && (
          <>
            <Input
              label="Slot key (Dạng kebab-case, ví dụ: flower-right)"
              type="text"
              placeholder="nhap-slot-key-moi"
              value={slotKey}
              onChange={(e) => setSlotKey(e.target.value)}
            />

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              Thành phần bắt buộc điền
            </label>
          </>
        )}

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Hủy
          </button>
          <button type="submit" className={styles.submitBtn}>
            {isCustomer ? "+ Thêm Vào Phông" : "Tạo Slot"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
