import React, { useState } from 'react'

export interface SaveBarProps {
  onSaveDraft: () => void
  onSaveFinal: () => void
  onExportPDF: () => void
  isDirty: boolean
  isSaving?: boolean
}

export const SaveBar: React.FC<SaveBarProps> = ({
  onSaveDraft,
  onSaveFinal,
  onExportPDF,
  isDirty,
  isSaving = false
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const handleSaveDraftClick = () => {
    onSaveDraft()
    showToast('💾 Đã lưu bản nháp vào bộ nhớ trình duyệt (localStorage)!')
  }

  const handleSaveFinalClick = () => {
    onSaveFinal()
    showToast('🚀 Đã gửi lưu thiết kế tới hệ thống server Pi Decor!')
  }

  const handleExportPDFClick = () => {
    onExportPDF()
    showToast('📄 Tính năng xuất file PDF báo giá chi tiết sắp ra mắt ở Milestone 5!')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '0',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #e11d48',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            whiteSpace: 'nowrap',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Save Draft Button */}
      <button
        onClick={handleSaveDraftClick}
        disabled={isSaving}
        style={{
          padding: '8px 16px',
          backgroundColor: '#334155',
          color: '#f8fafc',
          border: '1px solid #475569',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        💾 Lưu nháp
      </button>

      {/* Save Final Design Button */}
      <button
        onClick={handleSaveFinalClick}
        disabled={isSaving}
        style={{
          padding: '8px 18px',
          backgroundColor: '#e11d48',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.4)',
          position: 'relative'
        }}
      >
        {isDirty && (
          <span
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#fbbf24',
              borderRadius: '50%',
              display: 'inline-block'
            }}
          />
        )}
        🚀 Lưu thiết kế
      </button>

      {/* Export PDF Stub Button */}
      <button
        onClick={handleExportPDFClick}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          border: '1px solid #334155',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        📄 Xuất PDF
      </button>
    </div>
  )
}
