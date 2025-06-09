export interface ProductStreamResult {
  type: "stores" | "result";
  stores?: StoreInfo[];
  store?: StoreInfo;
  url?: string;
  price?: number;
  prices?: { variation: string; price: number }[];
  found?: boolean;
  error?: string;
}

export interface StoreInfo {
  name: string;
  module: string;
}
