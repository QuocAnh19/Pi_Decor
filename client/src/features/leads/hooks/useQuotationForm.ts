import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { Lead, Quotation, QuotationItem } from "../../../lib/types";

interface UseQuotationFormParams {
  lead: Lead;
  initialQuotation?: Quotation | null;
  onSaved: () => void;
}

/**
 * Quản lý state bảng báo giá, tự nạp bản nháp gần nhất, lưu nháp và xuất PDF.
 */
export function useQuotationForm({
  lead,
  initialQuotation,
  onSaved,
}: UseQuotationFormParams) {
  const { token } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(
    initialQuotation ?? null,
  );
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [items, setItems] = useState<Omit<QuotationItem, "subtotal">[]>([
    {
      description: "Gói trang trí cưới hỏi cao cấp Pi Decor",
      quantity: 1,
      unit_price: 15000000,
    },
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
          })),
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
              })),
            );
          }
          setDiscount(latestQuote.discount ?? 0);
          setValidUntil(latestQuote.valid_until ?? "");
          setNotes(latestQuote.notes ?? "");
        }
      })
      .catch((err) =>
        console.warn("Could not load existing quotation draft:", err),
      )
      .finally(() => setFetchingDraft(false));
  }, [token, lead.id, initialQuotation]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  );
  const total = Math.max(0, subtotal - Number(discount || 0));

  function handleAddItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemChange(
    index: number,
    field: keyof Omit<QuotationItem, "subtotal">,
    value: unknown,
  ) {
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
      setError(
        err instanceof Error ? err.message : "Lỗi khi lưu báo giá nháp.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!pdfRef.current) return;
    setExportingPdf(true);
    try {
      const [{ toPng }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

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

  return {
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
  };
}
