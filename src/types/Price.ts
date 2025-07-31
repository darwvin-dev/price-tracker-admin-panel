export type Price = {
  id: number;
  store: string;
  price: number;
  crawler_name: string;
  checked_at: string;
  available: boolean;
  variation: string | null; 
};