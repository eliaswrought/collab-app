"use client";

import { useState, useCallback, useEffect } from "react";
import WebsitePreview from "@/components/WebsitePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Palette, TextAa, MaskHappy, Sliders, Images, Globe, ArrowsClockwise, Shuffle, CaretDown, ArrowDown, Check, Leaf, Shapes } from "@phosphor-icons/react";

/* ───────── Types ───────── */
interface SliderValue {
  label: [string, string];
  value: number; // 0-100
}

interface BrandInputs {
  name: string;
  description: string;
  industry: string;
  values: string[];
  audiences: string[];
  sliders: SliderValue[];
  logoStyle: string;
}

const LOGO_STYLES = [
  { id: "geometric", name: "Geometric", desc: "Clean shapes, symmetry, mathematical precision", icon: "◇" },
  { id: "organic", name: "Organic", desc: "Flowing forms, natural curves, hand-crafted feel", icon: "leaf" },
  { id: "typographic", name: "Typographic", desc: "The name IS the logo, creative letterforms", icon: "Aa" },
  { id: "abstract", name: "Abstract", desc: "Conceptual marks, unique symbols", icon: "✦" },
  { id: "monogram", name: "Monogram", desc: "Initials or letter-based mark", icon: "M" },
  { id: "mascot", name: "Mascot", desc: "Character or icon-based", icon: "mask" },
];

interface BrandResult {
  name: string;
  tagline: string;
  colors: { name: string; hex: string; role?: string }[];
  fonts: { heading: string; body: string };
  personality: string[];
  logoText: string;
  logoIcon: string;
  sliderSnapshot: SliderValue[];
}

/* ───────── Constants ───────── */
const INDUSTRIES = [
  "Technology", "Food & Beverage", "Health & Wellness", "Fashion", "Finance",
  "Education", "Real Estate", "Travel", "Entertainment", "Creative Agency",
  "SaaS", "E-Commerce", "Local Business", "Non-Profit", "Other"
];

const CORE_VALUES = [
  "Innovation", "Trust", "Simplicity", "Quality", "Community",
  "Sustainability", "Speed", "Creativity", "Transparency", "Empowerment",
  "Authenticity", "Excellence", "Freedom", "Security", "Joy",
  "Wisdom", "Courage", "Compassion", "Disruption", "Heritage"
];

const AUDIENCES = [
  "Small Business Owners", "Startup Founders", "Enterprise Teams", "Freelancers",
  "Designers", "Developers", "Marketers", "Students", "Parents",
  "Gen Z", "Millennials", "Professionals", "Creatives", "Executives", "Everyone"
];

const DEFAULT_SLIDERS: SliderValue[] = [
  { label: ["Friend", "Authority"], value: 50 },
  { label: ["Young & Innovative", "Mature & Classic"], value: 50 },
  { label: ["Playful", "Serious"], value: 50 },
  { label: ["Mass Market", "Elite"], value: 50 },
  { label: ["Casual", "Formal"], value: 50 },
  { label: ["Loud & Bold", "Quiet & Subtle"], value: 50 },
];

/* ───────── Brand Generation Logic ───────── */

/* ── HSL ↔ Hex helpers ── */
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ── Curated anchor hues — ~50 designer-approved base hues ── */
const ANCHOR_HUES = [
  0, 8, 15, 25, 35, 45, 55, 90, 100, 120, 135, 145, 155, 170, 180,
  195, 205, 210, 220, 225, 235, 240, 250, 260, 270, 280, 290, 300,
  310, 320, 330, 340, 345, 350, 355,
];

function snapToAnchor(hue: number): number {
  hue = ((hue % 360) + 360) % 360;
  let best = ANCHOR_HUES[0], bestDist = 360;
  for (const a of ANCHOR_HUES) {
    const d = Math.min(Math.abs(hue - a), 360 - Math.abs(hue - a));
    if (d < bestDist) { bestDist = d; best = a; }
  }
  return best;
}

/* ── Banned zone enforcement ── */
function enforceBans(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  // Yellow-green (65-85) at high saturation → clamp sat
  if (h >= 65 && h <= 85 && s > 50) s = 48;
  // Pure yellow (50-60) as primary → shift to gold/amber
  if (h >= 50 && h <= 60) h = h >= 55 ? 45 : 35;
  // Neon: sat>85 AND light>60 → cap lightness
  if (s > 85 && l > 60) l = 58;
  // Muddy brown: hue 20-40, sat 20-40%, light 30-45% → boost sat
  if (h >= 20 && h <= 40 && s >= 20 && s <= 40 && l >= 30 && l <= 45) s = 55;
  return [h, s, l];
}

