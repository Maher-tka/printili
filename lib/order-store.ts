import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  OrderStatus,
  PaymentMethod,
  ProjectStatus,
  SampleUseConsent,
  SheetSize
} from "@/lib/generated/prisma/client";
import { type OrderStatusId } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";
import { getGuestProject } from "@/lib/project-store";

export type { OrderStatusId } from "@/lib/order-workflow";
export { orderStatusLabels } from "@/lib/order-workflow";

export type SampleUseConsentId = "private" | "blur_faces" | "show_public";

export type OrderSummary = {
  id: string;
  orderNumber: string;
  projectId: string;
  guestToken: string;
  projectCode: string;
  clientName: string;
  whatsapp: string;
  deliveryAddress: string;
  city: string;
  deliveryNotes: string;
  quantity: number;
  productOption: string;
  addFrame: boolean;
  giftWrap: boolean;
  premiumPaper: boolean;
  finish: "matte" | "glossy";
  urgentOrder: boolean;
  sampleUseConsent: SampleUseConsentId;
  paymentMethod: "cash_on_delivery";
  status: OrderStatusId;
  totalPrice: number | null;
  deliveryFee: number | null;
  previewFilePath: string | null;
  printFilePath: string | null;
  createdAt: string;
  updatedAt: string;
  templateSlug?: string | null;
  sheetSize?: string | null;
  statusHistory: OrderStatusHistorySummary[];
  adminNotes: AdminNoteSummary[];
};

export type OrderStatusHistorySummary = {
  id: string;
  orderId: string;
  fromStatus?: OrderStatusId | null;
  status: OrderStatusId;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
};

export type AdminNoteSummary = {
  id: string;
  projectId?: string | null;
  orderId?: string | null;
  author?: string | null;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type CreateOrderInput = {
  guestToken: string;
  clientName: string;
  whatsapp: string;
  deliveryAddress: string;
  city: string;
  deliveryNotes: string;
  quantity: number;
  productOption: string;
  addFrame: boolean;
  giftWrap: boolean;
  premiumPaper: boolean;
  finish: "matte" | "glossy";
  urgentOrder: boolean;
  deliveryFee: number | null;
  sampleUseConsent: SampleUseConsentId;
};

type LocalOrderRecord = OrderSummary;

const localOrderStorePath = path.join(process.cwd(), ".local-storage", "orders.json");

export async function createOrder(input: CreateOrderInput) {
  const project = await getGuestProject(input.guestToken);

  if (!project) {
    return null;
  }

  const existingOrder = await getOrderByProjectToken(input.guestToken);

  if (existingOrder) {
    return existingOrder;
  }

  const orderNumber = createOrderNumber();

  if (hasConfiguredDatabaseUrl()) {
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          clientName: input.clientName,
          whatsapp: input.whatsapp,
          deliveryAddress: input.deliveryAddress,
          city: input.city,
          deliveryNotes: input.deliveryNotes,
          quantity: input.quantity,
          productOption: input.productOption,
          addFrame: input.addFrame,
          giftWrap: input.giftWrap,
          premiumPaper: input.premiumPaper,
          finish: input.finish,
          urgentOrder: input.urgentOrder,
          deliveryFee: input.deliveryFee,
          sampleUseConsent: toPrismaConsent(input.sampleUseConsent),
          paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
          status: OrderStatus.NEW_ORDER,
          statusHistory: {
            create: {
              status: OrderStatus.NEW_ORDER,
              note: "Order submitted by customer.",
              changedBy: "customer"
            }
          },
          project: {
            connect: {
              id: project.id
            }
          }
        },
        include: orderInclude
      });

      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: ProjectStatus.ORDER_SUBMITTED,
          clientName: input.clientName,
          whatsapp: input.whatsapp,
          deliveryAddress: input.deliveryAddress,
          city: input.city,
          notes: input.deliveryNotes
        }
      });

      return toOrderSummary(order);
    } catch (error) {
      console.warn("Database order creation failed; using local development store.", error);
    }
  }

  const now = new Date().toISOString();
  const localOrder: LocalOrderRecord = {
    id: `local-order-${randomBytes(8).toString("hex")}`,
    orderNumber,
    projectId: project.id,
    guestToken: project.guestToken,
    projectCode: project.projectCode,
    clientName: input.clientName,
    whatsapp: input.whatsapp,
    deliveryAddress: input.deliveryAddress,
    city: input.city,
    deliveryNotes: input.deliveryNotes,
    quantity: input.quantity,
    productOption: input.productOption,
    addFrame: input.addFrame,
    giftWrap: input.giftWrap,
    premiumPaper: input.premiumPaper,
    finish: input.finish,
    urgentOrder: input.urgentOrder,
    sampleUseConsent: input.sampleUseConsent,
    paymentMethod: "cash_on_delivery",
    status: "new_order",
    totalPrice: null,
    deliveryFee: input.deliveryFee,
    previewFilePath: null,
    printFilePath: null,
    createdAt: now,
    updatedAt: now,
    templateSlug: project.chosenTemplateSlug,
    sheetSize: project.sheetSize,
    statusHistory: [
      {
        id: `local-history-${randomBytes(6).toString("hex")}`,
        orderId: "",
        status: "new_order",
        note: "Order submitted by customer.",
        changedBy: "customer",
        createdAt: now
      }
    ],
    adminNotes: []
  };
  localOrder.statusHistory[0].orderId = localOrder.id;

  const store = await readLocalOrderStore();
  store.push(localOrder);
  await writeLocalOrderStore(store);

  await patchLocalProject(input.guestToken, {
    status: "order_submitted",
    clientName: input.clientName,
    whatsapp: input.whatsapp,
    deliveryAddress: input.deliveryAddress,
    city: input.city,
    notes: input.deliveryNotes
  });

  return localOrder;
}

