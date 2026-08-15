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
    showToast('Đã lưu bản nháp vào bộ nhớ trình duyệt (localStorage)!')
  }

  const handleSaveFinalClick = () => {
    onSaveFinal()
    showToast('Đã gửi lưu thiết kế tới hệ thống server Pi Decor!')
  }

  const handleExportPDFClick = () => {
    onExportPDF()
    showToast('Tính năng xuất file PDF báo giá chi tiết sắp ra mắt ở Milestone 5!')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '0',
            backgroundColor: '#271620',
            color: '#fbf7f1',
            border: '1px solid #a15c2e',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '12px',
            boxShadow: '0 10px 25px rgba(39, 22, 32, 0.2)',
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
          padding: '8px 14px',
          backgroundColor: '#ffffff',
          color: '#271620',
          border: '1px solid #e7ded0',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 1px 3px rgba(39, 22, 32, 0.04)'
        }}
      >
        Lưu nháp
      </button>

      {/* Save Final Design Button */}
      <button
        onClick={handleSaveFinalClick}
        disabled={isSaving}
        style={{
          padding: '8px 16px',
          backgroundColor: '#a15c2e',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(161, 92, 46, 0.25)',
          position: 'relative'
        }}
      >
        {isDirty && (
          <span
            style={{
              width: '7px',
              height: '7px',
              backgroundColor: '#fbbf24',
              borderRadius: '50%',
              display: 'inline-block'
            }}
          />
        )}
        Lưu thiết kế
      </button>

      {/* Export PDF Stub Button */}
      <button
        onClick={handleExportPDFClick}
        style={{
          padding: '8px 14px',
          backgroundColor: '#fbf7f1',
          color: '#6e6259',
          border: '1px solid #e7ded0',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
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
