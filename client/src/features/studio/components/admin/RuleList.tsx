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
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e7ded0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(39, 22, 32, 0.04)'
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e7ded0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#271620', margin: 0 }}>
          ⚡ Ràng Buộc Rule Engine ({rules.length})
        </h3>
        <button
          onClick={handleOpenAdd}
          style={{
            padding: '6px 12px',
            backgroundColor: '#a15c2e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(161, 92, 46, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          + Thêm Rule
        </button>
      </div>

      {/* Rules List */}
      <div
        className="custom-scroll"
        style={{
          padding: '12px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overscrollBehavior: 'contain',
        }}
      >
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9c9186', fontSize: '12px', padding: '24px 0' }}>
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
                  backgroundColor: '#fbf7f1',
                  border: '1px solid #e7ded0',
                  borderRadius: '10px',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#b98a3e' }}>
                  <span>{rule.ruleName}</span>
                  <span style={{ fontSize: '10px', color: '#6e6259' }}>Priority: {rule.priority}</span>
                </div>

                <div style={{ color: '#271620', lineHeight: '1.4' }}>
                  Khi <strong style={{ color: '#b4586b' }}>[{rule.conditionSlot}]</strong> có tag <code style={{ color: '#a15c2e', backgroundColor: '#f1e4d8', padding: '1px 4px', borderRadius: '4px' }}>#{condTag}</code>
                  <br />
                  ➔ <strong style={{ color: '#47663b' }}>[{rule.targetSlot}]</strong> bị <code style={{ color: '#b98a3e' }}>{rule.action}</code> sang <code style={{ color: '#a15c2e', backgroundColor: '#f1e4d8', padding: '1px 4px', borderRadius: '4px' }}>#{actionTag}</code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#a15c2e', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#b4586b', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
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
