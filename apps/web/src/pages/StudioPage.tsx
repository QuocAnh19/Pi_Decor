import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomerEditor, CustomerTemplateGallery } from "../features/studio";
import { api } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { parseDesignSnapshot } from "../lib/mappers";
import type { Lead } from "../lib/types";
import { SEO } from "../components/common/SEO";
import styles from "./StudioPage.module.scss";

export function StudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const { token } = useAuth();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  useEffect(() => {
    if (leadId && token) {
      setLoadingLead(true);
      api
        .getLead(leadId)
        .then((lead) => {
          setEditingLead(lead);
          const parsed = parseDesignSnapshot(lead.design_snapshot);
          setSelectedTemplateId(parsed.templateId);
        })
        .catch((err) => {
          console.error("Failed to load lead for studio editing:", err);
        })
        .finally(() => {
          setLoadingLead(false);
        });
    }
  }, [leadId, token]);

  if (loadingLead) {
    return (
      <div
        className={styles.page}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          color: "#6e6259",
          fontSize: "15px",
          fontWeight: "600",
        }}
      >
        <p>Đang tải bản phối cảnh thiết kế của khách hàng...</p>
      </div>
    );
  }

  if (!selectedTemplateId) {
    return (
      <div className={styles.page}>
        <SEO
          title="Studio Thiết Kế Phối Cảnh Tiệc Cưới & Sự Kiện"
          description="Tự tay tùy biến và phối cảnh không gian tiệc cưới, sự kiện tương tác trực quan 2D theo phong cách cá nhân hóa cùng Pi Decor."
          canonical="/studio"
        />
        <CustomerTemplateGallery onSelectTemplate={(id) => setSelectedTemplateId(id)} />
      </div>
    );
  }

  const parsedSnapshot = parseDesignSnapshot(editingLead?.design_snapshot);

  return (
    <div className={styles.page}>
      <SEO
        title="Chỉnh Sửa Phối Cảnh Decor — Studio"
        description="Tùy chỉnh màu sắc backdrop, hoa cưới, rèm và phụ kiện trong bản thiết kế của bạn."
        canonical="/studio"
      />
      <CustomerEditor
        templateId={selectedTemplateId}
        overrideSlots={parsedSnapshot.customSlots}
        overrideSlotConfig={parsedSnapshot.slotConfig}
        editingLead={editingLead}
        onBackToGallery={() => {
          setSelectedTemplateId(null);
          setEditingLead(null);
          if (leadId) {
            setSearchParams({});
          }
        }}
      />
    </div>
  );
}
