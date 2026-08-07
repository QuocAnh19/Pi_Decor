import React from 'react'
import { SlotDefinition, SlotConfig } from '../../types'

export interface SlotProgressBarProps {
  slots: SlotDefinition[]
  slotConfig: SlotConfig
}

export const SlotProgressBar: React.FC<SlotProgressBarProps> = ({ slots, slotConfig }) => {
  const totalSlots = slots.length
  const filledSlotsCount = slots.filter((slot) => Boolean(slotConfig[slot.slotKey]?.asset)).length

  const requiredSlots = slots.filter((s) => s.required)
  const filledRequiredCount = requiredSlots.filter((slot) => Boolean(slotConfig[slot.slotKey]?.asset)).length

  const percent = totalSlots > 0 ? Math.round((filledSlotsCount / totalSlots) * 100) : 0
  const isComplete = requiredSlots.length > 0 ? filledRequiredCount === requiredSlots.length : percent === 100

  let barColor = '#f59e0b' // amber
  if (isComplete) {
    barColor = '#10b981' // emerald green
  } else if (percent < 30) {
    barColor = '#64748b' // slate
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
          <span style={{ color: '#f8fafc' }}>
            🎯 Tiến độ thiết kế: <strong style={{ color: barColor }}>{filledSlotsCount} / {totalSlots} thành phần</strong>
          </span>
          <span style={{ color: barColor }}>{percent}%</span>
        </div>

        {/* Progress Bar Track */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#0f172a',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #334155'
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: barColor,
              borderRadius: '4px',
              transition: 'width 0.3s ease-in-out, background-color 0.3s ease'
            }}
          />
        </div>
      </div>

      {isComplete && (
        <span
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          ✓ Đủ điều kiện đặt hàng
        </span>
      )}
    </div>
  )
}
