import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Star, MapPin, Calendar, DollarSign, LayoutGrid, List, UploadCloud } from 'lucide-react'
import { categoryPortfolio } from '../../lib/content'
import styles from './AdminProjectsPage.module.scss'

export interface ProjectItem {
  id: string
  categoryId: string // 'piwedding' | 'pikids' | 'pievent'
  tag: string        // 'Gia Tiên' | 'Nhà Hàng' | 'Ngoài Trời' | 'Đầy Tháng' | 'Thôi Nôi' | 'Khai Trương'...
  title: string
  location: string
  src: string
  description?: string
  date?: string
  budget?: string
  status?: 'active' | 'featured' | 'draft'
  createdAt?: number
}

const SAMPLE_STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600'
]

const CATEGORY_TAG_OPTIONS: Record<string, string[]> = {
  piwedding: ['Gia Tiên', 'Nhà Hàng', 'Ngoài Trời', 'Nhà Rạp', 'Phòng Tân Hôn', 'Mâm Quả'],
  pikids: ['Đầy Tháng', 'Thôi Nôi', 'Sinh Nhật', 'Party Nổi Bật', 'Baby Shower'],
  pievent: ['Khai Trương', 'Lễ - Tết', 'Sum Up', 'Team Building', 'Hội Nghị']
}

