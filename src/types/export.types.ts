export type ExportFormat = "excel" | "pdf";

export interface ExportPayload {
  format: ExportFormat;
  product_ids: number[];
  date_from: string | null;
  date_to: string | null;
  include: ("products" | "prices")[];
}
