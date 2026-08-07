import { Link } from "react-router-dom";
import { Container } from "../ui/Layout";
import { Reveal } from "../ui/Reveal";
import styles from "./ClosingCta.module.scss";

// The one dark section on the site. Everything else is light — this band
// exists specifically to give the page a strong closing beat of contrast
// before the footer, the way a lot of premium SaaS sites close a page.
export function ClosingCta() {
  return (
    <section className={styles.section}>
      <Container>
        <Reveal className={styles.inner}>
          <h2 className={styles.title}>Sẵn sàng thấy tiệc cưới của bạn thành hình?</h2>
          <p className={styles.subtitle}>
            Không cần gặp trực tiếp — mở Studio và bắt đầu phối màu ngay trong vài phút.
          </p>
          <Link to="/studio" className={styles.cta}>
            Vào Studio thiết kế
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
