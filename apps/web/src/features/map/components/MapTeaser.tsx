import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Container, Section, SectionHeader } from "../../../components/ui/Layout";
import { MapExplorer } from "./MapExplorer";
import { useMap } from "../hooks/useMap";
import styles from "./MapTeaser.module.scss";

export function MapTeaser() {
  const { venues, status } = useMap();

  if (status === "error" || status === "empty") return null;

  return (
    <Section id="ban-do" tone="default">
      <Container>
        <SectionHeader
          eyebrow="Bản đồ dự án"
          title="Chúng tôi đã từng dựng tiệc ở đâu?"
          description="Tiệc của bạn tổ chức đúng địa điểm này? Chạm vào pin để xem lại decor thật."
          align="left"
        />

        {status === "loading" ? (
          <p className={styles.loading}>Đang tải bản đồ…</p>
        ) : (
          <MapExplorer venues={venues} compact className={styles.map} />
        )}

        <Link to="/ban-do" className={styles.cta}>
          Xem toàn bộ trên bản đồ{" "}
          <ArrowRightIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} />
        </Link>
      </Container>
    </Section>
  );
}
