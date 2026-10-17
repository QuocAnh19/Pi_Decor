import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminServicesPage } from "./AdminServicesPage";
import { api } from "../../lib/api";
import type { ServiceCategory } from "../../lib/types";

vi.mock("../../lib/api", () => ({
  api: {
    getServices: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
  },
}));

vi.mock("../../components/admin/AdminLayout", () => ({
  useAdminAuth: () => ({
    admin: { email: "admin@pidecor.vn", role: "owner" },
    logout: vi.fn(),
  }),
}));

const mockServices: ServiceCategory[] = [
  {
    id: "svc-1",
    title: "Thiết kế kiến trúc",
    brand: "Pi Architecture",
    tagline: "Kiến trúc đương đại",
    description: "Dịch vụ thiết kế kiến trúc toàn diện",
    order: 0,
    featured: true,
    accent: "wedding",
    icon: "compass",
    items: ["Bản vẽ 2D", "Phối cảnh 3D"],
    cover: "/uploads/cover1.jpg",
    href: "/dich-vu/kien-truc",
    ctaLabel: "Tư vấn ngay",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "svc-2",
    title: "Thi công nội thất",
    brand: "Pi Interior",
    tagline: "Nội thất cao cấp",
    description: "Thi công nội thất chìa khóa trao tay",
    order: 1,
    featured: false,
    accent: "kids",
    icon: "hammer",
    items: ["Sản xuất nội thất", "Lắp đặt"],
    cover: null,
    href: "/dich-vu/noi-that",
    ctaLabel: "Xem thêm",
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AdminServicesPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getServices).mockResolvedValue(mockServices);
  });

  it("hiển thị danh sách dịch vụ đúng thứ tự", async () => {
    renderWithClient(<AdminServicesPage />);

    expect(await screen.findByText("Thiết kế kiến trúc")).toBeInTheDocument();
    expect(screen.getByText("Thi công nội thất")).toBeInTheDocument();
    expect(screen.getByText("Pi Architecture")).toBeInTheDocument();
    expect(screen.getByText("Pi Interior")).toBeInTheDocument();
  });

  it("cho phép đổi thứ tự dịch vụ qua nút lên/xuống", async () => {
    vi.mocked(api.updateService).mockResolvedValue({
      ...mockServices[0],
      order: 1,
    });

    renderWithClient(<AdminServicesPage />);

    // Đợi danh sách hiển thị
    await screen.findByText("Thiết kế kiến trúc");

    const moveDownButtons = screen.getAllByRole("button", { name: /Di chuyển .* xuống/i });
    expect(moveDownButtons.length).toBeGreaterThan(0);

    await user.click(moveDownButtons[0]);

    await waitFor(() => {
      expect(api.updateService).toHaveBeenCalledWith("svc-1", { order: 1 });
    });
  });

  it("mở form tạo mới và kiểm tra validation khi thiếu tiêu đề", async () => {
    renderWithClient(<AdminServicesPage />);

    await screen.findByText("Thiết kế kiến trúc");

    const addBtn = screen.getByRole("button", { name: /Thêm dịch vụ/i });
    await user.click(addBtn);

    expect(screen.getByText("Thêm dịch vụ mới")).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /Tạo dịch vụ/i });
    await user.click(saveBtn);

    expect(await screen.findByText(/Thiếu tiêu đề dịch vụ/i)).toBeInTheDocument();
    expect(api.createService).not.toHaveBeenCalled();
  });
});