export async function listOrders() {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const orders = await prisma.order.findMany({
        include: orderInclude,
        orderBy: {
          createdAt: "desc"
        }
      });

      return orders.map(toOrderSummary);
    } catch (error) {
      console.warn("Database order listing failed; using local development store.", error);
    }
  }

  return (await readLocalOrderStore()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(orderId: string) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderInclude
      });

      return order ? toOrderSummary(order) : null;
    } catch (error) {
      console.warn("Database order lookup failed; using local development store.", error);
    }
  }

  return (await readLocalOrderStore()).find((order) => order.id === orderId) ?? null;
}

export async function getOrderByProjectToken(guestToken: string) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const project = await prisma.project.findUnique({
        where: { guestToken },
        select: { order: { include: orderInclude } }
      });

      return project?.order ? toOrderSummary(project.order) : null;
    } catch (error) {
      console.warn("Database project order lookup failed; using local development store.", error);
    }
  }

  return (await readLocalOrderStore()).find((order) => order.guestToken === guestToken) ?? null;
}

export async function updateOrderStatus({
  orderId,
  status,
  note,
  changedBy = "admin"
}: {
  orderId: string;
  status: OrderStatusId;
  note?: string;
  changedBy?: string;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderInclude
      });

      if (!currentOrder) {
        return null;
      }

      if (currentOrder.status === toPrismaStatus(status)) {
        return toOrderSummary(currentOrder);
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: toPrismaStatus(status),
          statusHistory: {
            create: {
              fromStatus: currentOrder.status,
              status: toPrismaStatus(status),
              note,
              changedBy
            }
          }
        },
        include: orderInclude
      });

      return toOrderSummary(updatedOrder);
    } catch (error) {
      console.warn("Database status update failed; using local development store.", error);
    }
  }

  return updateLocalOrder(orderId, (order) => {
    if (order.status === status) {
      return order;
    }

    const now = new Date().toISOString();

    return {
      ...order,
      status,
      updatedAt: now,
      statusHistory: [
        ...order.statusHistory,
        {
          id: `local-history-${randomBytes(6).toString("hex")}`,
          orderId,
          fromStatus: order.status,
          status,
          note,
          changedBy,
          createdAt: now
        }
      ]
    };
  });
}

