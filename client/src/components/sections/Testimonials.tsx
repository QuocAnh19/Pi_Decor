import { testimonials } from "../../lib/content";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { Reveal } from "../ui/Reveal";
import styles from "./Testimonials.module.scss";

const avatarClasses = [styles.avatarRose, styles.avatarSage, styles.avatarSand];

export function Testimonials() {
  return (
    <Section tone="blush">
      <Container>
        <SectionHeader eyebrow="Đánh giá" title="Khách hàng của Pi Decor nói gì" />
        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 80}>
              <figure className={styles.card}>
                <span className={styles.quoteMark}>“</span>
                <blockquote className={styles.quote}>{t.quote}</blockquote>
                <figcaption className={styles.figcaption}>
                  <span className={`${styles.avatar} ${avatarClasses[i % avatarClasses.length]}`}>
                    {t.author.charAt(0)}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>{t.author}</span>
                    <span className={styles.role}>{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
