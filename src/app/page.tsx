"use client";

import { useState, useCallback } from "react";

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
}

interface BrandResult {
  name: string;
  tagline: string;
  colors: { name: string; hex: string }[];
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

// GV Brand Sprint personality sliders
const DEFAULT_SLIDERS: SliderValue[] = [
  { label: ["Friend", "Authority"], value: 50 },
  { label: ["Young & Innovative", "Mature & Classic"], value: 50 },
  { label: ["Playful", "Serious"], value: 50 },
  { label: ["Mass Market", "Elite"], value: 50 },
  { label: ["Casual", "Formal"], value: 50 },
  { label: ["Loud & Bold", "Quiet & Subtle"], value: 50 },
];

/* ───────── Brand Generation Logic ───────── */

function sliderToWeight(value: number): "low" | "mid" | "high" {
  if (value < 35) return "low";
  if (value > 65) return "high";
  return "mid";
}

const COLOR_POOLS: Record<string, { name: string; hex: string }[]> = {
  warmBold: [
    { name: "Flame", hex: "#E25822" }, { name: "Sunset", hex: "#FF6B35" },
    { name: "Marigold", hex: "#F7B32B" }, { name: "Crimson", hex: "#DC143C" },
    { name: "Coral", hex: "#FF6F61" }, { name: "Amber", hex: "#FFBF00" },
  ],
  coolCalm: [
    { name: "Ocean", hex: "#006994" }, { name: "Sage", hex: "#9CAF88" },
    { name: "Mist", hex: "#90AFC5" }, { name: "Slate", hex: "#708090" },
    { name: "Frost", hex: "#E1E8ED" }, { name: "Steel", hex: "#4682B4" },
  ],
  premiumDark: [
    { name: "Onyx", hex: "#353935" }, { name: "Midnight", hex: "#191970" },
    { name: "Burgundy", hex: "#800020" }, { name: "Gold", hex: "#D4AF37" },
    { name: "Champagne", hex: "#F7E7CE" }, { name: "Ivory", hex: "#FFFFF0" },
  ],
  playfulBright: [
    { name: "Electric Purple", hex: "#BF00FF" }, { name: "Hot Pink", hex: "#FF69B4" },
    { name: "Turquoise", hex: "#40E0D0" }, { name: "Lime", hex: "#84CC16" },
    { name: "Sunshine", hex: "#FFD700" }, { name: "Sky", hex: "#87CEEB" },
  ],
  earthyNatural: [
    { name: "Terracotta", hex: "#CC5533" }, { name: "Olive", hex: "#808000" },
    { name: "Walnut", hex: "#5C4033" }, { name: "Sand", hex: "#D2B48C" },
    { name: "Linen", hex: "#FAF0E6" }, { name: "Moss", hex: "#4A5D23" },
  ],
  techModern: [
    { name: "Cyber Blue", hex: "#00D4FF" }, { name: "Neon Green", hex: "#39FF14" },
    { name: "Dark Matter", hex: "#0A0E17" }, { name: "Graphite", hex: "#383838" },
    { name: "Ice", hex: "#E0F7FA" }, { name: "Electric", hex: "#7DF9FF" },
  ],
  neutralClean: [
    { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111111" },
    { name: "Light Gray", hex: "#D4D4D4" }, { name: "Charcoal", hex: "#36454F" },
    { name: "Snow", hex: "#FFFAFA" }, { name: "Accent Blue", hex: "#0EA5E9" },
  ],
};

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

const ICONS = ["◆", "✦", "⬡", "◎", "△", "⬢", "◈", "▲", "●", "✧", "⟁", "⊕", "◉", "⬣", "∞", "⊙"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateBrand(inputs: BrandInputs): BrandResult {
  const s = inputs.sliders;
  const friendAuth = s[0].value;
  const youngMature = s[1].value;
  const playfulSerious = s[2].value;
  const massElite = s[3].value;
  const casualFormal = s[4].value;
  const loudQuiet = s[5].value;

  // Determine color pool based on slider positions
  let colorPool: { name: string; hex: string }[];
  if (massElite > 65 && casualFormal > 60) {
    colorPool = COLOR_POOLS.premiumDark;
  } else if (playfulSerious < 35 && youngMature < 40) {
    colorPool = COLOR_POOLS.playfulBright;
  } else if (loudQuiet < 35 && playfulSerious < 50) {
    colorPool = COLOR_POOLS.warmBold;
  } else if (loudQuiet > 65 && casualFormal > 50) {
    colorPool = COLOR_POOLS.coolCalm;
  } else if (youngMature > 65 && friendAuth > 60) {
    colorPool = COLOR_POOLS.neutralClean;
  } else if (friendAuth < 40 && youngMature < 45) {
    colorPool = COLOR_POOLS.techModern;
  } else {
    const pools = Object.values(COLOR_POOLS);
    colorPool = pick(pools);
  }
  
  const colors = pickN(colorPool, 5);

  // Font selection based on personality
  let fontVibe: string;
  if (massElite > 65) fontVibe = "premium";
  else if (playfulSerious < 35) fontVibe = "playful";
  else if (casualFormal > 65) fontVibe = "elegant";
  else if (youngMature < 35) fontVibe = "tech";
  else if (loudQuiet < 35) fontVibe = "bold";
  else if (youngMature > 65) fontVibe = "classic";
  else fontVibe = "clean";

  const matchingFonts = FONT_PAIRS.filter(f => f.vibe === fontVibe);
  const fonts = matchingFonts.length > 0 ? pick(matchingFonts) : pick(FONT_PAIRS);

  // Generate personality traits from sliders + values
  const traits: string[] = [];
  if (friendAuth < 40) traits.push("Approachable");
  if (friendAuth > 60) traits.push("Authoritative");
  if (youngMature < 40) traits.push("Innovative");
  if (youngMature > 60) traits.push("Established");
  if (playfulSerious < 40) traits.push("Playful");
  if (playfulSerious > 60) traits.push("Serious");
  if (massElite > 60) traits.push("Premium");
  if (massElite < 40) traits.push("Accessible");
  if (loudQuiet < 40) traits.push("Bold");
  if (loudQuiet > 60) traits.push("Refined");
  
  // Add from selected values
  traits.push(...inputs.values.slice(0, 4 - Math.min(traits.length, 2)));
  const personality = traits.slice(0, 5);

  // Tagline generation based on values and personality
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
  ];

  return {
    name: inputs.name,
    tagline: pick(taglineTemplates),
    colors,
    fonts: { heading: fonts.heading, body: fonts.body },
    personality,
    logoText: inputs.name.toUpperCase(),
    logoIcon: pick(ICONS),
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

function Slider({ slider, onChange }: { slider: SliderValue; onChange: (v: number) => void }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs sm:text-sm text-neutral-400 mb-2">
        <span>{slider.label[0]}</span>
        <span>{slider.label[1]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={slider.value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500 touch-pan-y"
        style={{ WebkitAppearance: "none", padding: "8px 0" }}
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
        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onToggle(opt)}
            disabled={isDisabled}
            className={`px-4 py-3 rounded-xl text-sm border transition-all active:scale-95 select-none ${
              isSelected
                ? "border-purple-500 bg-purple-500/20 text-purple-300 shadow-sm shadow-purple-500/20"
                : isDisabled
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-600 cursor-not-allowed"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 active:bg-neutral-800"
            }`}
          >
            {opt}
          </button>
        );
      })}
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
  });
  const [result, setResult] = useState<BrandResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const totalSteps = 6;

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

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(inputs);
      setResult(brand);
      saveBrand(brand);
      setGenerating(false);
      setStep(totalSteps);
    }, 1500);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(inputs);
      setResult(brand);
      saveBrand(brand);
      setGenerating(false);
    }, 800);
  };

  const reset = () => {
    setStep(0);
    setResult(null);
    setInputs({
      name: "",
      description: "",
      industry: "",
      values: [],
      audiences: [],
      sliders: DEFAULT_SLIDERS.map(s => ({ ...s })),
    });
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
          <span className="text-2xl sm:text-4xl">🍫</span>
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
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">What&apos;s your brand name?</label>
            <input
              type="text"
              value={inputs.name}
              onChange={(e) => setInputs(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Luminary"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
            <button
              onClick={() => inputs.name.trim() && setStep(1)}
              disabled={!inputs.name.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 1: Industry */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">What industry are you in?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => { setInputs(prev => ({ ...prev, industry: ind })); setStep(2); }}
                  className="px-4 py-4 rounded-xl text-sm border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 active:bg-neutral-800 active:scale-95 transition-all select-none"
                >
                  {ind}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="text-sm text-neutral-500 hover:text-neutral-300 py-3 px-2 -ml-2 active:text-neutral-100 select-none">← Back</button>
          </div>
        )}

        {/* Step 2: Core Values (pick up to 3) */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">
              What are your brand&apos;s core values? <span className="text-neutral-600">(pick up to 3)</span>
            </label>
            <ChipSelector options={CORE_VALUES} selected={inputs.values} onToggle={toggleValue} max={3} />
            <button
              onClick={() => inputs.values.length > 0 && setStep(3)}
              disabled={inputs.values.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Next →
            </button>
            <button onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-300 py-3 px-2 -ml-2 active:text-neutral-100 select-none">← Back</button>
          </div>
        )}

        {/* Step 3: Target Audience (pick up to 3) */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">
              Who&apos;s your target audience? <span className="text-neutral-600">(pick up to 3)</span>
            </label>
            <ChipSelector options={AUDIENCES} selected={inputs.audiences} onToggle={toggleAudience} max={3} />
            <button
              onClick={() => inputs.audiences.length > 0 && setStep(4)}
              disabled={inputs.audiences.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Next →
            </button>
            <button onClick={() => setStep(2)} className="text-sm text-neutral-500 hover:text-neutral-300 py-3 px-2 -ml-2 active:text-neutral-100 select-none">← Back</button>
          </div>
        )}

        {/* Step 4: Personality Sliders (GV Brand Sprint) */}
        {step === 4 && (
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400 mb-2">
              Position your brand personality
            </label>
            <p className="text-xs text-neutral-600 mb-4">Drag each slider to where your brand sits on the spectrum</p>
            {inputs.sliders.map((slider, i) => (
              <Slider key={i} slider={slider} onChange={(v) => updateSlider(i, v)} />
            ))}
            <button
              onClick={() => setStep(5)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Next →
            </button>
            <button onClick={() => setStep(3)} className="text-sm text-neutral-500 hover:text-neutral-300 py-3 px-2 -ml-2 active:text-neutral-100 select-none">← Back</button>
          </div>
        )}

        {/* Step 5: Description + Generate */}
        {step === 5 && (
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">Describe your brand in a sentence <span className="text-neutral-600">(optional)</span></label>
            <textarea
              value={inputs.description}
              onChange={(e) => setInputs(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. A premium coffee subscription for remote workers who care about sustainability..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-purple-500 transition-colors resize-none h-24"
            />

            {/* Summary */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-sm space-y-2">
              <p className="text-neutral-400">Summary</p>
              <p><span className="text-neutral-500">Name:</span> <span className="text-white">{inputs.name}</span></p>
              <p><span className="text-neutral-500">Industry:</span> <span className="text-white">{inputs.industry}</span></p>
              <p><span className="text-neutral-500">Values:</span> <span className="text-white">{inputs.values.join(", ")}</span></p>
              <p><span className="text-neutral-500">Audience:</span> <span className="text-white">{inputs.audiences.join(", ")}</span></p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "🍫 Hunting for truffles..." : "Generate Brand 🍫"}
            </button>
            <button onClick={() => setStep(4)} className="text-sm text-neutral-500 hover:text-neutral-300 py-3 px-2 -ml-2 active:text-neutral-100 select-none">← Back</button>
          </div>
        )}

        {/* Results */}
        {step === totalSteps && result && (
          <div className="space-y-6 w-full">
            {/* Logo Preview */}
            <div className="text-center p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50">
              <div className="text-4xl sm:text-5xl mb-2">{result.logoIcon}</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-widest" style={{ fontFamily: result.fonts.heading }}>
                {result.logoText}
              </h2>
              <p className="text-neutral-400 mt-2 italic" style={{ fontFamily: result.fonts.body }}>
                {result.tagline}
              </p>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Color Palette</h3>
              <div className="flex gap-1.5 sm:gap-2 rounded-xl overflow-hidden">
                {result.colors.map((c) => (
                  <div key={c.hex} className="flex-1 group cursor-pointer" onClick={() => navigator.clipboard.writeText(c.hex)}>
                    <div className="h-16 sm:h-20 transition-transform group-hover:scale-105" style={{ backgroundColor: c.hex }} />
                    <div className="bg-neutral-900 px-1 sm:px-2 py-1.5 sm:py-2 text-center">
                      <p className="text-[10px] sm:text-xs text-neutral-300 truncate">{c.name}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500 font-mono">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-600 mt-1">Tap a color to copy hex</p>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Typography</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-1">Heading</p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: result.fonts.heading }}>{result.fonts.heading}</p>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-1">Body</p>
                  <p className="text-base sm:text-lg" style={{ fontFamily: result.fonts.body }}>{result.fonts.body}</p>
                </div>
              </div>
            </div>

            {/* Personality */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Brand Personality</h3>
              <div className="flex gap-2 flex-wrap">
                {result.personality.map((trait) => (
                  <span key={trait} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-neutral-300">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality Spectrum */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Brand Spectrum</h3>
              <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 space-y-3">
                {result.sliderSnapshot.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] sm:text-xs text-neutral-500 mb-1">
                      <span>{s.label[0]}</span>
                      <span>{s.label[1]}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"
                        style={{ left: `calc(${s.value}% - 6px)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-8">
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="flex-1 bg-neutral-800 text-white font-semibold py-3 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {generating ? "..." : "🔄 Regenerate"}
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                🍫 New Brand
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