/* ── Color naming — evocative designer-quality names ── */
function nameColor(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;

  // Near-white overrides
  if (l > 90) {
    if (h < 15 || h >= 345) return "Rosewater";
    if (h < 40) return "Peach Cream";
    if (h < 70) return "Ivory";
    if (h < 160) return "Mint Cream";
    if (h < 195) return "Glacier";
    if (h < 260) return "Frost";
    if (h < 310) return "Lavender Mist";
    return "Blush Whisper";
  }
  // Near-black overrides
  if (l < 20) {
    if (h < 15 || h >= 345) return "Oxblood";
    if (h < 40) return "Espresso";
    if (h < 70) return "Dark Amber";
    if (h < 160) return "Pine Night";
    if (h < 195) return "Abyss";
    if (h < 260) return "Midnight";
    if (h < 310) return "Deep Plum";
    return "Wine Dark";
  }

  // Rich naming by hue range + sat/light
  const hi = s > 60, md = s > 35, br = l > 52;
  // Reds (345-360, 0-15)
  if (h < 15 || h >= 345) {
    if (h >= 345 || h < 5) return hi ? (br ? "Scarlet" : "Crimson") : (br ? "Dusty Rose" : "Garnet");
    return hi ? (br ? "Vermillion" : "Carmine") : (br ? "Coral Blush" : "Rosewood");
  }
  // Oranges (15-40)
  if (h < 25) return hi ? (br ? "Tangerine" : "Burnt Sienna") : (br ? "Peach" : "Terracotta");
  if (h < 40) return hi ? (br ? "Amber" : "Copper") : (br ? "Sandy Gold" : "Umber");
  // Yellows/golds (40-65)
  if (h < 50) return hi ? (br ? "Marigold" : "Dark Gold") : (br ? "Champagne" : "Antique Bronze");
  if (h < 65) return hi ? (br ? "Sunshine" : "Saffron") : (br ? "Buttercream" : "Khaki");
  // Yellow-greens/greens (65-160)
  if (h < 100) return hi ? (br ? "Chartreuse" : "Olive") : (br ? "Sage" : "Moss");
  if (h < 130) return hi ? (br ? "Emerald" : "Forest") : (br ? "Seafoam" : "Fern");
  if (h < 150) return hi ? (br ? "Jade" : "Malachite") : (br ? "Celadon" : "Hunter");
  if (h < 160) return hi ? (br ? "Spring" : "Viridian") : (br ? "Pistachio" : "Bottle Green");
  // Cyans/teals (160-195)
  if (h < 175) return hi ? (br ? "Turquoise" : "Teal") : (br ? "Aquamarine" : "Petrol");
  if (h < 195) return hi ? (br ? "Cyan" : "Deep Teal") : (br ? "Powder Teal" : "Slate Teal");
  // Blues (195-260)
  if (h < 210) return hi ? (br ? "Cerulean" : "Ocean") : (br ? "Cornflower" : "Cadet");
  if (h < 225) return hi ? (br ? "Royal Blue" : "Cobalt") : (br ? "Periwinkle" : "Steel");
  if (h < 240) return hi ? (br ? "Sapphire" : "Navy") : (br ? "Powder Blue" : "Denim");
  if (h < 260) return hi ? (br ? "Indigo" : "Ink Blue") : (br ? "Wisteria" : "Slate Blue");
  // Purples (260-310)
  if (h < 275) return hi ? (br ? "Violet" : "Royal Purple") : (br ? "Lavender" : "Plum");
  if (h < 290) return hi ? (br ? "Amethyst" : "Deep Purple") : (br ? "Lilac" : "Aubergine");
  if (h < 310) return hi ? (br ? "Orchid" : "Byzantium") : (br ? "Thistle" : "Raisin");
  // Pinks/magentas (310-345)
  if (h < 325) return hi ? (br ? "Magenta" : "Fuchsia") : (br ? "Blush" : "Mauve");
  return hi ? (br ? "Hot Pink" : "Raspberry") : (br ? "Rose Quartz" : "Mulberry");
}

/* ── Algorithmic palette generation (curated) ── */
const INDUSTRY_HUES: Record<string, number> = {
  "Technology": 210, "Food & Beverage": 25, "Health & Wellness": 145, "Fashion": 330,
  "Finance": 215, "Education": 195, "Real Estate": 35, "Travel": 180,
  "Entertainment": 280, "Creative Agency": 315, "SaaS": 230, "E-Commerce": 20,
  "Local Business": 40, "Non-Profit": 160, "Other": 200,
};

