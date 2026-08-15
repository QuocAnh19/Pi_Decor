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
        backgroundColor: 'rgba(39, 22, 32, 0.45)',
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
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e7ded0',
          boxShadow: '0 25px 60px rgba(39, 22, 32, 0.15)',
          maxWidth: '850px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#271620'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #e7ded0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbf7f1 100%)'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                fontFamily: "'Fraunces', serif",
                color: '#271620',
                margin: 0
              }}
            >
              👑 Studio Trang Trí Phông Cưới Pi Decor
            </h2>
            <p style={{ fontSize: '13px', color: '#6e6259', marginTop: '4px', margin: 0 }}>
              Vui lòng chọn phương thức bắt đầu thiết kế dành cho quý khách:
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#fbf7f1',
              border: '1px solid #e7ded0',
              color: '#6e6259',
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
              backgroundColor: '#fdfaf7',
              borderRadius: '16px',
              border: '2px solid #a15c2e',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 8px 24px rgba(161, 92, 46, 0.12)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(161, 92, 46, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(161, 92, 46, 0.12)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                backgroundColor: '#a15c2e',
                color: '#ffffff',
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
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#271620', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Chọn Mẫu Admin Đã Set Sẵn
              </h3>
              <p style={{ fontSize: '12px', color: '#6e6259', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Hiển thị dự án trọn bộ do Admin phối sẵn tất cả các thành phần: phông rèm nền, hoa trang trí góc, dải rèm vắt và phông chữ 3D ép kim.
              </p>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid #e7ded0',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#a15c2e', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📌 Mẫu xuất bản: {publishedTemplateName || currentTemplate.name}</span>
                  {hasPublishedData && (
                    <span style={{ fontSize: '10px', backgroundColor: '#eef4ea', color: '#47663b', border: '1px solid #c5dfbb', padding: '2px 6px', borderRadius: '4px' }}>
                      ✓ Đã Publish
                    </span>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#6e6259', lineHeight: '1.6' }}>
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
                backgroundColor: '#a15c2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 2px 6px rgba(161, 92, 46, 0.25)'
              }}
            >
              👉 Dùng Mẫu Admin Đã Set
            </button>
          </div>

          {/* Option 2: Blank Scratch Canvas */}
          <div
            onClick={() => onSelectOption('scratch', currentTemplate.id)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e7ded0',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              boxShadow: '0 4px 16px rgba(39, 22, 32, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.borderColor = '#b3733b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#e7ded0'
            }}
          >
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#271620', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Tự Thiết Kế Mới Từ Đầu
              </h3>
              <p style={{ fontSize: '12px', color: '#6e6259', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Đưa mọi thứ về ban đầu lúc chưa set. Quý khách tự do chọn từng mẫu rèm, cụm hoa, chi tiết vắt và phông chữ trong giới hạn các vị trí cho phép.
              </p>

              <div
                style={{
                  backgroundColor: '#fbf7f1',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid #e7ded0',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#b3733b', fontWeight: '700', marginBottom: '6px' }}>
                  ⚡ Trạng Thái Khung Trống Mặc Định
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#6e6259', lineHeight: '1.6' }}>
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
                backgroundColor: '#fbf7f1',
                color: '#271620',
                border: '1px solid #e7ded0',
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
            borderTop: '1px solid #e7ded0',
            backgroundColor: '#f4eee3',
            fontSize: '12px',
            color: '#6e6259',
            textAlign: 'center'
          }}
        >
          💡 Bạn có thể chuyển đổi qua lại giữa Mẫu Admin và Tự Thiết Kế bất kỳ lúc nào trong quá trình chỉnh sửa.
        </div>
      </div>
    </div>
  )
}
