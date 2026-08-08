import { useRef, useState } from "react";
import { X, Plus, Trash2, Download, Send, Save } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { Lead, Quotation, QuotationItem } from "../../lib/types";
import styles from "./QuotationModal.module.scss";

interface QuotationModalProps {
  lead: Lead;
  quotation?: Quotation | null;
  onClose: () => void;
  onSaved: () => void;
}

export function QuotationModal({ lead, quotation, onClose, onSaved }: QuotationModalProps) {
  const { token } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<Omit<QuotationItem, "subtotal">[]>(
    quotation?.items?.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })) ?? [{ description: "Gói trang trí tiệc cưới", quantity: 1, unit_price: 15000000 }]
  );
  const [discount, setDiscount] = useState<number>(quotation?.discount ?? 0);
  const [validUntil, setValidUntil] = useState<string>(quotation?.valid_until ?? "");
  const [notes, setNotes] = useState<string>(quotation?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime calculations on client
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  function handleAddItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof Omit<QuotationItem, "subtotal">, value: unknown) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave(status: "draft" | "sent") {
    if (!token) return;
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      setError("Vui lòng điền đầy đủ mô tả cho tất cả các hạng mục.");
      return;
    }

    if (status === "sent" && !confirm("Bạn có chắc chắn muốn gửi báo giá này? Trạng thái sẽ được chuyển thành 'Đã gửi'.")) {
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      lead_id: lead.id,
      items,
      discount: Number(discount || 0),
      valid_until: validUntil || null,
      notes: notes || null,
      status,
    };

    try {
      if (quotation) {
        await api.updateQuotation(quotation.id, payload, token);
      } else {
        await api.createQuotation(payload, token);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu báo giá.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!pdfRef.current) return;
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bao-gia-${quotation?.quotation_number ?? "moi"}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Không thể tạo file PDF, vui lòng thử lại.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{quotation ? `Chỉnh sửa báo giá (${quotation.quotation_number})` : "Tạo báo giá mới"}</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}

          <div className={styles.metaGrid}>
            <div className={styles.field}>
              <label>Khách hàng</label>
              <input type="text" value={`${lead.name} (${lead.phone})`} disabled />
            </div>

            <div className={styles.field}>
              <label>Hạn hiệu lực báo giá</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className={styles.itemsSection}>
            <div className={styles.sectionHeader}>
              <h4>Danh sách hạng mục trang trí</h4>
              <button type="button" className={styles.addItemBtn} onClick={handleAddItem}>
                <Plus size={14} /> Thêm dòng
              </button>
            </div>

            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th className={styles.colDesc}>Hạng mục / Mô tả</th>
                  <th className={styles.colQty}>Số lượng</th>
                  <th className={styles.colPrice}>Đơn giá (đ)</th>
                  <th className={styles.colSubtotal}>Thành tiền</th>
                  <th className={styles.colAction}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemSub = Number(item.quantity || 0) * Number(item.unit_price || 0);
                  return (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          placeholder="Mô tả chi tiết hạng mục..."
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="100000"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                        />
                      </td>
                      <td>{itemSub.toLocaleString("vi-VN")} đ</td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.field}>
              <label>Chiết khấu / Giảm giá (đ)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className={styles.field}>
              <label>Ghi chú báo giá</label>
              <input
                type="text"
                placeholder="VD: Đã bao gồm phí vận chuyển & thi công..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString("vi-VN")} đ</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Chiết khấu:</span>
              <span>-{discount.toLocaleString("vi-VN")} đ</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng cộng:</span>
              <span>{total.toLocaleString("vi-VN")} đ</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.leftActions}>
            <button type="button" className={styles.pdfBtn} onClick={handleExportPDF} disabled={exportingPdf}>
              <Download size={14} /> {exportingPdf ? "Đang tạo PDF..." : "Xuất PDF"}
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.saveDraftBtn}
              onClick={() => handleSave("draft")}
              disabled={loading}
            >
              <Save size={14} /> Lưu nháp
            </button>
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => handleSave("sent")}
              disabled={loading}
            >
              <Send size={14} /> Gửi báo giá
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Off-Screen HTML Template for PDF Export */}
      <div className={styles.pdfContainer} ref={pdfRef}>
        <div className={styles.pdfHeader}>
          <div className={styles.pdfBrand}>
            <h1>PI DECOR STUDIO</h1>
            <p>Trang trí Tiệc cưới & Sự kiện chuyên nghiệp</p>
            <p>Hotline: 090 123 4567 — Website: pidecor.vn</p>
          </div>
          <div className={styles.pdfMeta}>
            <h2>BÁO GIÁ DỊCH VỤ</h2>
            <p>Mã: {quotation?.quotation_number ?? "BG-2026-XXXX"}</p>
            <p>Ngày lập: {new Date().toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        <div className={styles.pdfCustomer}>
          <p><strong>Khách hàng:</strong> {lead.name}</p>
          <p><strong>Điện thoại:</strong> {lead.phone}</p>
          {lead.email && <p><strong>Email:</strong> {lead.email}</p>}
          {lead.wedding_date && <p><strong>Ngày dự kiến:</strong> {lead.wedding_date}</p>}
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
                <td style={{ textAlign: "right" }}>{Number(it.unit_price).toLocaleString("vi-VN")} đ</td>
                <td style={{ textAlign: "right" }}>{(it.quantity * it.unit_price).toLocaleString("vi-VN")} đ</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pdfSummary}>
          <div>
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString("vi-VN")} đ</span>
          </div>
          {discount > 0 && (
            <div>
              <span>Chiết khấu:</span>
              <span>-{discount.toLocaleString("vi-VN")} đ</span>
            </div>
          )}
          <div className={styles.pdfTotal}>
            <span>TỔNG CỘNG:</span>
            <span>{total.toLocaleString("vi-VN")} đ</span>
          </div>
        </div>

        {notes && (
          <div style={{ marginBottom: "20px", fontSize: "13px", color: "#475569" }}>
            <strong>Ghi chú:</strong> {notes}
          </div>
        )}

        <div className={styles.pdfFooter}>
          <p>Cảm ơn Quý khách đã tin tưởng và lựa chọn Pi Decor!</p>
        </div>
      </div>
    </div>
  );
}
