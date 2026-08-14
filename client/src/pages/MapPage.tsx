import { MapPinIcon } from "@heroicons/react/24/outline";
import { Container, Section } from "../components/ui/Layout";
import { useMap, MapExplorer } from "../features/map";
import styles from "./MapPage.module.scss";

export function MapPage() {
  const { venues, status } = useMap();

  return (
    <Section padding="compact">
      <Container>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <MapPinIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Bản đồ dự án
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
