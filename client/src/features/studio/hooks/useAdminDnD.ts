import { useState, useCallback } from 'react'
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { SlotDefinition } from '../types'
import { svgToNormalized, normalizedToSVG } from '../utils/coordinates'

export interface UseAdminDnDReturn {
  activeSlotId: string | null
  selectedSlotId: string | null
  setSelectedSlotId: (id: string | null) => void
  isDragging: boolean
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent, canvasWidth: number, canvasHeight: number) => void
}

export function useAdminDnD(
  slots: SlotDefinition[],
  onSlotMove: (slotId: string, normX: number, normY: number) => void
): UseAdminDnDReturn {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const slotId = event.active.id as string
    setActiveSlotId(slotId)
    setSelectedSlotId(slotId)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent, canvasWidth: number, canvasHeight: number) => {
      const { active, delta } = event
      setActiveSlotId(null)

      if (!active || (delta.x === 0 && delta.y === 0)) return

      const slotId = active.id as string
      const slot = slots.find((s) => s.id === slotId)
      if (!slot) return

      // Compute old pixel position
      const oldPx = normalizedToSVG(slot.normX, slot.normY, canvasWidth, canvasHeight)

      // Apply drag delta
      const newPxX = oldPx.x + delta.x
      const newPxY = oldPx.y + delta.y

      // Convert back to normalized coordinates
      const newNorm = svgToNormalized(newPxX, newPxY, canvasWidth, canvasHeight)

      onSlotMove(slotId, newNorm.x, newNorm.y)
    },
    [slots, onSlotMove]
  )

  return {
    activeSlotId,
    selectedSlotId,
    setSelectedSlotId,
    isDragging: activeSlotId !== null,
    handleDragStart,
    handleDragEnd
  }
}
