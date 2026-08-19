// Types for Swiggy MCP integration

export interface SwiggySession {
  accessToken: string;
  expiresAt: number; // unix timestamp
}

export interface Address {
  id: string;
  label: string;
  displayText: string;
  addressLine?: string;
  city?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine?: string[];
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  imageUrl?: string;
  availabilityStatus?: string;
  minOrderAmount?: number;
  deliveryFee?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg?: boolean;
  category?: string;
  variants?: MenuItemVariant[];
}

export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  restaurantId?: string;
  restaurantName?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  couponDiscount?: number;
  appliedCoupon?: string;
}

export interface Coupon {
  code: string;
  title: string;
  description?: string;
  discount?: number;
  requiresOnlinePayment?: boolean;
}

export interface Order {
  orderId: string;
  status: string;
  restaurantName?: string;
  items?: CartItem[];
  total?: number;
  eta?: string;
  deliveryStatus?: string;
}

// Chat message types with rich content
export type MessageRole = 'user' | 'assistant';

export interface FoodCardData {
  type: 'food-card';
  restaurants?: Restaurant[];
  items?: MenuItem[];
}

export interface CartSummaryData {
  type: 'cart-summary';
  cart: Cart;
}

export interface OrderConfirmationData {
  type: 'order-confirmation';
  cart: Cart;
}

export interface OrderTrackingData {
  type: 'order-tracking';
  order: Order;
}

export interface AddressPickerData {
  type: 'address-picker';
  addresses: Address[];
}

export type RichContent =
  | FoodCardData
  | CartSummaryData
  | OrderConfirmationData
  | OrderTrackingData
  | AddressPickerData;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  richContent?: RichContent;
  timestamp: Date;
}

// Session storage type for iron-session
declare module 'iron-session' {
  interface IronSessionData {
    swiggy?: {
      accessToken: string;
      expiresAt: number;
    };
    oauthState?: {
      codeVerifier: string;
      state: string;
    };
  }
}
