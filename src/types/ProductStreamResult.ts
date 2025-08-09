export interface ProductStreamResult {
  type: "stores" | "result";
  stores?: StoreInfo[];
  store?: StoreInfo;
  url?: string;
  price?: number;
  prices?: { color: string; price: number }[];
  found?: boolean;
  error?: string;
  helper?: object
}

export interface StoreInfo {
  name: string;
  module?: string;
  is_core?: boolean;
}
