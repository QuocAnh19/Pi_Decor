import React, { useState, useRef } from 'react'
import { SlotType, Asset } from '../../types'

export interface TemplateUploaderProps {
  onUploadBase: (svgContent: string, fileName: string) => void
  onAddAsset: (asset: Omit<Asset, 'id'>, assignToCurrentSlot?: boolean) => void
}

export const TemplateUploader: React.FC<TemplateUploaderProps> = ({
  onUploadBase,
  onAddAsset
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Pending file state for choice modal
  const [pendingFile, setPendingFile] = useState<{ content: string; name: string } | null>(null)
  
  // Modal form states
  const [uploadType, setUploadType] = useState<'base' | 'asset'>('asset')
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState<SlotType>('drape')
  const [assetTags, setAssetTags] = useState('rèm-mới, tùy-chỉnh')
  const [autoAssign, setAutoAssign] = useState(true)

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
        const cleanName = file.name.replace('.svg', '')
        setPendingFile({ content, name: file.name })
        setAssetName(`Mẫu ${cleanName}`)
        setUploadType('asset')
      } else {
        setErrorMessage('Nội dung file không phải là file SVG hợp lệ!')
      }
    }
    reader.onerror = () => setErrorMessage('Đã xảy ra lỗi khi đọc file SVG!')
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovered(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleConfirmUpload = () => {
    if (!pendingFile) return

    if (uploadType === 'base') {
      onUploadBase(pendingFile.content, pendingFile.name)
    } else {
      if (!assetName.trim()) {
        alert('Vui lòng nhập tên mẫu asset!')
        return
      }

      const tagsArr = assetTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      onAddAsset(
        {
          assetType,
          name: assetName.trim(),
          svgData: pendingFile.content,
          tags: tagsArr,
          isActive: true
        },
        autoAssign
      )
    }

    setPendingFile(null)
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
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isHovered ? '#38bdf8' : '#e11d48'}`,
          backgroundColor: isHovered ? 'rgba(56, 189, 248, 0.1)' : 'rgba(225, 29, 72, 0.08)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📤</div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
          Tải Lên File SVG Mới
        </div>
        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
          Thêm Rèm Nền / Hoa / Chi Tiết / Phông Nền (&lt; 5MB)
        </div>
      </div>

      {errorMessage && (
        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Choice Modal when File is Uploaded */}
      {pendingFile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #38bdf8',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>
              ❓ Bạn muốn dùng file '{pendingFile.name}' này làm gì?
            </h3>

            {/* Radio options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: uploadType === 'asset' ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                  border: `1px solid ${uploadType === 'asset' ? '#38bdf8' : '#334155'}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="uploadType"
                  checked={uploadType === 'asset'}
                  onChange={() => setUploadType('asset')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    🪟 Làm Mẫu Asset Điền Vào Slot (Khuyến nghị cho Rèm / Hoa / Chữ)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    File SVG này sẽ trở thành mẫu rèm/hoa nằm trong ô Slot và có thể tự do di chuyển, co giãn, chỉnh sửa.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: uploadType === 'base' ? 'rgba(225, 29, 72, 0.15)' : '#0f172a',
                  border: `1px solid ${uploadType === 'base' ? '#e11d48' : '#334155'}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="uploadType"
                  checked={uploadType === 'base'}
                  onChange={() => setUploadType('base')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    🖼️ Làm Khung Phông Nền Tĩnh (Base Template Background)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    File SVG này sẽ thay thế toàn bộ tấm phông nền bên dưới canvas.
                  </div>
                </div>
              </label>
            </div>

            {/* Asset Extra Form Fields if uploadType === 'asset' */}
            {uploadType === 'asset' && (
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
                    Loại Thành Phần (Slot Type)
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as SlotType)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', fontSize: '13px' }}
                  >
                    <option value="drape">🪟 Rèm nền chính (drape)</option>
                    <option value="drape_detail">🎗️ Chi tiết rèm lớp phủ (drape_detail)</option>
                    <option value="flower">🌸 Cụm hoa trang trí (flower)</option>
                    <option value="text_name">✍️ Tên chú rể & cô dâu (text_name)</option>
                    <option value="prop">📦 Phụ kiện khác (prop)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
                    Tên Mẫu Asset
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Tags (Phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={assetTags}
                    onChange={(e) => setAssetTags(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', fontSize: '13px' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#34d399', cursor: 'pointer', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={(e) => setAutoAssign(e.target.checked)}
                  />
                  ⚡ Gán ngay mẫu SVG này vào Slot đang chọn trên Canvas
                </label>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setPendingFile(null)}
                style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmUpload}
                style={{ padding: '8px 20px', backgroundColor: '#e11d48', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✓ Xác Nhận Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
