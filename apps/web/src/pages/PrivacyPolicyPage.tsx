import { Link } from "react-router-dom";
import { Container, Section } from "../components/ui/Layout";
import { SEO } from "../components/common/SEO";
import styles from "./PrivacyPolicyPage.module.scss";

/**
 * Trang Chính sách bảo mật và bảo vệ dữ liệu cá nhân.
 * BẢN NHÁP — Cần rà soát pháp lý trước khi công bố chính thức theo Nghị định 13/2023/NĐ-CP.
 */
export function PrivacyPolicyPage() {
  return (
    <Section padding="default">
      <SEO
        title="Chính Sách Bảo Mật Dữ Liệu Cá Nhân"
        description="Chính sách bảo mật và bảo vệ dữ liệu cá nhân của khách hàng khi đăng ký tư vấn và sử dụng dịch vụ tại Pi Decor."
        canonical="/chinh-sach-bao-mat"
      />
      <Container>
        <div className={styles.noticeBanner} role="alert">
          <p className={styles.noticeTitle}>⚠️ BẢN NHÁP — CẦN RÀ SOÁT PHÁP LÝ TRƯỚC KHI CÔNG BỐ</p>
          <p className={styles.noticeText}>
            Tài liệu này được soạn thảo làm khung mẫu kỹ thuật phục vụ việc tuân thủ quy định về sự
            đồng ý của chủ thể dữ liệu. Cần được bộ phận pháp lý rà soát và hoàn thiện trước khi áp
            dụng chính thức.
          </p>
        </div>

        <article className={styles.article}>
          <h1 className={styles.heading1}>Chính Sách Xử Lý & Bảo Vệ Dữ Liệu Cá Nhân</h1>
          <p className={styles.updatedDate}>Phiên bản: v1.0 — Ngày ban hành: 16/10/2026</p>

          <section className={styles.section}>
            <h2 className={styles.heading2}>1. Mục đích thu thập & xử lý dữ liệu</h2>
            <p>
              Pi Decor thu thập và xử lý dữ liệu cá nhân do quý khách hàng tự nguyện cung cấp nhằm
              các mục đích cụ thể sau:
            </p>
            <ul>
              <li>
                Liên hệ tư vấn chi tiết về dịch vụ thiết kế, phối cảnh và trang trí tiệc cưới, sự
                kiện.
              </li>
              <li>Lập bảng dự toán chi phí, gửi báo giá và tiến hành khảo sát địa điểm tổ chức.</li>
              <li>Lưu trữ bản phối cảnh không gian decor do quý khách tùy biến trên Studio.</li>
              <li>
                Ghi nhận và phản hồi các đánh giá, đóng góp ý kiến để nâng cao chất lượng dịch vụ.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading2}>2. Loại dữ liệu cá nhân được thu thập</h2>
            <p>Các trường thông tin thu thập bao gồm:</p>
            <ul>
              <li>
                <strong>Thông tin liên hệ cơ bản:</strong> Họ và tên, Số điện thoại (bắt buộc).
              </li>
              <li>
                <strong>Thông tin sự kiện:</strong> Ngày dự kiến tổ chức tiệc cưới/sự kiện, địa
                điểm, ghi chú yêu cầu phong cách.
              </li>
              <li>
                <strong>Thông tin tùy chọn:</strong> Địa chỉ email cá nhân, hình ảnh chụp thực tế
                kèm lời nhận xét (khi gửi đánh giá).
              </li>
              <li>
                <strong>Dữ liệu thiết kế:</strong> Tùy chọn phối màu, mẫu template và ảnh snapshot
                thiết kế tạo ra trong Studio.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading2}>3. Thời gian lưu trữ dữ liệu</h2>
            <p>
              Dữ liệu của khách hàng được lưu trữ trên hệ thống máy chủ an toàn trong khoảng thời
              gian cần thiết để hoàn thành các mục đích nêu trên, hoặc cho đến khi khách hàng gửi
              yêu cầu rút lại sự đồng ý/xóa dữ liệu.
            </p>
            <p className={styles.todoNote}>
              <em>
                [TODO: Cần chốt thời gian lưu trữ chính thức với người có chuyên môn pháp lý — tham
                chiếu docs/FOLLOWUPS.md]
              </em>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading2}>4. Quyền của chủ thể dữ liệu</h2>
            <p>
              Căn cứ theo Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, quý khách có đầy đủ
              các quyền:
            </p>
            <ul>
              <li>Quyền được biết về hoạt động xử lý dữ liệu cá nhân của mình.</li>
              <li>Quyền đồng ý, không đồng ý hoặc rút lại sự đồng ý đã cung cấp.</li>
              <li>Quyền truy cập để xem, chỉnh sửa hoặc yêu cầu chỉnh sửa dữ liệu cá nhân.</li>
              <li>Quyền yêu cầu xóa bỏ hoặc hạn chế xử lý dữ liệu cá nhân của mình.</li>
              <li>Quyền khiếu nại, tố cáo hoặc khởi kiện theo quy định của pháp luật.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading2}>5. Thông tin đơn vị kiểm soát dữ liệu</h2>
            <p>Đơn vị chịu trách nhiệm kiểm soát và xử lý dữ liệu:</p>
            <div className={styles.contactCard}>
              <p>
                <strong>Doanh nghiệp:</strong> Pi Decor
              </p>
              <p>
                <strong>Địa chỉ trụ sở:</strong>{" "}
                <em>[TODO: Bổ sung địa chỉ chính thức của doanh nghiệp]</em>
              </p>
              <p>
                <strong>Hotline liên hệ:</strong> <em>[TODO: Bổ sung số điện thoại chính thức]</em>
              </p>
              <p>
                <strong>Email tiếp nhận yêu cầu dữ liệu:</strong>{" "}
                <em>[TODO: Bổ sung email bảo vệ dữ liệu]</em>
              </p>
            </div>
          </section>

          <div className={styles.backAction}>
            <Link to="/" className={styles.backButton}>
              ← Trở về Trang chủ
            </Link>
          </div>
        </article>
      </Container>
    </Section>
  );
}
