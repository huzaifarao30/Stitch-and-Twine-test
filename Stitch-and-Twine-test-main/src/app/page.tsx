"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { bannerService } from "@/services/bannerService";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { reviewService } from "@/services/reviewService";
import { orderService } from "@/services/orderService";
import { Banner, Product, Category, Review } from "@/types";
import HeroSlider from "@/components/home/HeroSlider";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";

const FeaturedProductsSection = dynamic(
  () => import("@/components/home/HomeSections").then((m) => m.FeaturedProductsSection),
  { loading: () => null }
);
const CategoriesSection = dynamic(
  () => import("@/components/home/HomeSections").then((m) => m.CategoriesSection),
  { loading: () => null }
);
const EditorialSection = dynamic(
  () => import("@/components/home/HomeSections").then((m) => m.EditorialSection),
  { loading: () => null }
);
const WhyChooseUsSection = dynamic(
  () => import("@/components/home/HomeSections").then((m) => m.WhyChooseUsSection),
  { loading: () => null }
);
const ReviewsSection = dynamic(
  () => import("@/components/home/HomeSections").then((m) => m.ReviewsSection),
  { loading: () => null }
);

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [loadingHome, setLoadingHome] = useState(true);
  const [renderDeferredSections, setRenderDeferredSections] = useState(false);

  const loadBanners = useCallback(async () => {
    try {
      const bannerData = await bannerService.getBanners();
      setBanners(bannerData);
    } catch {
      setBanners([]);
    }
  }, []);

  const loadSecondaryContent = useCallback(async () => {
    setLoadingHome(true);
    try {
      const [featuredData, categoryData, reviewsData, ratingStats, uniqueCustomers] = await Promise.all([
        productService.getFeaturedProducts(8),
        categoryService.getCategories(),
        reviewService.getHomepageReviews(6, 24),
        reviewService.getApprovedReviewStats(),
        orderService.getPublicUniqueCustomerCount(),
      ]);

      setFeatured(featuredData);
      setCategories(categoryData);
      setReviews(reviewsData);
      setAverageRating(ratingStats.average);
      setCustomerCount(uniqueCustomers);
    } finally {
      setLoadingHome(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();

    const revealDeferredSections = () => {
      setRenderDeferredSections(true);
    };

    let revealIdleId: number | null = null;
    let revealTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const hasRequestIdleCallbackForReveal =
      typeof window !== "undefined" && typeof (window as Window & typeof globalThis & { requestIdleCallback?: unknown }).requestIdleCallback === "function";

    if (hasRequestIdleCallbackForReveal) {
      revealIdleId = window.requestIdleCallback(revealDeferredSections, { timeout: 800 });
    } else {
      revealTimeoutId = setTimeout(revealDeferredSections, 120);
    }

    const idleLoader = () => {
      void loadSecondaryContent();
    };

    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const hasRequestIdleCallback =
      typeof window !== "undefined" && typeof (window as Window & typeof globalThis & { requestIdleCallback?: unknown }).requestIdleCallback === "function";

    if (hasRequestIdleCallback) {
      idleId = window.requestIdleCallback(idleLoader, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(idleLoader, 150);
    }

    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "banners") {
        void loadBanners();
      }
      if (kind === "all" || kind === "products" || kind === "categories" || kind === "settings") {
        void loadSecondaryContent();
      }
    });

    return () => {
      if (revealIdleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(revealIdleId);
      }
      if (revealTimeoutId !== null) {
        clearTimeout(revealTimeoutId);
      }
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, [loadBanners, loadSecondaryContent]);

  return (
    <>
      <HeroSlider banners={banners} />
      {renderDeferredSections && (
        <>
          <FeaturedProductsSection products={featured} loading={loadingHome} />
          <CategoriesSection categories={categories} />
          <EditorialSection averageRating={averageRating} customerCount={customerCount} />
          <WhyChooseUsSection />
          <ReviewsSection reviews={reviews} />
        </>
      )}
    </>
  );
}
