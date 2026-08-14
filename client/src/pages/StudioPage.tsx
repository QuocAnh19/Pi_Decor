import { useState } from 'react';
import { CustomerEditor, CustomerTemplateGallery } from '../features/studio';
import styles from './StudioPage.module.scss';

/**
 * StudioPage — route /studio
 * Cho phép khách hàng xem danh sách template đã xuất bản bởi Admin, chọn template và tùy chỉnh trực tiếp.
 */
export function StudioPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  if (!selectedTemplateId) {
    return (
      <div className={styles.page}>
        <CustomerTemplateGallery onSelectTemplate={(id) => setSelectedTemplateId(id)} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <CustomerEditor
        templateId={selectedTemplateId}
        onBackToGallery={() => setSelectedTemplateId(null)}
      />
    </div>
  )
}
