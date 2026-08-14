import * as Icons from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { Service } from "../../../lib/types";
import { resolveIcon } from "../../../lib/icons";
import styles from "./ServiceCard.module.scss";

const tileClasses = [
  styles.tileRose,
  styles.tileSage,
  styles.tileSand,
  styles.tileLavender,
  styles.tileSmoke,
];

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const Icon = resolveIcon(service.icon);
  const tile = tileClasses[index % tileClasses.length];

  const content = (
    <>
      <div className={`${styles.tile} ${tile}`}>
        <Icon className="h-5 w-5" style={{ width: 20, height: 20 }} />
      </div>
      <h3 className={styles.title}>{service.title}</h3>
      <p className={styles.description}>{service.description}</p>
      {service.href && (
        <span className={styles.link}>
          Khám phá
          <Icons.ArrowRightIcon className={`h-4 w-4 ${styles.linkIcon}`} style={{ width: 16, height: 16 }} />
        </span>
      )}
    </>
  );

  if (service.href) {
    return (
      <Link to={service.href} className={styles.card}>
        {content}
      </Link>
    );
  }
  return <div className={styles.card}>{content}</div>;
}
