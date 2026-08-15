import React, { useState, useEffect } from 'react'
import { SlotRule, SlotDefinition } from '../../types'
import { Input, Select } from '../../../../components/ui'

export interface RuleEditorProps {
  isOpen: boolean
  rule?: SlotRule
  slots: SlotDefinition[]
  onSave: (rule: Omit<SlotRule, 'id'>) => void
  onClose: () => void
}

const ACTION_OPTIONS = [
  { value: 'force_asset', label: 'force_asset (Ép chọn & khóa)' },
  { value: 'restrict_assets', label: 'restrict_assets (Giới hạn danh sách)' },
  { value: 'hide_slot', label: 'hide_slot (Ẩn slot)' },
]

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
    if (rule) {
      setRuleName(rule.ruleName)
      setConditionSlot(rule.conditionSlot)
      setConditionTag((rule.conditionValue?.asset_tag as string) || '')
      setTargetSlot(rule.targetSlot)
      setAction(rule.action)
      setActionTag((rule.actionValue?.asset_tag as string) || '')
      setPriority(rule.priority || 10)
    } else {
      setRuleName('')
      setConditionSlot(slots[0]?.slotKey || '')
      setConditionTag('')
      setTargetSlot(slots[1]?.slotKey || slots[0]?.slotKey || '')
      setAction('force_asset')
      setActionTag('')
      setPriority(10)
    }
  }, [rule, slots, isOpen])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ruleName.trim()) {
      alert('Vui lòng nhập tên Quy Tắc!')
      return
    }

    if (!conditionSlot) {
      alert('Vui lòng chọn Slot điều kiện!')
      return
    }

    if (!targetSlot) {
      alert('Vui lòng chọn Slot mục tiêu!')
      return
    }

    onSave({
      templateId: rule?.templateId || '',
      ruleName: ruleName.trim(),
      conditionSlot,
      conditionValue: { asset_tag: conditionTag.trim() },
      targetSlot,
      action,
      actionValue: actionTag.trim() ? { asset_tag: actionTag.trim() } : undefined,
      priority: Number(priority) || 10
    })

    onClose()
  }

  const slotOptions = slots.map((s) => ({
    value: s.slotKey,
    label: `${s.slotKey} (${s.label})`,
  }))

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(39, 22, 32, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e7ded0',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(39, 22, 32, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#271620' }}>
            {rule ? '⚡ Chỉnh Sửa Quy Tắc Ràng Buộc' : '⚡ Thêm Quy Tắc Mới (Rule Builder)'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6e6259', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rule Name */}
          <div>
            <Input
              label="Tên Quy Tắc (Rule Name)"
              type="text"
              placeholder="VD: Khi chọn Rèm Đỏ -> Ép Cổng Khối Đỏ"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          {/* Condition Box */}
          <div style={{ backgroundColor: '#fbf7f1', padding: '14px', borderRadius: '10px', border: '1px solid #e7ded0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#b98a3e', marginBottom: '8px' }}>
              1. Điều kiện (If Condition)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <Select
                label="Khi Slot:"
                value={conditionSlot}
                onChange={(e) => setConditionSlot(e.target.value)}
                options={slotOptions}
              />

              <Input
                label="Có Tag Asset chứa:"
                type="text"
                placeholder="do-do"
                value={conditionTag}
                onChange={(e) => setConditionTag(e.target.value)}
              />
            </div>
          </div>

          {/* Action Box */}
          <div style={{ backgroundColor: '#fbf7f1', padding: '14px', borderRadius: '10px', border: '1px solid #e7ded0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#a15c2e', marginBottom: '8px' }}>
              2. Hành động tác động (Then Action)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <Select
                label="Slot Mục Tiêu:"
                value={targetSlot}
                onChange={(e) => setTargetSlot(e.target.value)}
                options={slotOptions}
              />

              <Select
                label="Hành Động:"
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                options={ACTION_OPTIONS}
              />

              <div style={{ gridColumn: 'span 2' }}>
                <Input
                  label="Giá Trị Ép/Tag Tác Động:"
                  type="text"
                  placeholder="rect-block"
                  value={actionTag}
                  onChange={(e) => setActionTag(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <Input
              label="Độ Ưu Tiên Priority (0-100, cao hơn xử lý trước)"
              type="number"
              min="0"
              max="100"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fbf7f1',
                color: '#6e6259',
                border: '1px solid #e7ded0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                backgroundColor: '#a15c2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(161, 92, 46, 0.25)'
              }}
            >
              💾 Lưu Quy Tắc
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
