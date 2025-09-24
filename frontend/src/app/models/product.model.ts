export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  images?: string[];
  stock: number;
  featured?: boolean;
  specifications?: {
    compatibility?: string;
    color?: string;
    material?: string;
    warranty?: string;
  };
  ratings?: {
    average: number;
    count: number;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  featured?: boolean;
}

export interface ProductResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  total: number;
}
