import { User } from "@/types/user";

export interface PostDetailsResponse {
  id: number;
  type: string;
  condition: string;
  user_id: number;
  user: {
    user: User;
  };
  category_id: number;
  category: Category;
  title: string;
  description: string;
  image: string;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  firm_price: boolean;
  virtual_tour: boolean;
  is_promoted: boolean;
  old_promote: boolean;
  promote_expire: string;
  is_sold: boolean;
  delivery_method: string;
  is_love: boolean;
  images: Images[];
  options: Option[];
  distance: number;
  features: Feature[];
  views: number;
  date: string;
  time: string;
  publishing_duration: string;
  timestamp: number;
  country?: {
    id: number;
    title?: string;
    symbol?: string;
  };
}

export interface Category {
  id: number;
  title: string;
  image: string;
  is_condition: boolean;
  options: unknown[];
}

export interface Option {
  id: number;
  title: string;
  value: string | number;
  category_option: {
    title: string;
  };
  category_option_id: number;
}

export interface Feature {
  id: number;
  title: string;
  value: string;
}

export interface Images {
  id: number;
  image: string;
}
