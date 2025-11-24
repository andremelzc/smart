export type QuantityFieldKey = "rooms" | "beds" | "baths";

export type OrderByValue = "" | "price" | "rating";

export type FilterFormState = {
  city: string;
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  beds: string;
  baths: string;
  adults: string;
  children: string;
  babies: string;
  pets: string;
  orderBy: OrderByValue;
};

export type AmenityOption = {
  id: number;
  label: string;
};

export type AmenityCategory = {
  id: number;
  name: string;
  amenities: AmenityOption[];
};
