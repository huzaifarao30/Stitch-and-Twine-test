import { coupons } from "@/data/coupons";
import { Coupon } from "@/types";

export const couponService = {
  async applyCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message?: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "This coupon has expired" };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order of PKR ${coupon.minOrderAmount} required`,
      };
    }

    const discount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    return {
      valid: true,
      coupon,
      discount: Math.min(discount, subtotal),
      message: `Coupon applied! You saved PKR ${Math.min(discount, subtotal).toFixed(0)}`,
    };
  },
};
