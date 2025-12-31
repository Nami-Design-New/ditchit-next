import { Category } from "./category";
import { User } from "./user";

export interface Post {
  id: number;
  type: string;
  condition: "new" | "used";
  category_id: number;
  category: Category;
  user: {
    user: User;
  };
  title: string;
  description: string;
  image: string;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  is_promoted: boolean;
  old_promote: boolean;
  promote_expire: string | null;
  is_love: boolean;
  is_sold: boolean;
  distance: number;
  views: number;
  date: string;
  time: string;
  publishing_duration: string;
  country: {
    symbol: string;
  };
  timestamp: number;
}
