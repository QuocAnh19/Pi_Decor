import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "./LeadForm";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    submitLead: vi.fn(),
  },
}));

describe("LeadForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị thông báo lỗi khi số điện thoại không đúng định dạng VN", async () => {
    render(<LeadForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(/Nguyễn Văn A/i);
    const phoneInput = screen.getByPlaceholderText(/0905 123 456/i);
    const submitBtn = screen.getByRole("button", { name: /Gửi Đăng Ký Tư Vấn/i });

    await user.type(nameInput, "Nguyễn Văn Test");
    await user.type(phoneInput, "123456"); // Sai format
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Số điện thoại không đúng định dạng/i)
    ).toBeInTheDocument();
    expect(api.submitLead).not.toHaveBeenCalled();
  });

  it("gửi lead thành công khi nhập đúng thông tin và chuyển sang giao diện success", async () => {
    vi.mocked(api.submitLead).mockResolvedValueOnce({ id: "lead-new-123" });

    render(<LeadForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(/Nguyễn Văn A/i);
    const phoneInput = screen.getByPlaceholderText(/0905 123 456/i);
    const submitBtn = screen.getByRole("button", { name: /Gửi Đăng Ký Tư Vấn/i });

    await user.type(nameInput, "Trần Thị Hợp Lệ");
    await user.type(phoneInput, "0905123456");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.submitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Trần Thị Hợp Lệ",
          phone: "0905123456",
        })
      );
    });

    expect(
      await screen.findByText(/Gửi thông tin thành công!/i)
    ).toBeInTheDocument();
  });

  it("hiển thị thông báo lỗi từ server khi gửi thất bại", async () => {
    vi.mocked(api.submitLead).mockRejectedValueOnce(
      new Error("Lỗi máy chủ tạm thời, vui lòng thử lại sau.")
    );

    render(<LeadForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(/Nguyễn Văn A/i);
    const phoneInput = screen.getByPlaceholderText(/0905 123 456/i);
    const submitBtn = screen.getByRole("button", { name: /Gửi Đăng Ký Tư Vấn/i });

    await user.type(nameInput, "Lê Văn Thất Bại");
    await user.type(phoneInput, "0912345678");
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Lỗi máy chủ tạm thời/i)
    ).toBeInTheDocument();
  });
});
