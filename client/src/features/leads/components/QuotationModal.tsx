import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { Lead, Quotation, QuotationItem } from "../../../lib/types";
import { formatCurrency } from "../../../lib/formatters";
import { Modal, Input } from "../../../components/ui";
import styles from "./QuotationModal.module.scss";

interface QuotationModalProps {
  lead: Lead;
  quotation?: Quotation | null;
  onClose: () => void;
  onSaved: () => void;
  onBackToDetail?: () => void;
}

export function QuotationModal({
  lead,
  quotation: initialQuotation,
  onClose,
  onSaved,
  onBackToDetail,
}: QuotationModalProps) {
  const { token } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(initialQuotation ?? null);
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [items, setItems] = useState<Omit<QuotationItem, "subtotal">[]>([
    { description: "Gói trang trí cưới hỏi cao cấp Pi Decor", quantity: 1, unit_price: 15000000 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !lead.id) return;
    if (initialQuotation) {
      setCurrentQuotation(initialQuotation);
      if (initialQuotation.items?.length) {
        setItems(
          initialQuotation.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
          }))
        );
      }
      setDiscount(initialQuotation.discount ?? 0);
      setValidUntil(initialQuotation.valid_until ?? "");
      setNotes(initialQuotation.notes ?? "");
      return;
    }

    setFetchingDraft(true);
    api
      .getQuotations(lead.id)
      .then((existingList) => {
        if (existingList && existingList.length > 0) {
          const latestQuote = existingList[0];
          setCurrentQuotation(latestQuote);
          if (latestQuote.items?.length) {
            setItems(
              latestQuote.items.map((i) => ({
                description: i.description,
                quantity: i.quantity,
                unit_price: i.unit_price,
              }))
            );
          }
          setDiscount(latestQuote.discount ?? 0);
          setValidUntil(latestQuote.valid_until ?? "");
          setNotes(latestQuote.notes ?? "");
        }
      })
      .catch((err) => console.warn("Could not load existing quotation draft:", err))
      .finally(() => setFetchingDraft(false));
  }, [token, lead.id, initialQuotation]);

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

  async function handleSaveDraft() {
    if (!token) return;
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      setError("Vui lòng điền đầy đủ mô tả cho tất cả các hạng mục.");
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccessMsg(null);

    const payload = {
      lead_id: lead.id,
      items,
      discount: Number(discount || 0),
      valid_until: validUntil || null,
      notes: notes || null,
      status: "draft",
    };

    try {
      let saved: Quotation;
      if (currentQuotation?.id) {
        saved = await api.updateQuotation(currentQuotation.id, payload);
      } else {
        saved = await api.createQuotation(payload);
      }
      setCurrentQuotation(saved);
      setSaveSuccessMsg("Đã lưu nháp bảng báo giá thành công!");
      onSaved();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu báo giá nháp.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!pdfRef.current) return;
    setExportingPdf(true);
    try {
      const imgData = await toPng(pdfRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: false,
      });

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bao-gia-${currentQuotation?.quotation_number ?? "pi-decor"}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Không thể tạo file PDF, vui lòng thử lại.");
    } finally {
      setExportingPdf(false);
    }
  }

  const modalTitle = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <DocumentTextIcon className="h-5 w-5" style={{ width: 22, height: 22, color: "#a15c2e" }} />
      <span>{currentQuotation ? `Lập & Lưu Báo Giá (${currentQuotation.quotation_number})` : "Lập Báo Giá Chi Tiết Dịch Vụ Pi Decor"}</span>
    </div>
  );

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={modalTitle}
        maxWidth="960px"
        closeOnBackdropClick={false}
      >
        {fetchingDraft && <p className={styles.fetchingNotice}>Đang kiểm tra dữ liệu báo giá đã lưu...</p>}
        {error && <div className={styles.errorBanner}>{error}</div>}
        {saveSuccessMsg && (
          <div className={styles.successNotice}>
            <CheckCircleIcon className="h-5 w-5" style={{ width: 18, height: 18 }} />
            {saveSuccessMsg}
          </div>
        )}

        <div className={styles.metaGrid}>
          <Input
            label="Khách hàng & Liên hệ"
            type="text"
            value={`${lead.name} — ${lead.phone}${lead.wedding_date ? ` (Tiệc: ${new Date(lead.wedding_date).toLocaleDateString("vi-VN")})` : ""}`}
            disabled
          />

          <Input
            label="Hạn hiệu lực báo giá"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>

        <div className={styles.itemsSection}>
          <div className={styles.sectionHeader}>
            <h4>Danh sách hạng mục thi công trang trí</h4>
            <button type="button" className={styles.addItemBtn} onClick={handleAddItem}>
              <PlusIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Thêm Hạng Mục Mới
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th className={styles.colDesc}>Hạng mục / Mô tả</th>
                  <th className={styles.colQty}>Số lượng</th>
                  <th className={styles.colPrice}>Đơn giá (VNĐ)</th>
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
                        <Input
                          type="text"
                          value={item.description}
                          placeholder="VD: Cổng hoa tươi, Backdrop chụp hình, Bộ bàn ghế gia tiên..."
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          style={{ textAlign: "center" }}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          step="100000"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                        />
                      </td>
                      <td className={styles.colSubtotal}>
                        {formatCurrency(itemSub)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveItem(idx)}
                            title="Xóa dòng"
                          >
                            <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <Input
            label="Chiết khấu / Giảm giá (VNĐ)"
            type="number"
            min="0"
            step="100000"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
          <Input
            label="Ghi chú & Điều khoản đính kèm"
            type="text"
            placeholder="VD: Đã bao gồm chi phí vận chuyển & nhân công lắp đặt trọn gói..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.summaryBox}>
          <div className={styles.summaryRow}>
            <span>Tạm tính các hạng mục:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className={styles.summaryRow}>
              <span>Chiết khấu ưu đãi:</span>
              <span className={styles.discountText}>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>TỔNG CỘNG BÁO GIÁ:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.leftActions}>
            {onBackToDetail && (
              <button
                type="button"
                className={styles.backToDetailBtn}
                onClick={onBackToDetail}
              >
                <ArrowLeftIcon className="h-4 w-4" style={{ width: 15, height: 15 }} />
                <span>Xem Thông Tin Khách Hàng</span>
              </button>
            )}
            <button
              type="button"
              className={styles.pdfBtn}
              onClick={handleExportPDF}
              disabled={exportingPdf}
            >
              <ArrowDownTrayIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
              <span>{exportingPdf ? "Đang xuất PDF..." : "Xuất File PDF"}</span>
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              type="button"
              className={styles.saveDraftBtn}
              onClick={handleSaveDraft}
              disabled={loading}
            >
              <BookmarkIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
              <span>{loading ? "Đang lưu..." : "Lưu Báo Giá"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Printable Sheet for html2canvas & jsPDF */}
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
          <p><strong>Khách hàng:</strong> {lead.name}</p>
          <p><strong>Số điện thoại:</strong> {lead.phone}</p>
          {lead.email && <p><strong>Email:</strong> {lead.email}</p>}
          {lead.wedding_date && <p><strong>Ngày tổ chức:</strong> {new Date(lead.wedding_date).toLocaleDateString("vi-VN")}</p>}
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
    </>
  );
}
