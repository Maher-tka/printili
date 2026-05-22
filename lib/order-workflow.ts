export type OrderStatusId =
  | "new_order"
  | "waiting_confirmation"
  | "waiting_client_approval"
  | "approved"
  | "ready_to_print"
  | "printed"
  | "cut_finished"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatusAction = {
  status: OrderStatusId;
  label: string;
  note: string;
  tone?: "default" | "danger";
};

export const orderStatuses: OrderStatusId[] = [
  "new_order",
  "waiting_confirmation",
  "waiting_client_approval",
  "approved",
  "ready_to_print",
  "printed",
  "cut_finished",
  "out_for_delivery",
  "delivered",
  "cancelled"
];

export const orderStatusLabels: Record<OrderStatusId, string> = {
  new_order: "New order",
  waiting_confirmation: "Waiting confirmation",
  waiting_client_approval: "Waiting client approval",
  approved: "Approved",
  ready_to_print: "Ready to print",
  printed: "Printed",
  cut_finished: "Cut/finished",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const cancelAction: OrderStatusAction = {
  status: "cancelled",
  label: "Cancel order",
  note: "Order cancelled by admin.",
  tone: "danger"
};

const orderStatusActions: Record<OrderStatusId, OrderStatusAction[]> = {
  new_order: [
    {
      status: "waiting_confirmation",
      label: "Start confirmation",
      note: "Admin started customer confirmation."
    },
    cancelAction
  ],
  waiting_confirmation: [
    {
      status: "waiting_client_approval",
      label: "Client confirmed",
      note: "Customer details confirmed; waiting for preview approval."
    },
    cancelAction
  ],
  waiting_client_approval: [
    {
      status: "approved",
      label: "Approve for production",
      note: "Preview and production details approved."
    },
    cancelAction
  ],
  approved: [
    {
      status: "ready_to_print",
      label: "Mark ready to print",
      note: "Order is ready for print production."
    },
    cancelAction
  ],
  ready_to_print: [
    {
      status: "printed",
      label: "Mark printed",
      note: "Print production completed."
    },
    cancelAction
  ],
  printed: [
    {
      status: "cut_finished",
      label: "Mark cut/finished",
      note: "Finishing work completed."
    },
    cancelAction
  ],
  cut_finished: [
    {
      status: "out_for_delivery",
      label: "Send out for delivery",
      note: "Order sent out for delivery."
    },
    cancelAction
  ],
  out_for_delivery: [
    {
      status: "delivered",
      label: "Mark delivered",
      note: "Order delivered."
    }
  ],
  delivered: [],
  cancelled: []
};

export function isOrderStatusId(value: unknown): value is OrderStatusId {
  return typeof value === "string" && orderStatuses.includes(value as OrderStatusId);
}

export function getOrderStatusActions(status: OrderStatusId) {
  return orderStatusActions[status];
}

export function canTransitionOrderStatus({
  from,
  to,
  allowOverride = false
}: {
  from: OrderStatusId;
  to: OrderStatusId;
  allowOverride?: boolean;
}) {
  if (from === to || allowOverride) {
    return true;
  }

  return getOrderStatusActions(from).some((action) => action.status === to);
}

export function getInvalidTransitionMessage(from: OrderStatusId, to: OrderStatusId) {
  return `Cannot move order from ${orderStatusLabels[from]} to ${orderStatusLabels[to]} without admin override.`;
}

export function isOrderStatusAtLeast(status: OrderStatusId, minimumStatus: OrderStatusId) {
  const statusIndex = orderStatuses.indexOf(status);
  const minimumIndex = orderStatuses.indexOf(minimumStatus);

  return statusIndex >= 0 && minimumIndex >= 0 && statusIndex >= minimumIndex;
}

export function shouldPromoteToReadyToPrintAfterExport(status: OrderStatusId) {
  return status !== "cancelled" && !isOrderStatusAtLeast(status, "ready_to_print");
}
