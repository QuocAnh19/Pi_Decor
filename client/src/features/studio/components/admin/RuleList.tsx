import React, { useState } from 'react'
import { SlotRule, SlotDefinition } from '../../types'
import { RuleEditor } from './RuleEditor'

export interface RuleListProps {
  rules: SlotRule[]
  slots: SlotDefinition[]
  onAddRule: (rule: Omit<SlotRule, 'id'>) => void
  onUpdateRule: (ruleId: string, rule: Omit<SlotRule, 'id'>) => void
  onDeleteRule: (ruleId: string) => void
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  slots,
  onAddRule,
  onUpdateRule,
  onDeleteRule
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<SlotRule | undefined>(undefined)

  const handleOpenAdd = () => {
    setEditingRule(undefined)
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (rule: SlotRule) => {
    setEditingRule(rule)
    setIsEditorOpen(true)
  }

  const handleSave = (ruleData: Omit<SlotRule, 'id'>) => {
    if (editingRule) {
      onUpdateRule(editingRule.id, ruleData)
    } else {
      onAddRule(ruleData)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
          ⚡ Rule Engine Ràng Buộc ({rules.length})
        </h3>
        <button
          onClick={handleOpenAdd}
          style={{
            padding: '6px 12px',
            backgroundColor: '#e11d48',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ Thêm Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="admin-scroll" style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '24px 0' }}>
            Chưa có quy tắc nào. Nhấn "+ Thêm Rule" để thiết lập ràng buộc phối màu/vật liệu.
          </div>
        ) : (
          rules.map((rule) => {
            const condTag = (rule.conditionValue?.asset_tag as string) || 'tag'
            const actionTag = (rule.actionValue?.forced_asset_tag as string) || 'tag'

            return (
              <div
                key={rule.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#fbbf24' }}>
                  <span>{rule.ruleName}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Priority: {rule.priority}</span>
                </div>

                <div style={{ color: '#cbd5e1', lineHeight: '1.4' }}>
                  Khi <strong style={{ color: '#f43f5e' }}>[{rule.conditionSlot}]</strong> có tag <code style={{ color: '#38bdf8' }}>#{condTag}</code>
                  <br />
                  ➔ <strong style={{ color: '#34d399' }}>[{rule.targetSlot}]</strong> bị <code style={{ color: '#f59e0b' }}>{rule.action}</code> sang <code style={{ color: '#38bdf8' }}>#{actionTag}</code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <RuleEditor
        isOpen={isEditorOpen}
        rule={editingRule}
        slots={slots}
        onSave={handleSave}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  )
}
