import { useState } from 'react';
import { CustomerEditor, CustomerTemplateGallery } from '../features/studio';
import styles from './StudioPage.module.scss';

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
