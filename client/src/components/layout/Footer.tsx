import { Link } from "react-router-dom";
import { Container } from "../ui/Layout";
import { LeadForm } from "../sections/LeadForm";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <p className={styles.brand}>Pi Decor</p>
            <p className={styles.tagline}>
              Thiết kế tiệc cưới tương tác — nơi ý tưởng của bạn thành hình
              trước ngày trọng đại.
            </p>

            <div className={styles.linksGrid}>
              <div>
                <p className={styles.linksHeading}>Khám phá</p>
                <ul className={styles.linksList}>
                  <li>
                    <a href="/#services">Dịch vụ</a>
                  </li>
                  <li>
                    <Link to="/studio">Studio thiết kế</Link>
                  </li>
                  <li>
                    <a href="/#lookbook">Dự án</a>
                  </li>
                </ul>
              </div>
              <div>
                <p className={styles.linksHeading}>Liên hệ</p>
                <ul className={styles.linksList}>
                  <li>
                    Địa chỉ: 372 Trần Đại Nghĩa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng,
                    Việt Nam
                  </li>
                  <li>Email: hello@pidecor.vn</li>
                  <li>Hotline: +84 000 000 000</li>
                  {/* <li>Instagram · Facebook · TikTok</li> */}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className={styles.formHeading}>
              Để lại thông tin, đội tư vấn sẽ liên hệ lại
            </p>
            <div className={styles.formWrap}>
              <LeadForm />
            </div>
          </div>
        </div>

        <div className={styles.bottom}>© Pi Decor Team</div>
      </Container>
    </footer>
  );
}
