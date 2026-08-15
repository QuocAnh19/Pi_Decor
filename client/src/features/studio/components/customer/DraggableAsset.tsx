import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Asset } from '../../types'

export interface DraggableAssetProps {
  asset: Asset
  isBeingDragged?: boolean
  isUsed?: boolean
  onClick?: () => void
}

export const DraggableAsset: React.FC<DraggableAssetProps> = ({
  asset,
  isBeingDragged = false,
  isUsed = false,
  onClick
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `asset-draggable-${asset.id}`,
    data: { asset }
  })

  const style: React.CSSProperties = {
    opacity: isBeingDragged ? 0.4 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    touchAction: 'none'
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{
        backgroundColor: isUsed ? 'rgba(30, 41, 59, 0.9)' : '#1e293b',
        border: `1px solid ${isUsed ? '#34d399' : '#334155'}`,
        borderRadius: '10px',
        padding: '12px',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.15s ease',
        boxShadow: isUsed ? '0 0 10px rgba(52, 211, 153, 0.15)' : '0 2px 4px rgba(0,0,0,0.2)',
        userSelect: 'none',
        position: 'relative',
        ...style
      }}
    >
      {/* Used Badge */}
      {isUsed && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            backgroundColor: 'rgba(52, 211, 153, 0.2)',
            color: '#34d399',
            fontSize: '9px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #34d399'
          }}
        >
          Đã dùng
        </span>
      )}

      {/* Asset Preview Thumbnail / Swatch */}
      <div
        style={{
          width: '100%',
          height: '76px',
          borderRadius: '6px',
          backgroundColor: '#020617',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4px',
          position: 'relative'
        }}
      >
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        ) : asset.svgData ? (
          <svg
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          >
            <g dangerouslySetInnerHTML={{ __html: asset.svgData }} />
          </svg>
        ) : asset.colorHex ? (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: asset.colorHex,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
            }}
          />
        ) : (
          <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>
            {asset.name[0]}
          </div>
        )}
      </div>

      {/* Title & Tag Badges */}
      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {asset.name}
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
          {(asset.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '9px',
                backgroundColor: '#334155',
                color: '#94a3b8',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
