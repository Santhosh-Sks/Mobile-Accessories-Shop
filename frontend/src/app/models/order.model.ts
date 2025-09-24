export interface CartItem {
  productId: string;
  product?: any;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export interface Order {
  _id?: string;
  orderNumber?: string;
  user?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash_on_delivery' | 'card' | 'upi' | 'net_banking';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

export interface OrderResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  total: number;
}
