import type { Price } from "./Price";
import type { StoreLink } from "./StoreLink";
import type { Variations } from "./variations";

export type Product = {
  id: number;
  store_links: StoreLink[];
  color: string;
  price_history: Price[];
  user_price_diff: number;
  name: string;
  image: string | null;
  min_price: number;
  max_price: number;
  price_diff: number;
  price_diff_percent: number;
  created_at: string;
  variations: Variations[];
};