export async function addAdminNote({
  orderId,
  projectId,
  body,
  author = "admin"
}: {
  orderId?: string;
  projectId?: string;
  body: string;
  author?: string;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const note = await prisma.adminNote.create({
        data: {
          orderId,
          projectId,
          body,
          author,
          isInternal: true
        }
      });

      return {
        ...note,
        createdAt: note.createdAt.toISOString()
      };
    } catch (error) {
      console.warn("Database note creation failed; using local development store.", error);
    }
  }

  if (!orderId) {
    return null;
  }

  const note: AdminNoteSummary = {
    id: `local-note-${randomBytes(6).toString("hex")}`,
    orderId,
    projectId,
    body,
    author,
    isInternal: true,
    createdAt: new Date().toISOString()
  };

  await updateLocalOrder(orderId, (order) => ({
    ...order,
    adminNotes: [note, ...order.adminNotes]
  }));

  return note;
}

export async function updateOrderGeneratedFiles({
  orderId,
  previewFilePath,
  printFilePath
}: {
  orderId: string;
  previewFilePath?: string | null;
  printFilePath?: string | null;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          previewFilePath,
          printFilePath
        },
        include: orderInclude
      });

      return toOrderSummary(order);
    } catch (error) {
      console.warn("Database file update failed; using local development store.", error);
    }
  }

  return updateLocalOrder(orderId, (order) => ({
    ...order,
    previewFilePath: previewFilePath ?? order.previewFilePath,
    printFilePath: printFilePath ?? order.printFilePath,
    updatedAt: new Date().toISOString()
  }));
}

