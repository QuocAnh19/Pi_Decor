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

  let barColor = '#b3733b' // warm honey
  if (isComplete) {
    barColor = '#47663b' // sage green
  } else if (percent < 30) {
    barColor = '#9c9186' // taupe
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
          <span style={{ color: '#271620' }}>
            🎯 Tiến độ thiết kế: <strong style={{ color: barColor }}>{filledSlotsCount} / {totalSlots} thành phần</strong>
          </span>
          <span style={{ color: barColor }}>{percent}%</span>
        </div>

        {/* Progress Bar Track */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f4eee3',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #e7ded0'
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
            backgroundColor: '#eef4ea',
            color: '#47663b',
            border: '1px solid #c5dfbb',
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
