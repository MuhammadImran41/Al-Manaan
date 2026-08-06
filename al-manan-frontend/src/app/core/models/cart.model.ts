export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color?: string;
  subTotal: number;
  availableStock: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subTotal: number;
  discountAmount?: number;
  couponCode?: string;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  size: string;
  color?: string;
}