const VALUE_HUE_SHIFTS: Record<string, number> = {
  "Sustainability": -30, "Trust": 10, "Innovation": 40, "Joy": -60, "Creativity": 50,
  "Community": -20, "Speed": -10, "Simplicity": 0, "Quality": 5, "Transparency": 15,
  "Empowerment": 20, "Authenticity": -15, "Excellence": 10, "Freedom": -40,
  "Security": 15, "Wisdom": 30, "Courage": -45, "Compassion": -25, "Disruption": 45,
  "Heritage": -5,
};

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function generatePalette(inputs: BrandInputs): { name: string; hex: string; role: string }[] {
  const s = inputs.sliders;
  const friendAuth = s[0].value / 100;
  const youngMature = s[1].value / 100;
  const playfulSerious = s[2].value / 100;
  const massElite = s[3].value / 100;
  const casualFormal = s[4].value / 100;
  const loudQuiet = s[5].value / 100;

  // Random jitter so regenerating without changes gives variety
  const jitter = () => (Math.random() - 0.5) * 12; // ±6° hue
  const satJitter = () => (Math.random() - 0.5) * 8; // ±4% sat
  const lightJitter = () => (Math.random() - 0.5) * 6; // ±3% light

  // 1. Raw hue from industry
  let rawHue = (INDUSTRY_HUES[inputs.industry] ?? 200) + jitter();

  // 2. Value shifts (subtle)
  if (inputs.values.length > 0) {
    const shift = inputs.values.reduce((sum, v) => sum + (VALUE_HUE_SHIFTS[v] ?? 0), 0) / inputs.values.length;
    rawHue += shift * 0.4;
  }

  // 3. Slider nudges
  rawHue += (casualFormal - 0.5) * -15;
  rawHue += (friendAuth - 0.5) * 10;

  // 4. Snap to nearest anchor hue, then nudge ±15° for personality
  const anchorHue = snapToAnchor(rawHue);
  const nudge = (playfulSerious - 0.5) * 10 + (youngMature - 0.5) * -8;
  const primaryHue = ((anchorHue + clamp(nudge, -15, 15)) % 360 + 360) % 360;

  // 5. Primary S/L within golden ratio constraints (sat 55-75, light 40-55)
  let primarySat = lerp(75, 55, youngMature) + lerp(5, -5, playfulSerious) + lerp(5, -5, loudQuiet) + satJitter();
  primarySat = clamp(primarySat, 52, 78);
  let primaryLight = lerp(55, 40, massElite) + lightJitter();
  primaryLight = clamp(primaryLight, 38, 57);

  // 6. Secondary: analogous 25-35° away (sat 35-55, light 45-60)
  const secOffset = lerp(25, 35, casualFormal) * (casualFormal > 0.5 ? -1 : 1);
  const secHue = ((primaryHue + secOffset) % 360 + 360) % 360;
  let secSat = clamp(primarySat - lerp(15, 25, youngMature) + satJitter(), 32, 58);
  let secLight = clamp(lerp(60, 45, massElite) + lightJitter(), 43, 62);

  // 7. Accent: complementary/triadic 120-180° (sat 70-90, light 45-55)
  const accentOffset = lerp(120, 180, playfulSerious);
  const accentHue = ((primaryHue + accentOffset) % 360 + 360) % 360;
  let accentSat = clamp(primarySat + 15 + satJitter(), 67, 93);
  let accentLight = clamp(lerp(55, 45, loudQuiet) + lightJitter(), 43, 57);

  // 8. Background: same hue family, near-white (sat 5-15, light 95-98)
  const bgHue = primaryHue;
  const bgSat = clamp(lerp(15, 5, casualFormal), 5, 15);
  const bgLight = clamp(lerp(98, 95, massElite), 95, 98);

  // 9. Text: complementary hue, near-black (sat 10-25, light 8-18)
  const textHue = (primaryHue + 180) % 360;
  const textSat = clamp(lerp(25, 10, loudQuiet), 10, 25);
  const textLight = clamp(lerp(18, 8, massElite), 8, 18);

  // Apply banned zones to all colors
  const [pH, pS, pL] = enforceBans(primaryHue, primarySat, primaryLight);
  const [sH, sS, sL] = enforceBans(secHue, secSat, secLight);
  const [aH, aS, aL] = enforceBans(accentHue, accentSat, accentLight);
  // bg and text are low-sat so bans rarely trigger, but apply anyway
  const [bH, bS, bL] = enforceBans(bgHue, bgSat, bgLight);
  const [tH, tS, tL] = enforceBans(textHue, textSat, textLight);

  return [
    { name: nameColor(pH, pS, pL), hex: hslToHex(pH, pS, pL), role: "Primary" },
    { name: nameColor(sH, sS, sL), hex: hslToHex(sH, sS, sL), role: "Secondary" },
    { name: nameColor(aH, aS, aL), hex: hslToHex(aH, aS, aL), role: "Accent" },
    { name: nameColor(bH, bS, bL), hex: hslToHex(bH, bS, bL), role: "Background" },
    { name: nameColor(tH, tS, tL), hex: hslToHex(tH, tS, tL), role: "Text" },
  ];
}

const FONT_PAIRS = [
  { heading: "Inter", body: "Inter", vibe: "clean" },
  { heading: "Playfair Display", body: "Lato", vibe: "premium" },
  { heading: "Space Grotesk", body: "IBM Plex Sans", vibe: "tech" },
  { heading: "Fredoka One", body: "Nunito", vibe: "playful" },
  { heading: "Merriweather", body: "Source Sans Pro", vibe: "classic" },
  { heading: "Anton", body: "Roboto Mono", vibe: "bold" },
  { heading: "DM Serif Display", body: "DM Sans", vibe: "elegant" },
  { heading: "JetBrains Mono", body: "Inter", vibe: "dev" },
  { heading: "Libre Baskerville", body: "Cabin", vibe: "earthy" },
  { heading: "Bebas Neue", body: "Open Sans", vibe: "energetic" },
];