function createOrderNumber() {
  return `ORD-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function patchLocalProject(guestToken: string, patch: Record<string, unknown>) {
  const localStorePath = path.join(process.cwd(), ".local-storage", "projects.json");

  try {
    const projects = JSON.parse(await readFile(localStorePath, "utf8")) as Array<
      Record<string, unknown>
    >;
    const index = projects.findIndex((project) => project.guestToken === guestToken);

    if (index >= 0) {
      projects[index] = { ...projects[index], ...patch };
      await writeFile(localStorePath, JSON.stringify(projects, null, 2));
    }
  } catch {
    // The database path does not use the local project store.
  }
}

async function updateLocalOrder(
  orderId: string,
  update: (order: LocalOrderRecord) => LocalOrderRecord
) {
  const store = await readLocalOrderStore();
  const index = store.findIndex((order) => order.id === orderId);

  if (index === -1) {
    return null;
  }

  const updatedOrder = update(withLocalOrderDefaults(store[index]));
  store[index] = updatedOrder;
  await writeLocalOrderStore(store);

  return updatedOrder;
}

async function readLocalOrderStore(): Promise<LocalOrderRecord[]> {
  try {
    return (JSON.parse(await readFile(localOrderStorePath, "utf8")) as LocalOrderRecord[]).map(
      withLocalOrderDefaults
    );
  } catch {
    return [];
  }
}

async function writeLocalOrderStore(store: LocalOrderRecord[]) {
  await mkdir(path.dirname(localOrderStorePath), { recursive: true });
  await writeFile(localOrderStorePath, JSON.stringify(store, null, 2));
}

function withLocalOrderDefaults(order: LocalOrderRecord): LocalOrderRecord {
  return {
    ...order,
    deliveryNotes: order.deliveryNotes ?? "",
    quantity: order.quantity ?? 1,
    productOption: order.productOption ?? "print_only",
    addFrame: order.addFrame ?? false,
    giftWrap: order.giftWrap ?? false,
    premiumPaper: order.premiumPaper ?? false,
    finish: order.finish ?? "matte",
    urgentOrder: order.urgentOrder ?? false,
    sampleUseConsent: order.sampleUseConsent ?? "private",
    previewFilePath: order.previewFilePath ?? null,
    printFilePath: order.printFilePath ?? null,
    statusHistory: order.statusHistory ?? [],
    adminNotes: order.adminNotes ?? []
  };
}

const orderInclude = {
  project: {
    include: {
      chosenTemplate: {
        select: {
          slug: true
        }
      }
    }
  },
  statusHistory: {
    orderBy: {
      createdAt: "asc" as const
    }
  },
  adminNotes: {
    orderBy: {
      createdAt: "desc" as const
    }
  }
};

function toOrderSummary(order: {
  id: string;
  orderNumber: string;
  projectId: string;
  clientName: string;
  whatsapp: string;
  deliveryAddress: string;
  city: string;
  deliveryNotes: string | null;
  quantity: number;
  productOption: string;
  addFrame: boolean;
  giftWrap: boolean;
  premiumPaper: boolean;
  finish: string;
  urgentOrder: boolean;
  sampleUseConsent: SampleUseConsent;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalPrice: unknown;
  deliveryFee: unknown;
  previewFilePath: string | null;
  printFilePath: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: {
    guestToken: string;
    projectCode: string;
    sheetSize: SheetSize;
    chosenTemplate?: {
      slug: string;
    } | null;
  };
  statusHistory: Array<{
    id: string;
    orderId: string;
    fromStatus: OrderStatus | null;
    status: OrderStatus;
    note: string | null;
    changedBy: string | null;
    createdAt: Date;
  }>;
  adminNotes: Array<{
    id: string;
    projectId: string | null;
    orderId: string | null;
    author: string | null;
    body: string;
    isInternal: boolean;
    createdAt: Date;
  }>;
}): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    projectId: order.projectId,
    guestToken: order.project.guestToken,
    projectCode: order.project.projectCode,
    clientName: order.clientName,
    whatsapp: order.whatsapp,
    deliveryAddress: order.deliveryAddress,
    city: order.city,
    deliveryNotes: order.deliveryNotes ?? "",
    quantity: order.quantity,
    productOption: order.productOption,
    addFrame: order.addFrame,
    giftWrap: order.giftWrap,
    premiumPaper: order.premiumPaper,
    finish: order.finish === "glossy" ? "glossy" : "matte",
    urgentOrder: order.urgentOrder,
    sampleUseConsent: fromPrismaConsent(order.sampleUseConsent),
    paymentMethod: "cash_on_delivery",
    status: fromPrismaStatus(order.status),
    totalPrice: order.totalPrice === null ? null : Number(order.totalPrice),
    deliveryFee: order.deliveryFee === null ? null : Number(order.deliveryFee),
    previewFilePath: order.previewFilePath,
    printFilePath: order.printFilePath,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    templateSlug: order.project.chosenTemplate?.slug ?? null,
    sheetSize: order.project.sheetSize,
    statusHistory: order.statusHistory.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      fromStatus: item.fromStatus ? fromPrismaStatus(item.fromStatus) : null,
      status: fromPrismaStatus(item.status),
      note: item.note,
      changedBy: item.changedBy,
      createdAt: item.createdAt.toISOString()
    })),
    adminNotes: order.adminNotes.map((note) => ({
      id: note.id,
      projectId: note.projectId,
      orderId: note.orderId,
      author: note.author,
      body: note.body,
      isInternal: note.isInternal,
      createdAt: note.createdAt.toISOString()
    }))
  };
}

function hasConfiguredDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  return Boolean(url && !url.includes("johndoe:randompassword@localhost:5432/mydb"));
}

function fromPrismaStatus(status: OrderStatus): OrderStatusId {
  return status.toLowerCase() as OrderStatusId;
}

function toPrismaStatus(status: OrderStatusId) {
  const statusMap: Record<OrderStatusId, OrderStatus> = {
    new_order: OrderStatus.NEW_ORDER,
    waiting_confirmation: OrderStatus.WAITING_CONFIRMATION,
    waiting_client_approval: OrderStatus.WAITING_CLIENT_APPROVAL,
    approved: OrderStatus.APPROVED,
    ready_to_print: OrderStatus.READY_TO_PRINT,
    printed: OrderStatus.PRINTED,
    cut_finished: OrderStatus.CUT_FINISHED,
    out_for_delivery: OrderStatus.OUT_FOR_DELIVERY,
    delivered: OrderStatus.DELIVERED,
    cancelled: OrderStatus.CANCELLED
  };

  return statusMap[status];
}

function fromPrismaConsent(consent: SampleUseConsent): SampleUseConsentId {
  if (consent === SampleUseConsent.BLUR_FACES) {
    return "blur_faces";
  }

  if (consent === SampleUseConsent.SHOW_PUBLIC) {
    return "show_public";
  }

  return "private";
}

function toPrismaConsent(consent: SampleUseConsentId) {
  if (consent === "blur_faces") {
    return SampleUseConsent.BLUR_FACES;
  }

  if (consent === "show_public") {
    return SampleUseConsent.SHOW_PUBLIC;
  }

  return SampleUseConsent.PRIVATE;
}
