export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  size: string;
  color?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subTotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}
