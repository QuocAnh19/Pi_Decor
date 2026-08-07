import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "../ui/Layout";
import styles from "./Navbar.module.scss";

const links = [
  { href: "/#services", label: "Dịch vụ" },
  { href: "/#lookbook", label: "Dự án" },
  { href: "/ban-do", label: "Bản đồ" },
  { href: "/#contact", label: "Liên hệ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isStudio = location.pathname === "/studio";
  const isSubPage = isStudio || location.pathname === "/ban-do";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Studio and the map page both sit over real content immediately, not a
  // full-bleed hero image, so they skip the transparent-to-solid transition.
  const solid = scrolled || isSubPage;

  return (
    <header className={`${styles.header} ${solid ? styles.headerSolid : ""}`}>
      <Container className={styles.bar}>
        <Link to="/" className={styles.logo}>
          Pi Decor
        </Link>

        <nav className={styles.nav}>
          {isSubPage ? (
            <Link to="/" className={styles.navLink}>
              ← Về trang chủ
            </Link>
          ) : (
            links.map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.href} href={l.href} className={styles.navLink}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} to={l.href} className={styles.navLink}>
                  {l.label}
                </Link>
              )
            )
          )}
        </nav>

        {!isSubPage && (
          <Link to="/studio" className={styles.cta}>
            Mở Studio
          </Link>
        )}
      </Container>
    </header>
  );
}
