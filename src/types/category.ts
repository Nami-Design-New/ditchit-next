export interface Category {
  id: number;
  title: string;
  image: string;
  is_condition: boolean;
  type?: string;
  options: {
    id: number;
    title: string;
    type: "input" | "select";
    values: { id: number; title: string }[];
  }[];
}
