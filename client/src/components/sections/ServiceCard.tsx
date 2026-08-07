import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import type { Service } from "../../lib/types";
import styles from "./ServiceCard.module.scss";

function resolveIcon(name: string) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
  return Icon ?? Icons.Circle;
}

// Each service gets one of the product's real material colors for its icon
// tile. This is what gives the grid variety without introducing new,
// unrelated colors.
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
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className={styles.title}>{service.title}</h3>
      <p className={styles.description}>{service.description}</p>
      {service.href && (
        <span className={styles.link}>
          Khám phá
          <Icons.ArrowRight size={15} className={styles.linkIcon} />
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
