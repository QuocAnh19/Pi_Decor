import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import type { Venue } from "../../lib/types";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MapExplorer } from "../map/MapExplorer";
import styles from "./MapTeaser.module.scss";

/**
 * Điểm chạm B rút gọn, ngay dưới Lookbook trên Trang chủ: cùng dữ liệu venue
 * thật, cùng hành vi click-pin-xem-dự-án, chỉ nhỏ gọn hơn — rồi CTA sang
 * /ban-do (Mục 3b) cho khách muốn dạo xem đầy đủ theo khu vực.
 */
export function MapTeaser() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");

  useEffect(() => {
    api
      .getVenues()
      .then((data) => {
        setVenues(data);
        setStatus(data.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Nothing to show yet (no venues seeded, or the API isn't reachable) —
  // fail quiet instead of showing a broken/empty section on the homepage.
  if (status === "error" || status === "empty") return null;

  return (
    <Section tone="default">
      <Container>
        <SectionHeader
          eyebrow="Bản đồ dự án"
          title="Chúng tôi đã từng dựng tiệc ở đâu?"
          description="Tiệc của bạn tổ chức đúng địa điểm này? Bấm vào pin để xem lại decor thật."
          align="left"
        />

        {status === "loading" ? (
          <p className={styles.loading}>Đang tải bản đồ…</p>
        ) : (
          <MapExplorer venues={venues} compact className={styles.map} />
        )}

        <Link to="/ban-do" className={styles.cta}>
          Xem toàn bộ trên bản đồ <ArrowRight size={16} />
        </Link>
      </Container>
    </Section>
  );
}
