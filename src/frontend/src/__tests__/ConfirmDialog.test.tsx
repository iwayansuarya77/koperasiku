import { ConfirmDialog } from "@/components/ConfirmDialog";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

function renderDialog(
  overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {},
) {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Bersihkan Data"
      description="Tindakan ini permanen."
      confirmLabel="Bersihkan"
      confirmWord="HAPUS"
      onConfirm={onConfirm}
      isPending={false}
      {...overrides}
    />,
  );
  return { onConfirm, onOpenChange };
}

describe("ConfirmDialog", () => {
  it("disables confirmation until the exact word is typed", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    const confirm = screen.getByTestId("confirm.confirm_button");
    expect(confirm).toBeDisabled();

    await user.type(screen.getByTestId("confirm.input"), "hapus");
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("keeps confirmation disabled for a wrong word", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.type(screen.getByTestId("confirm.input"), "HAPUSKAN");
    expect(screen.getByTestId("confirm.confirm_button")).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows the error message when provided", () => {
    renderDialog({ errorMessage: "Konfirmasi salah" });
    expect(screen.getByTestId("confirm.error_state")).toHaveTextContent(
      "Konfirmasi salah",
    );
  });
});
