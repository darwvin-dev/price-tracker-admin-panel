export type Product = {
  id: number;
  name: string;
  image: string | null;
  min_price: number;
  max_price: number;
  price_diff: number;
  price_diff_percent: number;
  store_links: {
    id: number;
    store: string;
    url: string;
  }[];
  created_at: string;
}