const STORAGE_KEY = 'pidecor_admin_projects'

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse saved projects:', e)
    }
    // Transform categoryPortfolio seed data into initial ProjectItem list
    return categoryPortfolio.map((item: any, idx: number) => ({
      id: item.id,
      categoryId: item.categoryId,
      tag: item.tag,
      title: item.title,
      location: item.location,
      src: item.src,
      description: item.description || `Concept trang trí ${item.tag} ấn tượng tại ${item.location}.`,
      date: item.date || '2026-03-19',
      budget: item.budget || 'Thỏa thuận',
      status: (item.id === 'pw-1' || item.id === 'pk-3' || item.id === 'pe-1' ? 'featured' : 'active') as 'active' | 'featured' | 'draft',
      createdAt: Date.now() - idx * 86400000
    }))
  })

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)

  // Form states
  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    title: '',
    categoryId: 'piwedding',
    tag: 'Gia Tiên',
    location: 'Tư gia, Đà Nẵng',
    src: SAMPLE_STOCK_IMAGES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    budget: '15.000.000 - 25.000.000 VNĐ',
    status: 'active'
  })

  const handleCategoryChange = (newCatId: string) => {
    const availableTags = CATEGORY_TAG_OPTIONS[newCatId] || []
    const defaultTag = availableTags[0] || 'Gia Tiên'
    setFormData((prev) => ({
      ...prev,
      categoryId: newCatId,
      tag: availableTags.includes(prev.tag) ? prev.tag : defaultTag
    }))
  }

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, SVG)!')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, src: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Persist to localStorage whenever projects state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch (e) {
      console.warn('Failed to save projects to localStorage:', e)
    }
  }, [projects])

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProject(null)
    setFormData({
      title: '',
      categoryId: 'piwedding',
      tag: 'Gia Tiên',
      location: 'Tư gia, Đà Nẵng',
      src: SAMPLE_STOCK_IMAGES[Math.floor(Math.random() * SAMPLE_STOCK_IMAGES.length)],
      description: '',
      date: new Date().toISOString().split('T')[0],
      budget: '15.000.000 - 25.000.000 VNĐ',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (proj: ProjectItem) => {
    setEditingProject(proj)
    setFormData({
      title: proj.title,
      categoryId: proj.categoryId,
      tag: proj.tag,
      location: proj.location,
      src: proj.src,
      description: proj.description || '',
      date: proj.date || '',
      budget: proj.budget || '',
      status: proj.status || 'active'
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleToggleFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'featured' ? 'active' : 'featured'
          return { ...p, status: nextStatus }
        }
        return p
      })
    )
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên dự án!')
      return
    }

    if (editingProject) {
      // Update existing project
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...formData } : p))
      )
    } else {
      // Create new project
      const newProj: ProjectItem = {
        id: `proj-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: Date.now(),
        ...formData
      }
      setProjects((prev) => [newProj, ...prev])
    }

    setIsModalOpen(false)
  }

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'piwedding': return 'PiWedding'
      case 'pikids': return 'PiKids'
      case 'pievent': return 'PiEvent'
      default: return catId
    }
  }

  return (
    <div className={styles.shell}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản lý Dự án</h1>
        </div>

        <button onClick={handleOpenAddModal} className={styles.addButton}>
          <Plus size={16} /> Thêm Dự Án Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Tìm kiếm tên dự án, địa điểm, hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.selectInput}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="featured">Nổi bật</option>
            <option value="active">Đang hiển thị</option>
            <option value="draft">Bản nháp</option>
          </select>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'grid' ? '#38bdf8' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'table' ? '#38bdf8' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsRow}>
          {[
            { id: 'all', label: `Tất cả (${projects.length})` },
            { id: 'piwedding', label: `PiWedding (${projects.filter((p) => p.categoryId === 'piwedding').length})` },
            { id: 'pikids', label: `PiKids (${projects.filter((p) => p.categoryId === 'pikids').length})` },
            { id: 'pievent', label: `PiEvent (${projects.filter((p) => p.categoryId === 'pievent').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`${styles.tabButton} ${selectedCategory === tab.id ? styles.tabActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className={styles.grid}>
          {filteredProjects.map((proj) => (
            <div key={proj.id} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img
                  src={proj.src}
                  alt={proj.title}
                  className={styles.cardImage}
                  onError={(e) => {
                    // Fallback to stock image if image URL fails to load
                    ;(e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0]
                  }}
                />

                <div className={styles.badgeRow}>
                  <span className={styles.categoryBadge}>
                    #{getCategoryLabel(proj.categoryId)} • {proj.tag}
                  </span>

                  <span
                    className={`${styles.statusBadge} ${
                      proj.status === 'featured'
                        ? styles.statusFeatured
                        : proj.status === 'draft'
                        ? styles.statusDraft
                        : styles.statusActive
                    }`}
                  >
                    {proj.status === 'featured' ? 'Nổi bật' : proj.status === 'draft' ? 'Bản nháp' : 'Hiển thị'}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{proj.title}</h3>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <MapPin size={13} color="#38bdf8" /> {proj.location}
                  </span>
                  {proj.date && (
                    <span className={styles.metaItem}>
                      <Calendar size={13} color="#94a3b8" /> {proj.date}
                    </span>
                  )}
                </div>

                <p className={styles.cardDesc}>{proj.description}</p>

                <div className={styles.cardFooter}>
                  <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <DollarSign size={13} /> {proj.budget || 'Liên hệ báo giá'}
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleToggleFeatured(proj.id)}
                      className={styles.iconBtn}
                      title={proj.status === 'featured' ? 'Bỏ danh hiệu nổi bật' : 'Đặt làm dự án nổi bật'}
                      style={{ color: proj.status === 'featured' ? '#f59e0b' : '#94a3b8' }}
                    >
                      <Star size={14} fill={proj.status === 'featured' ? '#f59e0b' : 'none'} />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(proj)}
                      className={styles.iconBtn}
                      title="Chỉnh sửa dự án"
                    >
                      <Edit3 size={14} /> Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(proj.id)}
                      className={`${styles.iconBtn} ${styles.dangerBtn}`}
                      title="Xóa dự án"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#f8fafc' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Hình ảnh &amp; Dự án</th>
                <th style={{ padding: '12px 16px' }}>Phân mục</th>
                <th style={{ padding: '12px 16px' }}>Địa điểm</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={proj.src}
                      alt={proj.title}
                      style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', color: '#ffffff' }}>{proj.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{proj.description?.slice(0, 50)}...</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={styles.categoryBadge}>#{getCategoryLabel(proj.categoryId)} • {proj.tag}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{proj.location}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      className={`${styles.statusBadge} ${
                        proj.status === 'featured'
                          ? styles.statusFeatured
                          : proj.status === 'draft'
                          ? styles.statusDraft
                          : styles.statusActive
                      }`}
                    >
                      {proj.status === 'featured' ? '⭐ Nổi bật' : proj.status === 'draft' ? 'Bản nháp' : 'Hiển thị'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleOpenEditModal(proj)} className={styles.iconBtn}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(proj.id)} className={`${styles.iconBtn} ${styles.dangerBtn}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingProject ? '✏️ Chỉnh Sửa Dự Án' : '➕ Thêm Dự Án Mới'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  {/* Title */}
                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label>Tên Dự Án / Concept *</label>
                    <input
                      type="text"
                      placeholder="VD: Lễ gia tiên tông sen hồng cao cấp"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className={styles.formGroup}>
                    <label>Phân Mục Chính</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="piwedding">💒 PiWedding (Cưới hỏi)</option>
                      <option value="pikids">🎈 PiKids (Thôi nôi / Sinh nhật)</option>
                      <option value="pievent">🏢 PiEvent (Sự kiện doanh nghiệp)</option>
                    </select>
                  </div>

                  {/* Tag / Subcategory */}
                  <div className={styles.formGroup}>
                    <label>Thẻ Phân Loại (Tag / Concept)</label>
                    <select
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    >
                      {(CATEGORY_TAG_OPTIONS[formData.categoryId] || []).map((tagOpt) => (
                        <option key={tagOpt} value={tagOpt}>
                          {tagOpt}
                        </option>
                      ))}
                      {!CATEGORY_TAG_OPTIONS[formData.categoryId]?.includes(formData.tag) && (
                        <option value={formData.tag}>{formData.tag} (Khác)</option>
                      )}
                    </select>
                  </div>

                  {/* Location */}
                  <div className={styles.formGroup}>
                    <label>Địa Điểm Thực Hiện</label>
                    <input
                      type="text"
                      placeholder="VD: Furama Resort, Đà Nẵng"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  {/* Date (Calendar Picker) */}
                  <div className={styles.formGroup}>
                    <label>Thời Gian / Ngày Thực Hiện (Lịch chọn)</label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  {/* Budget */}
                  <div className={styles.formGroup}>
                    <label>Ngân Sách Ước Tính</label>
                    <input
                      type="text"
                      placeholder="VD: 15.000.000 - 25.000.000 VNĐ"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>

                  {/* Status */}
                  <div className={styles.formGroup}>
                    <label>Trạng Thái Hiển Thị</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="active">✓ Đang hiển thị (Active)</option>
                      <option value="featured">⭐ Nổi bật (Featured)</option>
                      <option value="draft">📁 Bản nháp (Draft)</option>
                    </select>
                  </div>

                  {/* Image Upload & Preview */}
                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label>Hình Ảnh Dự Án *</label>

                    {/* File Upload Dropzone */}
                    <label className={styles.uploadDropzone}>
                      <UploadCloud size={36} className={styles.uploadIcon} />
                      <span className={styles.uploadText}>📁 Tải Ảnh Từ Máy Tính Lên</span>
                      <span className={styles.uploadHint}>Nhấp để chọn tệp hình ảnh từ máy tính (PNG, JPG, WEBP, SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* Or URL input */}
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Hoặc dán đường dẫn URL / Path hình ảnh:
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/... hoặc /images/portfolio/..."
                        value={formData.src}
                        onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                      />
                    </div>

                    {/* Live Image Preview */}
                    {formData.src && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>
                          ✓ Xem trước hình ảnh dự án:
                        </div>
                        <img
                          src={formData.src}
                          alt="Preview"
                          className={styles.imagePreview}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0]
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label>Mô Tả Chi Tiết Project &amp; Concept</label>
                    <textarea
                      placeholder="Mô tả phong cách thiết kế, tone màu chủ đạo, các loại hoa tươi và vải voan đã sử dụng..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingProject ? 'Cập Nhật Dự Án' : 'Thêm Dự Án Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
