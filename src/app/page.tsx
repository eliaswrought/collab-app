"use client";

import { useState, useCallback, useEffect } from "react";
import WebsitePreview from "@/components/WebsitePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

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
  { id: "organic", name: "Organic", desc: "Flowing forms, natural curves, hand-crafted feel", icon: "🌿" },
  { id: "typographic", name: "Typographic", desc: "The name IS the logo, creative letterforms", icon: "Aa" },
  { id: "abstract", name: "Abstract", desc: "Conceptual marks, unique symbols", icon: "✦" },
  { id: "monogram", name: "Monogram", desc: "Initials or letter-based mark", icon: "M" },
  { id: "mascot", name: "Mascot", desc: "Character or icon-based", icon: "🎭" },
];

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

const DEFAULT_SLIDERS: SliderValue[] = [
  { label: ["Friend", "Authority"], value: 50 },
  { label: ["Young & Innovative", "Mature & Classic"], value: 50 },
  { label: ["Playful", "Serious"], value: 50 },
  { label: ["Mass Market", "Elite"], value: 50 },
  { label: ["Casual", "Formal"], value: 50 },
  { label: ["Loud & Bold", "Quiet & Subtle"], value: 50 },
];

/* ───────── Brand Generation Logic ───────── */

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
  
  traits.push(...inputs.values.slice(0, 4 - Math.min(traits.length, 2)));
  const personality = traits.slice(0, 5);

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
                        <div className="text-2xl mb-2">{style.icon}</div>
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
            <div className="space-y-6 w-full">
              {/* AI Generated Logo Variants */}
              {logoVariants.length > 0 && (
                <Card className="bg-neutral-900/50 border-neutral-800 text-center">
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Choose Your Logo</p>
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
                                ✓ Selected
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
                        className="mt-3 text-sm text-neutral-400 hover:text-white"
                      >
                        🎲 More Like This
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Brand Name & Tagline */}
              <div className="text-center mt-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-widest" style={{ fontFamily: result.fonts.heading }}>
                  {result.name}
                </h2>
                <p className="text-neutral-400 mt-1 italic" style={{ fontFamily: result.fonts.body }}>
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
              </div>

              {/* Personality */}
              <div>
                <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Brand Personality</h3>
                <div className="flex gap-2 flex-wrap">
                  {result.personality.map((trait) => (
                    <Badge key={trait} variant="outline" className="px-3 py-1.5 bg-neutral-900 border-neutral-800 text-neutral-300 text-sm">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Personality Spectrum */}
              <div>
                <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Brand Spectrum</h3>
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-4 space-y-3">
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
                  </CardContent>
                </Card>
              </div>

              {/* Preview Website */}
              <Button
                onClick={() => setShowPreview(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold py-3 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20 border-0"
              >
                🌐 Preview as Website
              </Button>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-8">
                <Button
                  onClick={handleRegenerate}
                  disabled={generating}
                  variant="secondary"
                  className="flex-1 bg-neutral-800 text-white font-semibold py-3 h-auto rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  {generating ? "..." : "🔄 Regenerate"}
                </Button>
                <Button
                  onClick={reset}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 h-auto rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20 border-0"
                >
                  🍄‍🟫 New Brand
                </Button>
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
