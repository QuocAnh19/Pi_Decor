import { lookbookItems } from "../../lib/content";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import styles from "./Lookbook.module.scss";

export function Lookbook() {
  return (
    <Section id="lookbook" tone="dim">
      <Container>
        <SectionHeader
          eyebrow="Lookbook"
          title="Những concept đã thành hình"
          description="Một vài phối cảnh khách đã chọn và triển khai thực tế."
          align="left"
        />
        <div className={styles.grid}>
          {lookbookItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <div className={styles.card}>
                <MediaSlot
                  src={item.src}
                  alt={item.tag}
                  label={`Ảnh: ${item.tag}`}
                  hint={`public${item.src ?? ""} · 4:5`}
                  className={styles.media}
                  mediaClassName={styles.photo}
                />
                <div className={styles.overlay} />
                <p className={styles.tag}>#PiDecor_{item.tag.replace(/\s+/g, "")}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
