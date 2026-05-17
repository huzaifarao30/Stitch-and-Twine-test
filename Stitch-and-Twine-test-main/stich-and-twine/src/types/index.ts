// Application-wide TypeScript types

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  isFeature: boolean;
  isActive: boolean;
  stock: number;
  variants?: Variant[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Variant {
  id: string;
  name: string;
  type: "size" | "color";
  options: VariantOption[];
}

export interface VariantOption {
  id: string;
  label: string;
  value: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  slug: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariants?: Record<string, string>;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  reviewText: string;
  productReference?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Settings {
  siteName: string;
  whatsappNumber: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  email: string;
  address: string;
  instagram?: string;
  facebook?: string;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}
