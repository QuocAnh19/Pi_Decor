import { Link } from "react-router-dom";
import { Container } from "../ui/Layout";
import { LeadForm } from "../sections/LeadForm";
import { siteConfig } from "../../lib/siteConfig";
import styles from "./Footer.module.scss";

export function Footer() {
  const { business } = siteConfig;
  const addressParts = [
    business.address.streetAddress,
    business.address.addressLocality,
    business.address.addressRegion,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  const hasContactInfo = Boolean(fullAddress || business.email || business.telephone);

  return (
    <footer id="contact" className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <p className={styles.brand}>{siteConfig.name}</p>
            <p className={styles.tagline}>
              Thiết kế tiệc cưới tương tác — nơi ý tưởng của bạn thành hình trước ngày trọng đại.
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
              {hasContactInfo && (
                <div>
                  <p className={styles.linksHeading}>Liên hệ</p>
                  <ul className={styles.linksList}>
                    {fullAddress && <li>Địa chỉ: {fullAddress}</li>}
                    {business.email && <li>Email: {business.email}</li>}
                    {business.telephone && <li>Hotline: {business.telephone}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className={styles.formHeading}>Để lại thông tin, đội tư vấn sẽ liên hệ lại</p>
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
