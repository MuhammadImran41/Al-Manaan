export interface ProductImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
  altText?: string;
}

export interface ProductVariant {
  id: number;
  size: string;
  color?: string;
  colorHex?: string;
  stockQuantity: number;
  priceAdjustment?: number;
  sku: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  fabric?: string;
  care?: string;
  stitchType?: string;
  averageRating: number;
  reviewCount: number;
  categoryId: number;
  categoryName: string;
  genderType?: string;
  mainImageUrl?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductsResponse {
  items: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductQueryParams {
  pageNumber?: number;
  pageSize?: number;
  categoryId?: number;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sortBy?: string;
  search?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  gender: string;
  parentCategoryId?: number;
  sortOrder: number;
  isActive: boolean;
}
