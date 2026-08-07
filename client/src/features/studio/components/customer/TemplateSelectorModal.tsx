import React from 'react'
import { Template } from '../../types'

export interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  templates: Template[]
  selectedTemplateId: string
  hasPublishedData: boolean
  publishedTemplateName?: string
  onSelectOption: (mode: 'published' | 'scratch', templateId: string) => void
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  hasPublishedData,
  publishedTemplateName,
  onSelectOption
}) => {
  if (!isOpen) return null

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '850px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                fontFamily: "'Playfair Display', serif",
                color: '#ffffff',
                margin: 0
              }}
            >
              👑 Studio Trang Trí Phông Cưới Pi Decor
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              Vui lòng chọn phương thức bắt đầu thiết kế dành cho quý khách:
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body with 2 Options */}
        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Option 1: Admin Published Template */}
          <div
            onClick={() => onSelectOption('published', currentTemplate.id)}
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '2px solid #38bdf8',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.15)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(56, 189, 248, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(56, 189, 248, 0.15)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Khuyên Dùng
            </div>

            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👑</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Chọn Mẫu Admin Đã Set Sẵn
              </h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Hiển thị dự án trọn bộ do Admin phối sẵn tất cả các thành phần: phông rèm nền, hoa trang trí góc, dải rèm vắt và phông chữ 3D ép kim.
              </p>

              <div
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #334155',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📌 Mẫu xuất bản: {publishedTemplateName || currentTemplate.name}</span>
                  {hasPublishedData && (
                    <span style={{ fontSize: '10px', backgroundColor: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                      ✓ Đã Publish
                    </span>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' }}>
                  <li>✓ Rèm nhung đỏ đô cao cấp</li>
                  <li>✓ Cụm hoa trang trí Pastel</li>
                  <li>✓ Bộ chữ Lễ Vu Quy ép kim 3D</li>
                  <li>✓ Đã tinh chỉnh khoảng cách &amp; tỷ lệ chuẩn</li>
                </ul>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelectOption('published', currentTemplate.id)
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              👉 Dùng Mẫu Admin Đã Set
            </button>
          </div>

          {/* Option 2: Blank Scratch Canvas */}
          <div
            onClick={() => onSelectOption('scratch', currentTemplate.id)}
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #475569',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.borderColor = '#fbbf24'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#475569'
            }}
          >
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Tự Thiết Kế Mới Từ Đầu
              </h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Đưa mọi thứ về ban đầu lúc chưa set. Quý khách tự do chọn từng mẫu rèm, cụm hoa, chi tiết vắt và phông chữ trong giới hạn các vị trí cho phép.
              </p>

              <div
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #334155',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', marginBottom: '6px' }}>
                  ⚡ Trạng Thái Khung Trống Mặc Định
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' }}>
                  <li>✓ Khung canvas ban đầu chưa gắn mẫu</li>
                  <li>✓ Tùy chọn từng slot từ thư viện asset</li>
                  <li>✓ Tuân thủ quy tắc kết hợp (Rules)</li>
                  <li>✓ Sáng tạo không giới hạn</li>
                </ul>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelectOption('scratch', currentTemplate.id)
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ✨ Tạo Thiết Kế Mới (Trống)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #334155',
            backgroundColor: '#0f172a',
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center'
          }}
        >
          💡 Bạn có thể chuyển đổi qua lại giữa Mẫu Admin và Tự Thiết Kế bất kỳ lúc nào trong quá trình chỉnh sửa.
        </div>
      </div>
    </div>
  )
}
