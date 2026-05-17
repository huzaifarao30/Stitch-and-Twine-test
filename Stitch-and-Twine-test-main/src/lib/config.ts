// lib/config.ts — Centralized site configuration
export const CONFIG = {
  social: {
    instagram: "https://www.instagram.com/stitchandtwine.pk?igsh=MXZkbWh1bDY0OHoyMA==",
    facebook: "https://www.facebook.com/share/18EKcDD9Ev/",
    whatsapp: {
      number: "923190691621",
      displayNumber: "+92 319 0691621",
      link: "https://wa.me/923190691621",
      orderLink: (orderDetails: string) =>
        `https://wa.me/923190691621?text=${encodeURIComponent(orderDetails)}`,
    },
  },
  business: {
    name: "Stitch & Twine",
    location: "Rawalpindi, Pakistan",
    hours: "Open 24/7",
    email: "hello@stitchandtwine.com",
    whatsappDisplay: "+92 319 0691621",
  },
};
