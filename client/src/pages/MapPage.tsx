import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Container, Section } from "../components/ui/Layout";
import { MapExplorer } from "../components/map/MapExplorer";
import { api } from "../lib/api";
import type { Venue } from "../lib/types";
import styles from "./MapPage.module.scss";

/**
 * /ban-do — Điểm chạm B (Mục 3b): khách chưa chốt địa điểm dạo xem cảm hứng
 * theo khu vực. Cluster/filter theo khu vực-loại-phong cách là việc của mốc
 * M4 sau này; bản này tập trung đúng phần lõi — pin thật, click ra dự án
 * thật, CTA sang Studio.
 */
export function MapPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    api
      .getVenues()
      .then((data) => {
        setVenues(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <Section padding="compact">
      <Container>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <MapPin size={13} /> Bản đồ dự án
          </p>
          <h1 className={styles.title}>Xem decor Pi Decor tại đúng nơi bạn sẽ tổ chức</h1>
          <p className={styles.subtitle}>
            Mỗi pin là một địa điểm chúng tôi đã từng dựng tiệc. Bấm vào để xem lại những dự án thật —
            hoặc mở Studio để thử phối màu theo phong cách tương tự.
          </p>
        </div>

        {status === "loading" && <p className={styles.status}>Đang tải danh sách địa điểm…</p>}
        {status === "error" && (
          <p className={styles.status}>Không tải được danh sách địa điểm, thử tải lại trang.</p>
        )}
        {status === "ready" && venues.length === 0 && (
          <p className={styles.status}>Chưa có địa điểm nào được công khai.</p>
        )}

        {status === "ready" && venues.length > 0 && (
          <MapExplorer venues={venues} className={styles.explorer} />
        )}
      </Container>
    </Section>
  );
}
