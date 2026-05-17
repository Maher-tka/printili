import { describe, expect, it } from "vitest";
import {
  getOrderStatusActions,
  isOrderStatusAtLeast,
  orderStatuses,
  shouldPromoteToReadyToPrintAfterExport
} from "../lib/order-workflow";

describe("admin order workflow", () => {
  it("keeps status actions unique and forward moving", () => {
    for (const status of orderStatuses) {
      const actions = getOrderStatusActions(status);
      const actionKeys = actions.map((action) => `${action.status}:${action.label}`);

      expect(new Set(actionKeys).size).toBe(actionKeys.length);
      expect(actions.filter((action) => action.status === "cancelled").length).toBeLessThanOrEqual(
        1
      );
    }

    expect(getOrderStatusActions("new_order").map((action) => action.status)).toEqual([
      "waiting_confirmation",
      "cancelled"
    ]);
    expect(getOrderStatusActions("waiting_confirmation")[0].status).toBe("waiting_client_approval");
    expect(getOrderStatusActions("waiting_client_approval")[0].status).toBe("approved");
  });

  it("promotes exports only before the ready-to-print stage", () => {
    expect(shouldPromoteToReadyToPrintAfterExport("new_order")).toBe(true);
    expect(shouldPromoteToReadyToPrintAfterExport("approved")).toBe(true);
    expect(shouldPromoteToReadyToPrintAfterExport("ready_to_print")).toBe(false);
    expect(shouldPromoteToReadyToPrintAfterExport("printed")).toBe(false);
    expect(shouldPromoteToReadyToPrintAfterExport("cancelled")).toBe(false);
  });

  it("orders the print workflow before delivery and cancellation", () => {
    expect(isOrderStatusAtLeast("ready_to_print", "approved")).toBe(true);
    expect(isOrderStatusAtLeast("delivered", "ready_to_print")).toBe(true);
    expect(isOrderStatusAtLeast("cancelled", "delivered")).toBe(true);
  });
});
