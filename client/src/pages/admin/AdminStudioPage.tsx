import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudioTemplateGallery, AdminEditor } from '../../features/studio';
import { api } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import type { StudioTemplateRow } from '../../lib/types'

/**
 * AdminStudioPage — route /admin/studio
 * Displays template gallery inside standard AdminLayout (sidebar + header).
 * Switches to full-screen 2D editor canvas when creating or editing a template.
 */
export function AdminStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { token } = useAuth()

  const [templates, setTemplates] = useState<StudioTemplateRow[]>([])
  const [loading, setLoading] = useState(false)

  const isEditing = searchParams.get('mode') === 'editor'
  const activeTemplateId = searchParams.get('templateId') || undefined

  const fetchTemplates = () => {
    if (!token) return
    setLoading(true)
    api
      .getStudioTemplatesAdmin(token)
      .then((data) => setTemplates(data))
      .catch((err) => console.warn('Failed to load studio templates in admin page:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTemplates()
  }, [token, isEditing])

  const handleSelectTemplate = (id: string) => {
    setSearchParams({ mode: 'editor', templateId: id })
  }

  const handleCreateNew = () => {
    setSearchParams({ mode: 'editor', templateId: 'new' })
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!token) return
    try {
      await api.deleteStudioTemplate(id, token)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!token) return
    try {
      const updated = await api.updateStudioTemplate(id, { is_active: !currentActive }, token)
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error('Failed to toggle active:', err)
    }
  }

  if (isEditing) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: '#0f172a' }}>
        <AdminEditor
          templateId={activeTemplateId}
          onBackToHome={() => {
            setSearchParams({})
            fetchTemplates()
          }}
        />
      </div>
    )
  }

  return (
    <StudioTemplateGallery
      templates={templates}
      loading={loading}
      onSelectTemplate={handleSelectTemplate}
      onCreateNew={handleCreateNew}
      onDeleteTemplate={handleDeleteTemplate}
      onToggleActive={handleToggleActive}
    />
  )
}
