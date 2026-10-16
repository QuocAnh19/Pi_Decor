import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Polaroid } from "../ui/Polaroid";
import { Feather } from "../ui/Feather";
import { heroCollageMedia, heroMedia } from "../../lib/content";
import styles from "./Hero.module.scss";

// Full-bleed photo hero with a light parallax drift on the background image
// as the page scrolls. Text stays minimal and sits on a soft bottom scrim
// so it never competes with the photo underneath it. A small polaroid
// collage + feather accent (Swan Agency reference) sit in the top-right as
// a supporting flourish.
export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      setOffset(window.scrollY * 0.25);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div
        className={styles.parallaxLayer}
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        <MediaSlot
          src={heroMedia.src}
          srcSet={heroMedia.srcSet}
          sizes="100vw"
          width={heroMedia.width}
          height={heroMedia.height}
          alt={heroMedia.alt}
          label="Ảnh/video hero Pi Decor"
          hint="public/images/hero.webp · ngang · ánh sáng ấm"
          className={styles.media}
          priority
        />
      </div>

      <div className={styles.scrim} />

      <div className={styles.collage}>
        <Polaroid
          src={heroCollageMedia[0].src}
          srcSet={heroCollageMedia[0].srcSet}
          sizes="128px"
          alt={heroCollageMedia[0].alt}
          label="Ảnh polaroid 1"
          hint="public/images/hero-collage-1.webp · dọc 4:5"
          caption="Caption"
          rotate={-6}
          width={128}
          height={160}
        />
        <Polaroid
          src={heroCollageMedia[1].src}
          srcSet={heroCollageMedia[1].srcSet}
          sizes="128px"
          alt={heroCollageMedia[1].alt}
          label="Ảnh polaroid 2"
          hint="public/images/hero-collage-2.webp · dọc 4:5"
          caption="Caption"
          rotate={4}
          width={128}
          height={160}
          className={styles.collagePhotoTwo}
        />
      </div>
      <Feather className={styles.feather} />

      <Container className={styles.content}>
        <h1 className={styles.title}>
          Kiến tạo không gian,
          <br />
          <span className={styles.titleAccent}>lưu giữ</span> khoảnh khắc.
        </h1>
        <p className={styles.subtitle}>
          Chọn vải voan, phối màu, thêm cổng hoa — xem không gian tiệc cưới của
          bạn thành hình ngay trên màn hình, trước cả ngày trọng đại. Cùng
          PiKids và PiEvent lo trọn mọi dấu mốc khác trong đời.
        </p>
        <p className={styles.script}>designed by you, styled with love</p>
        <div className={styles.actions}>
          <Link to="/studio" className={styles.ctaPrimary}>
            Vào Studio thiết kế
          </Link>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              const elem = document.getElementById("services");
              if (elem) {
                const navOffset = 110;
                const elemPos = elem.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                  top: Math.max(0, elemPos - navOffset),
                  behavior: "smooth",
                });
              }
            }}
            className={styles.ctaGhost}
          >
            Xem dịch vụ ↓
          </a>
        </div>
      </Container>
    </section>
  );
}
