"use client";

import { useMemo } from "react";
import {
  Lightning,
  LockKey,
  Link as LinkIcon,
  Leaf,
  CookingPot,
  Rocket,
  Target,
  FirstAidKit,
  YinYang,
  Sparkle,
  Globe,
  Ruler,
  ChartBar,
  Shield,
  Diamond,
  GraduationCap,
  DeviceMobile,
  Trophy,
  Star,
  Heart,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<{ size?: number; color?: string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }>> = {
  lightning: Lightning,
  lock: LockKey,
  link: LinkIcon,
  leaf: Leaf,
  chef: CookingPot,
  rocket: Rocket,
  target: Target,
  medical: FirstAidKit,
  zen: YinYang,
  sparkle: Sparkle,
  globe: Globe,
  ruler: Ruler,
  chart: ChartBar,
  shield: Shield,
  diamond: Diamond,
  graduation: GraduationCap,
  mobile: DeviceMobile,
  trophy: Trophy,
  star: Star,
  heart: Heart,
};

interface BrandResult {
  name: string;
  tagline: string;
  colors: { name: string; hex: string }[];
  fonts: { heading: string; body: string };
  personality: string[];
  logoText: string;
  logoIcon: string;
}

interface WebsitePreviewProps {
  brand: BrandResult;
  industry: string;
  onClose: () => void;
}

/* Sort colors by luminance to assign roles intelligently */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getIndustryContent(industry: string, brandName: string) {
  const map: Record<string, { hero: string; cta: string; features: { title: string; desc: string; icon: string }[]; testimonial: string; author: string }> = {
    "Technology": {
      hero: "Build the future with cutting-edge solutions that scale with your ambition.",
      cta: "Get Started Free",
      features: [
        { title: "Lightning Fast", desc: "Optimized performance that keeps you ahead of the competition.", icon: "lightning" },
        { title: "Secure by Design", desc: "Enterprise-grade security built into every layer of the stack.", icon: "lock" },
        { title: "Seamless Integration", desc: "Connect with the tools you already love in minutes.", icon: "link" },
      ],
      testimonial: `${brandName} transformed how our team ships products. We're 3x faster and haven't looked back.`,
      author: "Sarah Chen, CTO at Meridian Labs",
    },
    "Food & Beverage": {
      hero: "Crafted with passion, served with love. Taste the difference quality makes.",
      cta: "View Our Menu",
      features: [
        { title: "Fresh Ingredients", desc: "Sourced daily from local farms and trusted producers.", icon: "leaf" },
        { title: "Handcrafted", desc: "Every item made with care by our expert team.", icon: "chef" },
        { title: "Fast Delivery", desc: "From our kitchen to your door in 30 minutes or less.", icon: "rocket" },
      ],
      testimonial: `Best discovery of the year. ${brandName} has become our go-to for every occasion.`,
      author: "Marcus Rivera, Food Enthusiast",
    },
    "Health & Wellness": {
      hero: "Your journey to a healthier, happier you starts right here.",
      cta: "Start Your Journey",
      features: [
        { title: "Personalized Plans", desc: "Programs tailored to your unique body and goals.", icon: "target" },
        { title: "Expert Guidance", desc: "Certified professionals supporting you every step.", icon: "medical" },
        { title: "Holistic Approach", desc: "Mind, body, and spirit — we care for the whole you.", icon: "zen" },
      ],
      testimonial: `${brandName} helped me completely transform my lifestyle. I feel incredible.`,
      author: "Jamie Torres, Wellness Advocate",
    },
    "Fashion": {
      hero: "Express yourself. Discover styles that tell your unique story.",
      cta: "Shop the Collection",
      features: [
        { title: "Curated Styles", desc: "Handpicked pieces that define modern elegance.", icon: "sparkle" },
        { title: "Sustainable Fashion", desc: "Ethically made with materials that respect our planet.", icon: "globe" },
        { title: "Perfect Fit", desc: "Inclusive sizing and tailored options for every body.", icon: "ruler" },
      ],
      testimonial: `${brandName} gets it. Quality, style, and sustainability without compromise.`,
      author: "Alex Kim, Style Editor",
    },
    "Finance": {
      hero: "Smart money management for a brighter financial future.",
      cta: "Open Your Account",
      features: [
        { title: "Smart Analytics", desc: "AI-powered insights that help you make better decisions.", icon: "chart" },
        { title: "Bank-Level Security", desc: "Your money protected by industry-leading encryption.", icon: "shield" },
        { title: "Zero Hidden Fees", desc: "Transparent pricing — what you see is what you get.", icon: "diamond" },
      ],
      testimonial: `${brandName} made finance approachable. My savings have grown 40% this year.`,
      author: "David Park, Small Business Owner",
    },
    "Education": {
      hero: "Learn without limits. World-class education, accessible to everyone.",
      cta: "Explore Courses",
      features: [
        { title: "Expert Instructors", desc: "Learn from industry leaders and top academics.", icon: "graduation" },
        { title: "Learn Your Way", desc: "Self-paced content you can access anytime, anywhere.", icon: "mobile" },
        { title: "Certified Skills", desc: "Earn credentials that employers actually value.", icon: "trophy" },
      ],
      testimonial: `${brandName} helped me land my dream job. The courses are genuinely world-class.`,
      author: "Priya Sharma, Software Engineer",
    },
  };

  return map[industry] || {
    hero: `Experience the difference that ${brandName} brings. We're redefining what's possible.`,
    cta: "Get Started",
    features: [
      { title: "Quality First", desc: "Every detail crafted with precision and care.", icon: "star" },
      { title: "Always Evolving", desc: "We innovate constantly to serve you better.", icon: "rocket" },
      { title: "Human-Centered", desc: "Built around your needs, not the other way around.", icon: "heart" },
    ],
    testimonial: `Working with ${brandName} has been a game-changer. Couldn't recommend them more highly.`,
    author: "Jordan Blake, Happy Customer",
  };
}

export default function WebsitePreview({ brand, industry, onClose }: WebsitePreviewProps) {
  const palette = useMemo(() => {
    const sorted = [...brand.colors].sort((a, b) => luminance(a.hex) - luminance(b.hex));
    // darkest → text, next → heading accent, mid → primary/buttons, lighter → secondary, lightest → background
    return {
      text: sorted[0].hex,
      heading: sorted[1]?.hex || sorted[0].hex,
      primary: sorted[2]?.hex || sorted[1]?.hex || sorted[0].hex,
      secondary: sorted[3]?.hex || sorted[2]?.hex,
      bg: sorted[4]?.hex || sorted[3]?.hex || "#ffffff",
      // lighter bg variant
      bgAlt: sorted[3]?.hex || "#f5f5f5",
    };
  }, [brand.colors]);

  const content = useMemo(() => getIndustryContent(industry, brand.name), [industry, brand.name]);

  const headingFont = brand.fonts.heading;
  const bodyFont = brand.fonts.body;

  // Determine if background is dark
  const bgIsDark = luminance(palette.bg) < 0.5;
  const textOnBg = bgIsDark ? "#f5f5f5" : palette.text;
  const mutedOnBg = bgIsDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

  // Hero uses primary color as bg
  const primaryIsDark = luminance(palette.primary) < 0.5;
  const textOnPrimary = primaryIsDark ? "#ffffff" : palette.text;

  // Card bg
  const bgAltIsDark = luminance(palette.bgAlt) < 0.5;
  const textOnBgAlt = bgAltIsDark ? "#f5f5f5" : palette.text;
  const mutedOnBgAlt = bgAltIsDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: palette.bg, color: textOnBg, fontFamily: bodyFont }}>
      {/* Floating back button */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        ← Back to Results
      </button>

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${bgIsDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{brand.logoIcon}</span>
          <span className="text-lg font-bold tracking-wide" style={{ fontFamily: headingFont }}>{brand.name}</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm" style={{ color: mutedOnBg }}>
          <span className="cursor-default hover:opacity-80">About</span>
          <span className="cursor-default hover:opacity-80">Services</span>
          <span className="cursor-default hover:opacity-80">Contact</span>
          <span
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: palette.primary, color: textOnPrimary }}
          >
            {content.cta}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="w-full px-6 py-20 sm:py-32 text-center"
        style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.heading})` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-4">{brand.logoIcon}</div>
          <h1
            className="text-4xl sm:text-6xl font-bold mb-4 leading-tight"
            style={{ fontFamily: headingFont, color: textOnPrimary }}
          >
            {brand.name}
          </h1>
          <p
            className="text-lg sm:text-xl mb-2 opacity-90"
            style={{ fontFamily: bodyFont, color: textOnPrimary }}
          >
            {brand.tagline}
          </p>
          <p
            className="text-base sm:text-lg mb-8 opacity-75 max-w-xl mx-auto"
            style={{ color: textOnPrimary }}
          >
            {content.hero}
          </p>
          <button
            className="px-8 py-3 rounded-full text-base font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: palette.bg, color: palette.primary }}
          >
            {content.cta} →
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="w-full px-6 py-16 sm:py-24" style={{ backgroundColor: palette.bg }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: headingFont, color: textOnBg }}
          >
            Why {brand.name}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {content.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 sm:p-8 transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: palette.bgAlt,
                  border: `1px solid ${bgAltIsDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                }}
              >
                <div className="mb-4">
                  {(() => { const Icon = iconMap[f.icon]; return Icon ? <Icon size={36} weight="duotone" color={palette.primary} /> : null; })()}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: headingFont, color: textOnBgAlt }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: mutedOnBgAlt }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="w-full px-6 py-16 sm:py-24" style={{ backgroundColor: palette.bgAlt }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-6" style={{ color: palette.primary }}>&ldquo;</div>
          <blockquote
            className="text-xl sm:text-2xl font-medium leading-relaxed mb-6"
            style={{ fontFamily: headingFont, color: textOnBgAlt }}
          >
            {content.testimonial}
          </blockquote>
          <p className="text-sm" style={{ color: mutedOnBgAlt }}>— {content.author}</p>
        </div>
      </section>

      {/* CTA Band */}
      <section
        className="w-full px-6 py-16 text-center"
        style={{ backgroundColor: palette.primary }}
      >
        <h2
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ fontFamily: headingFont, color: textOnPrimary }}
        >
          Ready to get started?
        </h2>
        <p className="mb-8 opacity-80" style={{ color: textOnPrimary }}>
          Join thousands who trust {brand.name}.
        </p>
        <button
          className="px-8 py-3 rounded-full text-base font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: palette.bg, color: palette.primary }}
        >
          {content.cta} →
        </button>
      </section>

      {/* Footer */}
      <footer
        className="w-full px-6 py-10 text-center"
        style={{
          backgroundColor: palette.text,
          color: palette.bg,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">{brand.logoIcon}</span>
          <span className="text-lg font-bold tracking-wide" style={{ fontFamily: headingFont }}>{brand.name}</span>
        </div>
        <p className="text-sm opacity-60">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm opacity-50">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}
