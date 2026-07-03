import { apiClient, apiFormDataClient } from "./client";

export type BillStatus = "DRAFT" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "PAID" | "VOIDED";

export type BillMedia = {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  access: "PUBLIC" | "PROTECTED";
  url: string;
};

export type BillRecord = {
  id: string;
  storeId: string;
  billNumber?: string | null;
  status: BillStatus;
  subtotalVnd?: number;
  discountVnd?: number;
  totalVnd: number;
  submittedAt?: string | null;
  usedAt?: string | null;
  reviewedAt?: string | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;
  store?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  booking?: {
    id: string;
    status: string;
    scheduledAt?: string | null;
  } | null;
  coupon?: {
    id: string;
    code: string;
    name: string;
  } | null;
  couponIssue?: {
    id: string;
    code: string;
    status: string;
  } | null;
  media?: BillMedia[];
};

export type CreateBillPayload = {
  bookingId?: string;
  storeId?: string;
  storeSlug?: string;
  couponId?: string;
  couponIssueId?: string;
  totalVnd: number;
  usedAt: string;
};

export type UploadedBillEvidence = {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  billId?: string | null;
};

const appendEvidenceFields = (formData: FormData, billId: string, file: File) => {
  formData.append("file", file);
  formData.append("billId", billId);
  formData.append("purpose", "bill-evidence");
  formData.append("access", "PROTECTED");
};

export const billApi = {
  submitMemberBill: (payload: CreateBillPayload) =>
    apiClient<BillRecord>("/member/bills", { data: payload }),
  submitPartnerBill: (payload: CreateBillPayload) =>
    apiClient<BillRecord>("/partner/bills", { data: payload }),
  uploadEvidence: (billId: string, file: File) => {
    const formData = new FormData();
    appendEvidenceFields(formData, billId, file);
    return apiFormDataClient<UploadedBillEvidence>("/storage/upload", formData);
  },
};
