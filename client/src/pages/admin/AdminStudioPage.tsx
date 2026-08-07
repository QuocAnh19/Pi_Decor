import { useNavigate } from 'react-router-dom'
import { AdminEditor } from '../../features/studio'

/**
 * AdminStudioPage — route /admin/studio
 * Admin tạo/chỉnh sửa template, đặt anchor slots, định nghĩa rules.
 * Render ở chế độ FULL SCREEN (không bị ép trong AdminLayout sidebar) để dễ thao tác.
 */
export function AdminStudioPage() {
  const navigate = useNavigate()
  return <AdminEditor onBackToHome={() => navigate('/admin')} />
}
