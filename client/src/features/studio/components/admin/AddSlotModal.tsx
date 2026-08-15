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
}

const SLOT_TYPE_OPTIONS = [
  { value: "drape", label: "Rèm nền" },
  { value: "drape_detail", label: "Rèm chi tiết" },
  { value: "flower", label: "Cụm hoa" },
  { value: "text_name", label: "Dãy chữ số" },
];

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingSlots = [],
  existingSlotKeys,
  initialNormPos,
}) => {
  const [slotKey, setSlotKey] = useState("");
  const [label, setLabel] = useState("");
  const [slotType, setSlotType] = useState<SlotType>("drape");
  const [required, setRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSlotKey("");
      setLabel("");
      setSlotType("drape");
      setRequired(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedKey = slotKey.trim().toLowerCase();
    if (!trimmedKey) {
      setErrorMessage("Vui lòng nhập Slot Key!");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(trimmedKey)) {
      setErrorMessage(
        "Slot Key chỉ được chứa chữ thường (a-z), số (0-9) và dấu gạch ngang (-)!",
      );
      return;
    }

    if (existingSlotKeys.includes(trimmedKey)) {
      setErrorMessage(
        `Slot Key '${trimmedKey}' đã tồn tại trong template này!`,
      );
      return;
    }

    if (!label.trim()) {
      setErrorMessage("Vui lòng nhập Tên hiển thị!");
      return;
    }

    const sameTypeSlot = existingSlots.find((s) => s.slotType === slotType);
    const defaultDims = getDefaultSlotDimensions(slotType);
    const normWidth = sameTypeSlot?.normWidth ?? defaultDims.normWidth;
    const normHeight = sameTypeSlot?.normHeight ?? defaultDims.normHeight;

    onAdd({
      slotKey: trimmedKey,
      label: label.trim(),
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
      required,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm slot mới"
      maxWidth="480px"
    >
      {errorMessage && (
        <div className={styles.errorMessage}>⚠️ {errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Slot key (Dạng kebab-case, ví dụ: flower-right)"
          type="text"
          placeholder="nhap-slot-key-moi"
          value={slotKey}
          onChange={(e) => setSlotKey(e.target.value)}
        />

        <Input
          label="Tên hiển thị"
          type="text"
          placeholder="VD: Cụm Hoa Bên Phải"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <Select
          label="Loại Slot"
          value={slotType}
          onChange={(e) => setSlotType(e.target.value as SlotType)}
          options={SLOT_TYPE_OPTIONS}
        />

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          Thành phần bắt buộc điền
        </label>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Hủy
          </button>
          <button type="submit" className={styles.submitBtn}>
            Tạo Slot
          </button>
        </div>
      </form>
    </Modal>
  );
};
