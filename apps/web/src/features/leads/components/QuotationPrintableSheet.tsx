import React from "react";
import type { Lead, Quotation, QuotationItem } from "../../../lib/types";
import { formatCurrency } from "../../../lib/formatters";
import styles from "./QuotationModal.module.scss";

interface QuotationPrintableSheetProps {
  pdfRef: React.RefObject<HTMLDivElement>;
  lead: Lead;
  currentQuotation: Quotation | null;
  items: Omit<QuotationItem, "subtotal">[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}

/**
 * Bảng báo giá ẩn dùng để chụp ảnh và xuất file PDF qua html-to-image + jsPDF.
 */
export function QuotationPrintableSheet({
  pdfRef,
  lead,
  currentQuotation,
  items,
  subtotal,
  discount,
  total,
  notes,
}: QuotationPrintableSheetProps) {
  return (
    <div className={styles.pdfContainer} ref={pdfRef}>
      <div className={styles.pdfHeader}>
        <div className={styles.pdfBrand}>
          <h1>PI DECOR</h1>
          <p>Trang trí Tiệc cưới &amp; Sự kiện Nghệ thuật</p>
          <p>Hotline: 090 123 4567 — Website: pidecor.vn</p>
        </div>
        <div className={styles.pdfMeta}>
          <h2>BÁO GIÁ DỊCH VỤ</h2>
          <p>Mã số: {currentQuotation?.quotation_number ?? "BG-2026-XXXX"}</p>
          <p>Ngày lập: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
      </div>

      <div className={styles.pdfCustomer}>
        <p>
          <strong>Khách hàng:</strong> {lead.name}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {lead.phone}
        </p>
        {lead.email && (
          <p>
            <strong>Email:</strong> {lead.email}
          </p>
        )}
        {lead.wedding_date && (
          <p>
            <strong>Ngày tổ chức:</strong> {new Date(lead.wedding_date).toLocaleDateString("vi-VN")}
          </p>
        )}
      </div>

      <table className={styles.pdfTable}>
        <thead>
          <tr>
            <th style={{ width: "45%" }}>Hạng mục trang trí</th>
            <th style={{ width: "15%", textAlign: "center" }}>Số lượng</th>
            <th style={{ width: "20%", textAlign: "right" }}>Đơn giá</th>
            <th style={{ width: "20%", textAlign: "right" }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>{it.description || "—"}</td>
              <td style={{ textAlign: "center" }}>{it.quantity}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(Number(it.unit_price))}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(it.quantity * it.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pdfSummary}>
        <div>
          <span>Tạm tính:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div>
            <span>Chiết khấu:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className={styles.pdfTotal}>
          <span>TỔNG CỘNG:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {notes && (
        <div style={{ marginBottom: "20px", fontSize: "13px", color: "#6e6259" }}>
          <strong>Ghi chú:</strong> {notes}
        </div>
      )}

      <div className={styles.pdfFooter}>
        <p>Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Pi Decor!</p>
      </div>
    </div>
  );
}
