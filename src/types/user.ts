export interface User {
  id: number;
  name: string;
  phone: string | null;
  phone_code: string | null;
  email: string;
  image: string;
  address: string;
  zip_code: number;
  latitude: number;
  longitude: number;
  created_from: string;
  country_id: string | null;
  timestamp: number;
  country: {
    flag: string;
    id: number;
    code: string;
    title: string;
    symbol: string;
  };
}
