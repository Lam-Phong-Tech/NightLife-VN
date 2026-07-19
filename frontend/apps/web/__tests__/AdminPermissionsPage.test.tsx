import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPermissionsPage from "@/app/admin/permissions/page";
import { getAuthUser, type AuthRole } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  authSessionChangeEvent: "nightlife-auth-session-change",
  getAuthUser: vi.fn(),
}));

const mockCurrentRole = (role: AuthRole) => {
  vi.mocked(getAuthUser).mockReturnValue({
    id: `${role.toLowerCase()}-1`,
    email: `${role.toLowerCase()}@nightlife.vn`,
    displayName: role,
    role,
  });
};

describe("AdminPermissionsPage role hierarchy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("hides operator permissions from operator accounts", async () => {
    mockCurrentRole("OPERATOR");

    render(<AdminPermissionsPage />);

    await waitFor(() => expect(getAuthUser).toHaveBeenCalled());
    expect(screen.queryByText("Nhân viên vận hành")).not.toBeInTheDocument();
    expect(screen.queryByText("Quản trị viên")).not.toBeInTheDocument();
    expect(screen.getByText("Đối tác")).toBeInTheDocument();
    expect(screen.getByText("Nhân viên quán")).toBeInTheDocument();
    expect(screen.getByText("Người dùng")).toBeInTheDocument();
  });

  it("allows admin accounts to manage operator permissions", async () => {
    mockCurrentRole("ADMIN");

    render(<AdminPermissionsPage />);

    expect(await screen.findByText("Nhân viên vận hành")).toBeInTheDocument();
    expect(screen.queryByText("Quản trị viên")).not.toBeInTheDocument();
  });

  it("allows super admin accounts to manage admin and operator permissions", async () => {
    mockCurrentRole("SUPER_ADMIN");

    render(<AdminPermissionsPage />);

    expect(await screen.findByText("Nhân viên vận hành")).toBeInTheDocument();
    expect(screen.getByText("Quản trị viên")).toBeInTheDocument();
  });
});
