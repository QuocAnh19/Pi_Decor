import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import type { Lead, Quotation } from "../../../lib/types";
import { formatCurrency } from "../../../lib/formatters";
import { Modal, Input } from "../../../components/ui";
import { useQuotationForm } from "../hooks/useQuotationForm";
import { QuotationPrintableSheet } from "./QuotationPrintableSheet";
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
  const {
    pdfRef,
    currentQuotation,
    fetchingDraft,
    saveSuccessMsg,
    items,
    discount,
    setDiscount,
    validUntil,
    setValidUntil,
    notes,
    setNotes,
    loading,
    exportingPdf,
    error,
    subtotal,
    total,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSaveDraft,
    handleExportPDF,
  } = useQuotationForm({ lead, initialQuotation, onSaved });

  const modalTitle = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <DocumentTextIcon className="h-5 w-5" style={{ width: 22, height: 22, color: "#a15c2e" }} />
      <span>
        {currentQuotation
          ? `Lập & Lưu Báo Giá (${currentQuotation.quotation_number})`
          : "Lập Báo Giá Chi Tiết Dịch Vụ Pi Decor"}
      </span>
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
        {fetchingDraft && (
          <p className={styles.fetchingNotice}>Đang kiểm tra dữ liệu báo giá đã lưu...</p>
        )}
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
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", Number(e.target.value))
                          }
                          style={{ textAlign: "center" }}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          step="100000"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(idx, "unit_price", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className={styles.colSubtotal}>{formatCurrency(itemSub)}</td>
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
              <button type="button" className={styles.backToDetailBtn} onClick={onBackToDetail}>
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
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
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

      <QuotationPrintableSheet
        pdfRef={pdfRef}
        lead={lead}
        currentQuotation={currentQuotation}
        items={items}
        subtotal={subtotal}
        discount={discount}
        total={total}
        notes={notes}
      />
    </>
  );
}
