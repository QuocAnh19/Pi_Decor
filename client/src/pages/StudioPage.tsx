import { CustomerEditor } from '../features/studio'
import styles from './StudioPage.module.scss'

/**
 * StudioPage — route /studio
 * Cho phép khách hàng tùy chỉnh phông cưới.
 * CustomerEditor load template từ localStorage (published bởi Admin).
 * Nếu chưa có template nào được publish, dùng seed data mặc định.
 */
export function StudioPage() {
  return (
    <div className={styles.page}>
      <CustomerEditor />
    </div>
  )
}
