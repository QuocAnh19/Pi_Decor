import React, { useState, useEffect } from 'react'
import { SlotRule, SlotDefinition } from '../../types'

export interface RuleEditorProps {
  isOpen: boolean
  rule?: SlotRule
  slots: SlotDefinition[]
  onSave: (rule: Omit<SlotRule, 'id'>) => void
  onClose: () => void
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  isOpen,
  rule,
  slots,
  onSave,
  onClose
}) => {
  const [ruleName, setRuleName] = useState('')
  const [conditionSlot, setConditionSlot] = useState('')
  const [conditionTag, setConditionTag] = useState('do-do')
  const [targetSlot, setTargetSlot] = useState('')
  const [action, setAction] = useState<'force_asset' | 'restrict_assets' | 'hide_slot'>('force_asset')
  const [actionTag, setActionTag] = useState('rect-block')
  const [priority, setPriority] = useState(10)

  useEffect(() => {
    if (isOpen) {
      if (rule) {
        setRuleName(rule.ruleName)
        setConditionSlot(rule.conditionSlot)
        setConditionTag((rule.conditionValue?.asset_tag as string) || 'do-do')
        setTargetSlot(rule.targetSlot)
        setAction(rule.action)
        setActionTag((rule.actionValue?.forced_asset_tag as string) || 'rect-block')
        setPriority(rule.priority)
      } else {
        setRuleName('')
        setConditionSlot(slots[0]?.slotKey || '')
        setConditionTag('do-do')
        setTargetSlot(slots[1]?.slotKey || slots[0]?.slotKey || '')
        setAction('force_asset')
        setActionTag('rect-block')
        setPriority(10)
      }
    }
  }, [isOpen, rule, slots])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ruleName.trim()) {
      alert('Vui lòng nhập tên Rule!')
      return
    }

    onSave({
      templateId: slots[0]?.templateId || 'tpl-classic-01',
      ruleName: ruleName.trim(),
      conditionSlot,
      conditionValue: { asset_tag: conditionTag.trim() },
      targetSlot,
      action,
      actionValue: { forced_asset_tag: actionTag.trim() },
      priority
    })

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
            ⚡ {rule ? 'Chỉnh Sửa Rule Engine' : 'Thêm Rule Engine Mới'}
          </h3>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rule Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
              Tên Quy Tắc (Rule Name)
            </label>
            <input
              type="text"
              placeholder="VD: Rèm đỏ đô ép dùng rèm chi tiết khối"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Condition Box */}
          <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px' }}>
              1. Điều kiện (If Condition)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Khi Slot:</label>
                <select
                  value={conditionSlot}
                  onChange={(e) => setConditionSlot(e.target.value)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
                >
                  {slots.map((s) => (
                    <option key={s.id} value={s.slotKey}>
                      {s.slotKey} ({s.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Có Tag Asset chứa:</label>
                <input
                  type="text"
                  placeholder="do-do"
                  value={conditionTag}
                  onChange={(e) => setConditionTag(e.target.value)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8', marginBottom: '8px' }}>
              2. Hành động tác động (Then Action)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Slot Mục Tiêu:</label>
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(e.target.value)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
                >
                  {slots.map((s) => (
                    <option key={s.id} value={s.slotKey}>
                      {s.slotKey} ({s.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Hành Động:</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
                >
                  <option value="force_asset">force_asset (Ép chọn & khóa)</option>
                  <option value="restrict_assets">restrict_assets (Giới hạn danh sách)</option>
                  <option value="hide_slot">hide_slot (Ẩn slot)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Giá Trị Ép/Tag Tác Động:</label>
                <input
                  type="text"
                  placeholder="rect-block"
                  value={actionTag}
                  onChange={(e) => setActionTag(e.target.value)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
              Độ Ưu Tiên Priority (0-100, cao hơn xử lý trước)
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '13px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" style={{ padding: '8px 18px', backgroundColor: '#e11d48', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
              💾 Lưu Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