// Unicode icons removed — AI-generated logos replace these

function loadGoogleFonts(fonts: string[]) {
  const unique = [...new Set(fonts)];
  unique.forEach((font) => {
    const id = `gfont-${font.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function generateBrand(inputs: BrandInputs): BrandResult {
  const s = inputs.sliders;
  const friendAuth = s[0].value;
  const youngMature = s[1].value;
  const playfulSerious = s[2].value;
  const massElite = s[3].value;
  const casualFormal = s[4].value;
  const loudQuiet = s[5].value;

  // Algorithmic palette from all inputs
  const colors = generatePalette(inputs);

  let fontVibe: string;
  if (massElite > 65) fontVibe = "premium";
  else if (playfulSerious < 35) fontVibe = "playful";
  else if (casualFormal > 65) fontVibe = "elegant";
  else if (youngMature < 35) fontVibe = "tech";
  else if (loudQuiet < 35) fontVibe = "bold";
  else if (youngMature > 65) fontVibe = "classic";
  else fontVibe = "clean";

  const matchingFonts = FONT_PAIRS.filter(f => f.vibe === fontVibe);
  // 70% chance matching vibe, 30% chance any font for variety on regenerate
  const fontPool = matchingFonts.length > 0 && Math.random() > 0.3 ? matchingFonts : FONT_PAIRS;
  const fonts = pick(fontPool);

  // Trait synonym pools — pick randomly for variety on regenerate
  const traitPools: { condition: boolean; options: string[] }[] = [
    { condition: friendAuth < 40, options: ["Approachable", "Friendly", "Warm", "Welcoming", "Down-to-Earth"] },
    { condition: friendAuth > 60, options: ["Authoritative", "Commanding", "Trusted", "Credible", "Expert"] },
    { condition: youngMature < 40, options: ["Innovative", "Fresh", "Forward-Thinking", "Cutting-Edge", "Modern"] },
    { condition: youngMature > 60, options: ["Established", "Timeless", "Heritage", "Classic", "Enduring"] },
    { condition: playfulSerious < 40, options: ["Playful", "Fun", "Whimsical", "Spirited", "Lively"] },
    { condition: playfulSerious > 60, options: ["Serious", "Professional", "Focused", "Deliberate", "Composed"] },
    { condition: massElite > 60, options: ["Premium", "Luxury", "Exclusive", "Upscale", "Elevated"] },
    { condition: massElite < 40, options: ["Accessible", "Everyday", "For Everyone", "Democratic", "Universal"] },
    { condition: loudQuiet < 40, options: ["Bold", "Striking", "Loud", "Unapologetic", "Daring"] },
    { condition: loudQuiet > 60, options: ["Refined", "Subtle", "Understated", "Graceful", "Quiet"] },
  ];

  const traits: string[] = [];
  for (const pool of traitPools) {
    if (pool.condition) traits.push(pick(pool.options));
  }
  
  // Shuffle user values before adding to avoid same order every time
  const shuffledValues = shuffle(inputs.values);
  traits.push(...shuffledValues.slice(0, 4 - Math.min(traits.length, 2)));
  const personality = shuffle(traits).slice(0, 5);

  const taglineTemplates = [
    `${inputs.values[0] || "Quality"} meets design.`,
    `Brand identity, ${personality[0]?.toLowerCase() || "redefined"}.`,
    `Your brand, distilled.`,
    `Where ${(inputs.values[0] || "vision").toLowerCase()} takes shape.`,
    `${personality[0] || "Bold"} brands start here.`,
    `Design with intention.`,
    `Your identity, forged.`,
    `Brands worth remembering.`,
    `From vision to identity.`,
    `The brand you've been looking for.`,
    `${personality[0] || "Smart"}. ${personality[1] || "Simple"}. Yours.`,
    `Built for the ${inputs.audiences[0]?.toLowerCase() || "bold"}.`,
    `Not just a name — an identity.`,
    `Crafted with ${(inputs.values[0] || "care").toLowerCase()}.`,
    `Where ${inputs.industry.toLowerCase()} meets identity.`,
  ];

  return {
    name: inputs.name,
    tagline: pick(taglineTemplates),
    colors,
    fonts: { heading: fonts.heading, body: fonts.body },
    personality,
    logoText: inputs.name.toUpperCase(),
    logoIcon: "◆",
    sliderSnapshot: [...inputs.sliders],
  };
}

function saveBrand(brand: BrandResult) {
  try {
    const saved = JSON.parse(localStorage.getItem("logotruffle_brands") || "[]");
    saved.push({ ...brand, createdAt: new Date().toISOString() });
    localStorage.setItem("logotruffle_brands", JSON.stringify(saved));
  } catch {}
}

/* ───────── Components ───────── */

function PersonalitySlider({ slider, onChange }: { slider: SliderValue; onChange: (v: number) => void }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs sm:text-sm text-neutral-400 mb-2">
        <span>{slider.label[0]}</span>
        <span>{slider.label[1]}</span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[slider.value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:bg-neutral-800 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-purple-500 [&_[data-slot=slider-range]]:to-pink-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-neutral-900 [&_[data-slot=slider-thumb]]:bg-gradient-to-br [&_[data-slot=slider-thumb]]:from-purple-400 [&_[data-slot=slider-thumb]]:to-pink-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:shadow-purple-500/30"
      />
    </div>
  );
}

function ChipSelector({ options, selected, onToggle, max }: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  max: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && selected.length >= max;
        return isSelected ? (
          <Badge
            key={opt}
            variant="outline"
            onClick={() => onToggle(opt)}
            className="px-4 py-3 text-sm cursor-pointer border-purple-500 bg-purple-500/20 text-purple-300 shadow-sm shadow-purple-500/20 hover:bg-purple-500/30 active:scale-95 transition-all select-none"
          >
            {opt}
          </Badge>
        ) : (
          <Badge
            key={opt}
            variant="outline"
            onClick={() => !isDisabled && onToggle(opt)}
            className={`px-4 py-3 text-sm cursor-pointer transition-all active:scale-95 select-none ${
              isDisabled
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-600 cursor-not-allowed"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 active:bg-neutral-800"
            }`}
          >
            {opt}
          </Badge>
        );
      })}
    </div>
  );
}

