import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "../ui/Layout";
import styles from "./Navbar.module.scss";

const links = [
  { href: "/#services", label: "Dịch vụ" },
  { href: "/#lookbook", label: "Dự án" },
  { href: "/#ban-do", label: "Bản đồ" },
  { href: "/#contact", label: "Liên hệ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isStudio = location.pathname === "/studio";
  const isSubPage = isStudio || location.pathname === "/ban-do";
  const searchParams = new URLSearchParams(location.search);
  const isLeadStudio = isStudio && Boolean(searchParams.get("leadId"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle logo click to scroll to top smoothly
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle nav link click with smooth offset scroll
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        const navOffset = 110;
        const elemPos = elem.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, elemPos - navOffset),
          behavior: "smooth",
        });
      }
    }
  };

  // Studio and the map page both sit over real content immediately, not a
  // full-bleed hero image, so they skip the transparent-to-solid transition.
  const solid = scrolled || isSubPage;

  return (
    <header className={`${styles.header} ${solid ? styles.headerSolid : ""}`}>
      <Container className={styles.bar}>
        <Link
          to={isLeadStudio ? "/admin/leads" : "/"}
          onClick={handleLogoClick}
          className={styles.logo}
        >
          Pi Decor
        </Link>

        <nav className={styles.nav}>
          {isLeadStudio ? (
            <Link
              to="/admin/leads"
              className={styles.navLink}
              style={{ color: "#a15c2e", fontWeight: "700" }}
            >
              ← Về trang quản lý khách hàng
            </Link>
          ) : isSubPage ? (
            <Link to="/" onClick={handleLogoClick} className={styles.navLink}>
              ← Về trang chủ
            </Link>
          ) : (
            links.map((l) =>
              l.href.startsWith("/#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className={styles.navLink}
                >
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} to={l.href} className={styles.navLink}>
                  {l.label}
                </Link>
              ),
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
