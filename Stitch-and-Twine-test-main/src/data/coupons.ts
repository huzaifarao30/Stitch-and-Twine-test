import { Coupon } from "@/types";

export const coupons: Coupon[] = [
  {
    id: "coup-1",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 500,
    isActive: true,
    expiresAt: "2026-12-31",
  },
  {
    id: "coup-2",
    code: "LOVE50",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 700,
    isActive: true,
    expiresAt: "2026-06-30",
  },
  {
    id: "coup-3",
    code: "STICH20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 1000,
    isActive: true,
    expiresAt: "2026-12-31",
  },
];
