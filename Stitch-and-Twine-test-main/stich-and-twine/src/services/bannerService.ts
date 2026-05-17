import { Banner } from "@/types";
import { getAllSliders } from "@/lib/adminStore";

export const bannerService = {
  async getBanners(): Promise<Banner[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getAllSliders().filter((b) => b.isActive);
  },
};
