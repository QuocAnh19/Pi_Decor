import { SwatchIcon } from "@heroicons/react/24/outline";
import type { DesignSnapshot } from "../../../lib/types";
import styles from "./LeadDetailDrawer.module.scss";

interface LeadDesignSnapshotSectionProps {
  snapshot: DesignSnapshot;
}

/**
 * Hiển thị thông tin phối cảnh thiết kế khách hàng đã tự phối trong Studio 3D.
 */
export function LeadDesignSnapshotSection({
  snapshot,
}: LeadDesignSnapshotSectionProps) {
  const flowerEntries = snapshot.flowers
    ? Object.entries(snapshot.flowers).filter(([, v]) => v)
    : [];

  return (
    <section className={styles.section}>
      <p className={styles.sectionTitle}>
        <SwatchIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
        Phối Cảnh Thiết Kế Khách Hàng Đã Tự Phối
      </p>

      <div className={styles.snapshotContainer}>
        {snapshot.preview_image && (
          <div
            style={{
              marginBottom: "14px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e7ded0",
            }}
          >
            <img
              src={snapshot.preview_image}
              alt="Ảnh phối cảnh thiết kế của khách hàng"
              style={{
                width: "100%",
                maxHeight: "260px",
                objectFit: "contain",
                backgroundColor: "#0f172a",
                display: "block",
              }}
            />
          </div>
        )}

        {snapshot.baseFabric && (
          <div className={styles.snapshotRow}>
            {snapshot.baseFabric.hex && (
              <span
                className={styles.swatch}
                style={{ background: snapshot.baseFabric.hex }}
              />
            )}
            <span className={styles.snapshotLabel}>Vải rèm nền:</span>
            <span className={styles.snapshotValue}>
              {snapshot.baseFabric.style} · {snapshot.baseFabric.color}
            </span>
          </div>
        )}

        {snapshot.valance?.enabled !== false && snapshot.valance?.style && (
          <div className={styles.snapshotRow}>
            <span className={styles.snapshotLabel}>Mảng rèm vắt:</span>
            <span className={styles.snapshotValue}>
              {snapshot.valance.style} · {snapshot.valance.color}
            </span>
          </div>
        )}

        {flowerEntries.map(([key, value]) => (
          <div key={key} className={styles.snapshotRow}>
            <span className={styles.snapshotLabel}>{value!.slot}:</span>
            <span className={styles.snapshotValue}>
              {value!.shape} · {value!.tone}
            </span>
          </div>
        ))}

        {snapshot.details && (
          <div className={styles.snapshotRow}>
            <span className={styles.snapshotLabel}>Chi tiết bảng tên:</span>
            <span className={styles.snapshotValue}>
              {[
                snapshot.details.monogram?.enabled &&
                  `Tên "${snapshot.details.monogram.text || "—"}"`,
                snapshot.details.ribbon && "Dải ruy băng",
                snapshot.details.lights && "Dây đèn LED",
              ]
                .filter(Boolean)
                .join(" · ") || "Không có chi tiết phụ"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
