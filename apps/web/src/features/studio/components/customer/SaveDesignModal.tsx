import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSaveDesignForm } from "../../hooks/useSaveDesignForm";
import type { SlotConfig, SlotDefinition } from "../../types";
import { SaveDesignSuccessView } from "./SaveDesignSuccessView";
import { SaveDesignFormView } from "./SaveDesignFormView";

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotConfig: SlotConfig;
  templateId?: string;
  templateName?: string;
  slots?: SlotDefinition[];
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  slotConfig,
  templateId = "tpl-classic-01",
  templateName = "Phối cảnh tiệc cưới",
  slots = [],
}) => {
  const {
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
    consent,
    setConsent,
    loading,
    error,
    success,
    exportedImageUrl,
    handleSubmit,
    handleManualDownload,
  } = useSaveDesignForm({ slotConfig, templateId, templateName, slots });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(39, 22, 32, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e7ded0",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "26px",
          boxShadow: "0 25px 60px rgba(39, 22, 32, 0.2)",
          color: "#271620",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "'Fraunces', serif",
              color: "#271620",
              margin: 0,
            }}
          >
            {success ? "Lưu Thiết Kế Thành Công" : "Lưu & Nhận Tư Vấn Báo Giá"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              border: "none",
              background: "transparent",
              color: "#6e6259",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <SaveDesignSuccessView
            phone={phone}
            exportedImageUrl={exportedImageUrl}
            onManualDownload={handleManualDownload}
            onClose={onClose}
          />
        ) : (
          <SaveDesignFormView
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            weddingDate={weddingDate}
            setWeddingDate={setWeddingDate}
            message={message}
            setMessage={setMessage}
            consent={consent}
            setConsent={setConsent}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
