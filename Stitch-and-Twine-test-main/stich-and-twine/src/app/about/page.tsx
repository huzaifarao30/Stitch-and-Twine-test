"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Heart, Award, Users } from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      name: "Ayesha Tariq",
      role: "Founder & Chief Crocheter",
      initials: "AT",
      gradient: "linear-gradient(135deg, #E8A0B0, #F2C4CE)",
    },
    {
      name: "Muoaz Ibrahim",
      role: "Creative & Operations",
      initials: "MI",
      gradient: "linear-gradient(135deg, #C4A484, #D4B896)",
    },
  ];

  return (
    <div className="bg-boutique min-h-screen pt-20">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1481833761820-0509d3217039?w=1920&q=80" alt="About us" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 flex flex-col items-center justify-center text-center px-4">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.3em] text-[#F2C4CE] mb-3">Our Story</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-playfair text-4xl md:text-6xl text-white font-medium">
            About Stitch & Twine
          </motion.h1>
        </div>
      </div>

      {/* Main Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-4">Our Philosophy</p>
          <h2 className="section-title mb-6">Handmade is the New Luxury</h2>
          <div className="space-y-4 text-[#6B6B6B] text-base leading-relaxed">
            <p>
              Stitch and Twine was born in a small apartment in Rawalpindi in 2024, from a simple desire to create beautiful things by hand. What started as a hobby quickly grew into something much bigger — a brand dedicated to the art of slow, intentional craft.
            </p>
            <p>
              We believe that handmade objects carry something machine-made things cannot: the energy of the person who created them. Every loop of yarn, every knot, every finished piece holds hours of focus, creativity, and care.
            </p>
            <p>
              Our pieces are not just products — they are stories, gifts, memories. We create for the moments that matter: birthdays, weddings, Eid celebrations, and quiet everyday joys.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
          {[
            { icon: Heart, title: "Made With Love", desc: "Every stitch placed by a human hand, with care and intention.", color: "#F2C4CE" },
            { icon: Sparkles, title: "Premium Materials", desc: "We use only the finest yarn — soft, vibrant, and long-lasting.", color: "#C4A484" },
            { icon: Award, title: "Artisan Quality", desc: "Each piece is a work of art. We never rush our process.", color: "#E8A0B0" },
            { icon: Users, title: "Community First", desc: "Our customers are family. We listen, we respond, we care.", color: "#D4B896" },
          ].map((val, i) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-5 bg-white rounded-2xl shadow-boutique"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${val.color}25` }}>
                <val.icon size={20} style={{ color: val.color }} />
              </div>
              <div>
                <h3 className="font-medium text-[#2E2E2E] mb-1">{val.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{val.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <div>
          <p className="section-eyebrow text-center mb-4">The Makers</p>
          <h2 className="section-title text-center mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-sm sm:max-w-md mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-[#F2C4CE] flex items-center justify-center"
                  style={{ background: member.gradient }}
                >
                  <span className="font-playfair text-3xl font-semibold text-white tracking-wide">{member.initials}</span>
                </div>
                <p className="font-playfair text-lg text-[#2E2E2E]">{member.name}</p>
                <p className="text-xs text-[#C4A484] mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
