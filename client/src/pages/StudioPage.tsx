import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CustomerEditor, CustomerTemplateGallery } from '../features/studio';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import type { Lead } from '../lib/types';
import styles from './StudioPage.module.scss';

export function StudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
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
          const snapshot = lead.design_snapshot as any;
          if (snapshot?.template_id) {
            setSelectedTemplateId(snapshot.template_id);
          } else {
            setSelectedTemplateId("tpl-classic-01");
          }
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          color: '#6e6259',
          fontSize: '15px',
          fontWeight: '600',
        }}
      >
        <p>Đang tải bản phối cảnh thiết kế của khách hàng...</p>
      </div>
    );
  }

  if (!selectedTemplateId) {
    return (
      <div className={styles.page}>
        <CustomerTemplateGallery onSelectTemplate={(id) => setSelectedTemplateId(id)} />
      </div>
    );
  }

  const snapshot = editingLead?.design_snapshot as any;

  return (
    <div className={styles.page}>
      <CustomerEditor
        templateId={selectedTemplateId}
        overrideSlots={snapshot?.custom_slots}
        overrideSlotConfig={snapshot?.slot_config || (snapshot?.baseFabric ? snapshot : undefined)}
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
