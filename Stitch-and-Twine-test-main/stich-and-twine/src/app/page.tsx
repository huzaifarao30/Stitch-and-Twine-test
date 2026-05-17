"use client";
import { useEffect, useState } from "react";
import { bannerService } from "@/services/bannerService";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { Banner, Product, Category, Review } from "@/types";
import HeroSlider from "@/components/home/HeroSlider";
import {
  FeaturedProductsSection,
  CategoriesSection,
  EditorialSection,
  WhyChooseUsSection,
  ReviewsSection,
  InstagramSection,
} from "@/components/home/HomeSections";
import { reviews as reviewsData } from "@/data/reviews";

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    bannerService.getBanners().then(setBanners);
    productService.getFeaturedProducts(8).then(setFeatured);
    categoryService.getCategories().then(setCategories);
  }, []);

  return (
    <>
      <HeroSlider banners={banners} />
      <FeaturedProductsSection products={featured} />
      <CategoriesSection categories={categories} />
      <EditorialSection />
      <WhyChooseUsSection />
      <ReviewsSection reviews={reviewsData} />
      <InstagramSection />
    </>
  );
}
