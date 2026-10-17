import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { api } from "../../../lib/api";
import type { Lead, LeadActivity } from "../../../lib/types";

vi.mock("../../../lib/api", () => ({
  api: {
    getLeadActivities: vi.fn(),
    addLeadActivity: vi.fn(),
    updateLeadStatus: vi.fn(),
  },
}));

const mockLead: Lead = {
  id: "lead-123",
  name: "Nguyễn Thu Thảo",
  phone: "0905123456",
  email: "thao@gmail.com",
  wedding_date: "2026-11-20",
  message: "[Loại sự kiện: Tiệc cưới ngoài trời] Cần tư vấn hoa tươi",
  design_snapshot: null,
  status: "new",
  created_at: "2026-10-15T08:00:00.000Z",
};

const mockActivities: LeadActivity[] = [
  {
    id: "act-1",
    lead_id: "lead-123",
    admin_id: "admin-1",
    admin_email: "quocanh@pidecor.vn",
    admin_name: "quocanh",
    activity_type: "note",
    body: "Đã liên hệ tư vấn sảnh tiệc",
    metadata: null,
    created_at: "2026-10-16T09:00:00.000Z",
  },
  {
    id: "act-2",
    lead_id: "lead-123",
    admin_id: null,
    admin_email: null,
    admin_name: null,
    activity_type: "status_change",
    body: 'Trạng thái chuyển từ "new" sang "contacted"',
    metadata: { from: "new", to: "contacted" },
    created_at: "2026-10-15T08:30:00.000Z",
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("LeadDetailDrawer & Activity Timeline", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getLeadActivities).mockResolvedValue(mockActivities);
  });

  it("chuyển sang tab Hoạt động và hiển thị timeline lịch sử chăm sóc", async () => {
    renderWithClient(
      <LeadDetailDrawer lead={mockLead} onClose={vi.fn()} onStatusChange={vi.fn()} />
    );

    // Mặc định ở tab Thông tin chi tiết
    expect(screen.getByText("Thông Tin Liên Hệ Khách Hàng")).toBeInTheDocument();

    // Chuyển sang tab Hoạt động & Lịch sử
    const activitiesTab = screen.getByRole("tab", { name: /Hoạt động & Lịch sử/i });
    await user.click(activitiesTab);

    // Kiểm tra activities được render
    expect(await screen.findByText("Đã liên hệ tư vấn sảnh tiệc")).toBeInTheDocument();
    expect(screen.getByText('Trạng thái chuyển từ "new" sang "contacted"')).toBeInTheDocument();
    expect(screen.getByText("quocanh")).toBeInTheDocument();
    expect(screen.getByText("(Hệ thống / Admin cũ)")).toBeInTheDocument();
  });

  it("thêm ghi chú mới thành công qua form timeline", async () => {
    const newActivity: LeadActivity = {
      id: "act-3",
      lead_id: "lead-123",
      admin_id: "admin-1",
      admin_email: "quocanh@pidecor.vn",
      admin_name: "quocanh",
      activity_type: "note",
      body: "Khách hàng yêu cầu gửi báo giá bổ sung",
      metadata: null,
      created_at: new Date().toISOString(),
    };
    vi.mocked(api.addLeadActivity).mockResolvedValue(newActivity);

    renderWithClient(
      <LeadDetailDrawer lead={mockLead} onClose={vi.fn()} onStatusChange={vi.fn()} />
    );

    const activitiesTab = screen.getByRole("tab", { name: /Hoạt động & Lịch sử/i });
    await user.click(activitiesTab);

    await screen.findByText("Đã liên hệ tư vấn sảnh tiệc");

    const textarea = screen.getByPlaceholderText(/Thêm ghi chú nội bộ/i);
    await user.type(textarea, "Khách hàng yêu cầu gửi báo giá bổ sung");

    const submitBtn = screen.getByRole("button", { name: /Lưu hoạt động/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.addLeadActivity).toHaveBeenCalledWith("lead-123", {
        activity_type: "note",
        body: "Khách hàng yêu cầu gửi báo giá bổ sung",
      });
    });
  });
});