/* ───────── Transition wrapper ───────── */
function AccordionSection({ icon, title, defaultOpen = false, children }: { icon: React.ReactNode; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-200 flex items-center gap-2">
          {icon} {title}
        </span>
        <CaretDown
          size={16}
          className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {children}
    </div>
  );
}

/* ───────── Main Page ───────── */

export default function Home() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<BrandInputs>({
    name: "",
    description: "",
    industry: "",
    values: [],
    audiences: [],
    sliders: DEFAULT_SLIDERS.map(s => ({ ...s })),
    logoStyle: "",
  });
  const [result, setResult] = useState<BrandResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [restored, setRestored] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoVariants, setLogoVariants] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [variantLoadState, setVariantLoadState] = useState<Record<number, "loading" | "loaded" | "error">>({});

  const totalSteps = 7;

  // Restore last session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("logotruffle_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.inputs) setInputs(session.inputs);
        if (session.result) {
          setResult(session.result);
          loadGoogleFonts([session.result.fonts.heading, session.result.fonts.body]);
          const savedStep = session.step ?? totalSteps;
          setStep(savedStep >= totalSteps ? totalSteps : savedStep);
        } else if (session.step) {
          setStep(Math.min(session.step, totalSteps));
        }
        if (session.logoUrl) setLogoUrl(session.logoUrl);
      }
    } catch {}
    setRestored(true);
  }, []);

  // Persist session to localStorage on changes
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem("logotruffle_session", JSON.stringify({ inputs, result, step, logoUrl }));
    } catch {}
  }, [inputs, result, step, logoUrl, restored]);

  const updateSlider = useCallback((index: number, value: number) => {
    setInputs(prev => {
      const newSliders = [...prev.sliders];
      newSliders[index] = { ...newSliders[index], value };
      return { ...prev, sliders: newSliders };
    });
  }, []);

  const toggleValue = useCallback((v: string) => {
    setInputs(prev => ({
      ...prev,
      values: prev.values.includes(v) ? prev.values.filter(x => x !== v) : [...prev.values, v],
    }));
  }, []);

  const toggleAudience = useCallback((v: string) => {
    setInputs(prev => ({
      ...prev,
      audiences: prev.audiences.includes(v) ? prev.audiences.filter(x => x !== v) : [...prev.audiences, v],
    }));
  }, []);

  const buildPrompt = (brand: BrandResult) => {
    const colorDesc = brand.colors.slice(0, 3).map(c => c.name).join(", ");
    const style = inputs.logoStyle || "geometric";
    return `${style} minimal logo for "${brand.name}" — a ${inputs.industry} brand. Style: flat design, vector, clean, professional, white background. Personality: ${brand.personality.join(", ")}. Colors inspired by: ${colorDesc}. No text in the image.`;
  };

  const buildPollinationsUrl = (brand: BrandResult, seed?: number) => {
    const s = seed ?? Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(buildPrompt(brand))}?width=512&height=512&nologo=true&seed=${s}`;
  };

  const generateVariants = async (brand: BrandResult) => {
    setLogoVariants([]);
    setSelectedVariant(null);
    setLogoUrl(null);
    setVariantLoadState({ 0: "loading", 1: "loading", 2: "loading", 3: "loading" });

    try {
      // Try API route first (OpenAI DALL-E 3)
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(brand), n: 4 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.images?.length > 0) {
          setLogoVariants(data.images);
          const loadState: Record<number, "loading" | "loaded" | "error"> = {};
          data.images.forEach((_: string, i: number) => { loadState[i] = "loading"; });
          setVariantLoadState(loadState);
          return;
        }
      }
    } catch {
      // API not available (static deploy), fall through to Pollinations
    }

    // Fallback: Pollinations
    const seeds = Array.from({ length: 4 }, () => Math.floor(Math.random() * 1000000));
    const urls = seeds.map(s => buildPollinationsUrl(brand, s));
    setLogoVariants(urls);
    setVariantLoadState({ 0: "loading", 1: "loading", 2: "loading", 3: "loading" });
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(inputs);
      loadGoogleFonts([brand.fonts.heading, brand.fonts.body]);
      setResult(brand);
      saveBrand(brand);
      generateVariants(brand);
      setGenerating(false);
      setStep(totalSteps);
    }, 1500);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(inputs);
      loadGoogleFonts([brand.fonts.heading, brand.fonts.body]);
      setResult(brand);
      saveBrand(brand);
      generateVariants(brand);
      setGenerating(false);
    }, 800);
  };

  const handleMoreLikeThis = () => {
    if (!result) return;
    generateVariants(result);
  };

  const reset = () => {
    setStep(0);
    setResult(null);
    setLogoUrl(null);
    setLogoError(false);
    setLogoVariants([]);
    setSelectedVariant(null);
    setInputs({
      name: "",
      description: "",
      industry: "",
      values: [],
      audiences: [],
      sliders: DEFAULT_SLIDERS.map(s => ({ ...s })),
      logoStyle: "",
    });
    try { localStorage.removeItem("logotruffle_session"); } catch {}
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-5 pt-10 pb-16 sm:p-6 sm:pt-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 4rem)" }}>
      {/* Header */}
      <div className="mb-6 sm:mb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            LogoTruffle
          </span>
          {" "}
          <span className="text-2xl sm:text-4xl">🍄‍🟫</span>
        </h1>
        <p className="text-neutral-400 text-sm sm:text-lg">Seek out your rare brand</p>
      </div>

      {/* Step Indicator */}
      {step < totalSteps && (
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 sm:w-10 rounded-full transition-colors ${
                i <= step ? "bg-gradient-to-r from-purple-400 to-pink-500" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Step 0: Brand Name */}
        {step === 0 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">What&apos;s your brand name?</label>
              <Input
                type="text"
                value={inputs.name}
                onChange={(e) => setInputs(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Luminary"
                className="w-full bg-neutral-900 border-neutral-800 rounded-xl px-4 py-3 text-lg h-auto focus:border-purple-500 transition-colors"
                autoFocus
              />
              <Button
                onClick={() => inputs.name.trim() && setStep(1)}
                disabled={!inputs.name.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                Next →
              </Button>
            </div>
          </StepTransition>
        )}

        {/* Step 1: Industry */}
        {step === 1 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">What industry are you in?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INDUSTRIES.map((ind) => (
                  <Button
                    key={ind}
                    variant="outline"
                    onClick={() => { setInputs(prev => ({ ...prev, industry: ind })); setStep(2); }}
                    className="px-4 py-4 h-auto rounded-xl text-sm border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800 active:scale-95 transition-all select-none"
                  >
                    {ind}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setStep(0)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Step 2: Core Values */}
        {step === 2 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">
                What are your brand&apos;s core values? <span className="text-neutral-600">(pick up to 3)</span>
              </label>
              <ChipSelector options={CORE_VALUES} selected={inputs.values} onToggle={toggleValue} max={3} />
              <Button
                onClick={() => inputs.values.length > 0 && setStep(3)}
                disabled={inputs.values.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                Next →
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Step 3: Target Audience */}
        {step === 3 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">
                Who&apos;s your target audience? <span className="text-neutral-600">(pick up to 3)</span>
              </label>
              <ChipSelector options={AUDIENCES} selected={inputs.audiences} onToggle={toggleAudience} max={3} />
              <Button
                onClick={() => inputs.audiences.length > 0 && setStep(4)}
                disabled={inputs.audiences.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                Next →
              </Button>
              <Button variant="ghost" onClick={() => setStep(2)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Step 4: Personality Sliders */}
        {step === 4 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400 mb-2">
                Position your brand personality
              </label>
              <p className="text-xs text-neutral-600 mb-4">Drag each slider to where your brand sits on the spectrum</p>
              {inputs.sliders.map((slider, i) => (
                <PersonalitySlider key={i} slider={slider} onChange={(v) => updateSlider(i, v)} />
              ))}
              <Button
                onClick={() => setStep(5)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                Next →
              </Button>
              <Button variant="ghost" onClick={() => setStep(3)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Step 5: Logo Style */}
        {step === 5 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">What style should your logo be?</label>
              <div className="grid grid-cols-2 gap-3">
                {LOGO_STYLES.map((style) => {
                  const isSelected = inputs.logoStyle === style.id;
                  return (
                    <Card
                      key={style.id}
                      onClick={() => setInputs(prev => ({ ...prev, logoStyle: style.id }))}
                      className={`cursor-pointer transition-all active:scale-95 select-none ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/20"
                          : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{style.icon === "leaf" ? <Leaf size={28} weight="duotone" className="mx-auto" /> : style.icon === "mask" ? <MaskHappy size={28} weight="duotone" className="mx-auto" /> : style.icon}</div>
                        <p className={`font-semibold text-sm ${isSelected ? "text-purple-300" : "text-neutral-200"}`}>{style.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{style.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button
                onClick={() => inputs.logoStyle && setStep(6)}
                disabled={!inputs.logoStyle}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                Next →
              </Button>
              <Button variant="ghost" onClick={() => setStep(4)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Step 6: Description + Generate */}
        {step === 6 && (
          <StepTransition>
            <div className="space-y-4">
              <label className="block text-sm text-neutral-400">Describe your brand in a sentence <span className="text-neutral-600">(optional)</span></label>
              <Textarea
                value={inputs.description}
                onChange={(e) => setInputs(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. A premium coffee subscription for remote workers who care about sustainability..."
                className="w-full bg-neutral-900 border-neutral-800 rounded-xl px-4 py-3 text-base focus:border-purple-500 transition-colors resize-none h-24"
              />

              {/* Summary */}
              <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-neutral-400 font-normal">Summary</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm space-y-2">
                  <p><span className="text-neutral-500">Name:</span> <span className="text-white">{inputs.name}</span></p>
                  <p><span className="text-neutral-500">Industry:</span> <span className="text-white">{inputs.industry}</span></p>
                  <p><span className="text-neutral-500">Values:</span> <span className="text-white">{inputs.values.join(", ")}</span></p>
                  <p><span className="text-neutral-500">Audience:</span> <span className="text-white">{inputs.audiences.join(", ")}</span></p>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
              >
                {generating ? "🍄‍🟫 Hunting for truffles..." : "Generate Brand 🍄‍🟫"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(5)} className="text-sm text-neutral-500 hover:text-neutral-300 px-2 -ml-2">← Back</Button>
            </div>
          </StepTransition>
        )}

        {/* Results */}
        {step === totalSteps && result && (
          <StepTransition>
            <div className="w-full">
              {/* ── Style Tile Hero ── */}
              <div
                className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 py-12 -mx-4 sm:-mx-6 rounded-2xl relative overflow-hidden"
                style={{ background: `linear-gradient(to bottom, ${result.colors[0]?.hex}12 0%, transparent 60%)` }}
              >
                {/* Decorative color bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                  {result.colors.map((c) => (
                    <div key={c.hex} className="flex-1" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>

                {/* Logo */}
                {logoVariants.length > 0 && (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-neutral-800/50 mb-6 shadow-2xl ring-1 ring-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoVariants[selectedVariant ?? 0]}
                      alt={`${result.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Brand Name */}
                <h2
                  className="text-3xl sm:text-4xl font-bold tracking-wide mb-2"
                  style={{ fontFamily: result.fonts.heading }}
                >
                  {result.name}
                </h2>

                {/* Tagline */}
                <p
                  className="text-neutral-400 text-base sm:text-lg italic max-w-xs mb-8"
                  style={{ fontFamily: result.fonts.body }}
                >
                  {result.tagline}
                </p>

                {/* Color Swatches */}
                <div className="flex gap-2 mb-6">
                  {result.colors.map((c) => (
                    <div
                      key={c.hex}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-neutral-800 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} — ${c.hex}`}
                      onClick={() => navigator.clipboard.writeText(c.hex)}
                    />
                  ))}
                </div>

                {/* Typography Sample */}
                <div className="flex gap-4 text-sm text-neutral-500 mb-6">
                  <span style={{ fontFamily: result.fonts.heading }} className="font-bold text-neutral-300">{result.fonts.heading}</span>
                  <span className="text-neutral-700">+</span>
                  <span style={{ fontFamily: result.fonts.body }} className="text-neutral-300">{result.fonts.body}</span>
                </div>

                {/* Personality Badges */}
                <div className="flex gap-2 flex-wrap justify-center max-w-xs">
                  {result.personality.slice(0, 4).map((trait) => (
                    <Badge key={trait} variant="outline" className="px-3 py-1 bg-neutral-900/60 border-neutral-700/50 text-neutral-300 text-xs backdrop-blur-sm">
                      {trait}
                    </Badge>
                  ))}
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-neutral-600 text-xs flex flex-col items-center gap-1 animate-pulse">
                  <span>Scroll to explore</span>
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* ── Accordion Sections ── */}
              <div className="space-y-2 mt-8">
                {/* Accordion: Colors */}
                <AccordionSection icon={<Palette size={18} weight="duotone" />} title="Colors" defaultOpen={false}>
                  <div className="flex gap-1.5 sm:gap-2 rounded-xl overflow-hidden">
                    {result.colors.map((c) => (
                      <div key={c.hex} className="flex-1 group cursor-pointer" onClick={() => navigator.clipboard.writeText(c.hex)}>
                        <div className="h-16 sm:h-20 transition-transform group-hover:scale-105" style={{ backgroundColor: c.hex }} />
                        <div className="bg-neutral-900 px-1 sm:px-2 py-1.5 sm:py-2 text-center">
                          {c.role && <p className="text-[9px] sm:text-[10px] text-purple-400 font-medium uppercase tracking-wider mb-0.5">{c.role}</p>}
                          <p className="text-[10px] sm:text-xs text-neutral-300 truncate">{c.name}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 font-mono">{c.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Tap a color to copy hex</p>
                </AccordionSection>

                {/* Accordion: Typography */}
                <AccordionSection icon={<TextAa size={18} weight="duotone" />} title="Typography" defaultOpen={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-4">
                        <p className="text-xs text-neutral-500 mb-1">Heading</p>
                        <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: result.fonts.heading }}>{result.fonts.heading}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-4">
                        <p className="text-xs text-neutral-500 mb-1">Body</p>
                        <p className="text-base sm:text-lg" style={{ fontFamily: result.fonts.body }}>{result.fonts.body}</p>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionSection>

                {/* Accordion: Personality */}
                <AccordionSection icon={<MaskHappy size={18} weight="duotone" />} title="Personality" defaultOpen={false}>
                  <div className="flex gap-2 flex-wrap">
                    {result.personality.map((trait) => (
                      <Badge key={trait} variant="outline" className="px-3 py-1.5 bg-neutral-900 border-neutral-800 text-neutral-300 text-sm">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </AccordionSection>

                {/* Accordion: Brand Spectrum */}
                <AccordionSection icon={<Sliders size={18} weight="duotone" />} title="Brand Spectrum" defaultOpen={false}>
                  <div className="space-y-4">
                    {inputs.sliders.map((s, i) => (
                      <div key={i} className="mb-4">
                        <div className="flex justify-between text-xs sm:text-sm text-neutral-400 mb-2">
                          <span>{s.label[0]}</span>
                          <span>{s.label[1]}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={s.value}
                          onChange={(e) => updateSlider(i, Number(e.target.value))}
                          style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: '12px', borderRadius: '9999px', background: '#262626', cursor: 'pointer', outline: 'none', margin: '8px 0' }}
                          className="ios-range-fix"
                        />
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        setGenerating(true);
                        setTimeout(() => {
                          const brand = generateBrand(inputs);
                          loadGoogleFonts([brand.fonts.heading, brand.fonts.body]);
                          setResult(brand);
                          saveBrand(brand);
                          generateVariants(brand);
                          setGenerating(false);
                        }, 400);
                      }}
                      disabled={generating}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2.5 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
                    >
                      {generating ? "Regenerating..." : <><Shapes size={16} weight="duotone" className="inline mr-1" />Apply Changes</>}
                    </Button>
                  </div>
                </AccordionSection>

                {/* Accordion: Logo Variants */}
                {logoVariants.length > 0 && (
                  <AccordionSection icon={<Images size={18} weight="duotone" />} title="Logo Variants" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-3">
                      {logoVariants.map((url, i) => {
                        if (variantLoadState[i] === "error") return null;
                        const isSelected = selectedVariant === i;
                        return (
                          <div
                            key={i}
                            onClick={() => { setSelectedVariant(i); setLogoUrl(url); }}
                            className={`relative rounded-xl overflow-hidden bg-neutral-800 cursor-pointer transition-all ${
                              isSelected ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/30 scale-[1.02]" : "hover:ring-1 hover:ring-neutral-600"
                            }`}
                          >
                            {variantLoadState[i] === "loading" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-10">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`${result.name} logo variant ${i + 1}`}
                              className="w-full aspect-square object-contain"
                              onLoad={() => setVariantLoadState(prev => ({ ...prev, [i]: "loaded" }))}
                              onError={() => setVariantLoadState(prev => ({ ...prev, [i]: "error" }))}
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                <Check size={14} weight="bold" className="inline mr-0.5" /> Selected
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedVariant !== null && (
                      <Button
                        onClick={handleMoreLikeThis}
                        variant="ghost"
                        className="mt-3 text-sm text-neutral-400 hover:text-white w-full"
                      >
                        <Shuffle size={16} weight="duotone" className="inline mr-1" />More Like This
                      </Button>
                    )}
                  </AccordionSection>
                )}
              </div>

              {/* ── Action Buttons ── */}
              <div className="mt-8 space-y-3 pb-8">
                <Button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold py-3 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20 border-0"
                >
                  <Globe size={18} weight="duotone" className="inline mr-1.5" />Preview as Website
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRegenerate}
                    disabled={generating}
                    variant="secondary"
                    className="flex-1 bg-neutral-800 text-white font-semibold py-3 h-auto rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    {generating ? "..." : <><ArrowsClockwise size={16} weight="duotone" className="inline mr-1" />Regenerate</>}
                  </Button>
                  <Button
                    onClick={reset}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
                  >
                    🍄‍🟫 New Brand
                  </Button>
                </div>
              </div>
            </div>
          </StepTransition>
        )}
      </div>

      {/* Website Preview Overlay */}
      {showPreview && result && (
        <WebsitePreview
          brand={result}
          industry={inputs.industry}
          onClose={() => setShowPreview(false)}
        />
      )}
    </main>
  );
}
