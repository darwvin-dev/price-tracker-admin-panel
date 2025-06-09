export interface Alert {
  id: number;
  product: {
    id: number;
    name: string;
  };
  threshold_percent: number;
  message: string;
  read_on_site: boolean;
  created_at: string;
}
