import React, { useState, useRef } from 'react'

export interface TemplateUploaderProps {
  onUploadBase: (svgContent: string, fileName: string) => void
}

export const TemplateUploader: React.FC<TemplateUploaderProps> = ({
  onUploadBase
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    setErrorMessage(null)

    if (!file.name.toLowerCase().endsWith('.svg')) {
      setErrorMessage('Chỉ chấp nhận file định dạng SVG (.svg)!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng file SVG vượt quá 5MB!')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content && content.includes('<svg')) {
        onUploadBase(content, file.name)
      } else {
        setErrorMessage('Nội dung file không phải là file SVG hợp lệ!')
      }
    }
    reader.onerror = () => setErrorMessage('Đã xảy ra lỗi khi đọc file SVG!')
    reader.readAsText(file)
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0])
            e.target.value = ''
          }
        }}
      />

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsHovered(true)
        }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsHovered(false)
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isHovered ? '#38bdf8' : '#e11d48'}`,
          backgroundColor: isHovered ? 'rgba(56, 189, 248, 0.1)' : 'rgba(225, 29, 72, 0.08)',
          borderRadius: '8px',
          padding: '12px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {/* <div style={{ fontSize: '18px', marginBottom: '2px' }}>🖼️</div> */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
          Đổi Khung Phông Nền SVG
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
          Tải file SVG phông nền tĩnh bên dưới canvas (&lt; 5MB)
        </div>
      </div>

      {errorMessage && (
        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  )
}
