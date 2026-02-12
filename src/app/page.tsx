"use client";

import { useState } from "react";

interface BrandResult {
  name: string;
  tagline: string;
  colors: { name: string; hex: string }[];
  fonts: { heading: string; body: string };
  personality: string[];
  logoText: string;
  logoIcon: string;
}

const INDUSTRIES = [
  "Technology", "Food & Beverage", "Health & Wellness", "Fashion", "Finance",
  "Education", "Real Estate", "Travel", "Entertainment", "Non-Profit",
  "E-Commerce", "Creative Agency", "SaaS", "Local Business", "Other"
];

const VIBES = [
  "Minimal & Clean", "Bold & Energetic", "Luxurious & Premium", "Playful & Fun",
  "Earthy & Organic", "Techy & Modern", "Classic & Timeless", "Edgy & Disruptive"
];

const PALETTES: Record<string, { name: string; hex: string }[][]> = {
  "Minimal & Clean": [
    [{ name: "Ivory", hex: "#FFFFF0" }, { name: "Charcoal", hex: "#36454F" }, { name: "Silver", hex: "#C0C0C0" }, { name: "Slate", hex: "#708090" }, { name: "Snow", hex: "#FFFAFA" }],
    [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111111" }, { name: "Light Gray", hex: "#D4D4D4" }, { name: "Dark Gray", hex: "#404040" }, { name: "Accent", hex: "#0EA5E9" }],
  ],
  "Bold & Energetic": [
    [{ name: "Electric Red", hex: "#FF2D2D" }, { name: "Bright Yellow", hex: "#FFD600" }, { name: "Deep Black", hex: "#0A0A0A" }, { name: "White", hex: "#FFFFFF" }, { name: "Hot Pink", hex: "#FF69B4" }],
    [{ name: "Neon Orange", hex: "#FF6B00" }, { name: "Electric Blue", hex: "#0066FF" }, { name: "Dark Navy", hex: "#0A1628" }, { name: "White", hex: "#FAFAFA" }, { name: "Lime", hex: "#84CC16" }],
  ],
  "Luxurious & Premium": [
    [{ name: "Gold", hex: "#D4AF37" }, { name: "Deep Black", hex: "#0D0D0D" }, { name: "Cream", hex: "#FFFDD0" }, { name: "Burgundy", hex: "#800020" }, { name: "Champagne", hex: "#F7E7CE" }],
    [{ name: "Rose Gold", hex: "#B76E79" }, { name: "Midnight", hex: "#191970" }, { name: "Pearl", hex: "#F0EAD6" }, { name: "Onyx", hex: "#353935" }, { name: "Ivory", hex: "#FFFFF0" }],
  ],
  "Playful & Fun": [
    [{ name: "Coral", hex: "#FF7F50" }, { name: "Turquoise", hex: "#40E0D0" }, { name: "Sunshine", hex: "#FFD700" }, { name: "Lavender", hex: "#E6E6FA" }, { name: "Mint", hex: "#98FF98" }],
    [{ name: "Bubblegum", hex: "#FF69B4" }, { name: "Sky Blue", hex: "#87CEEB" }, { name: "Lemon", hex: "#FFF44F" }, { name: "Peach", hex: "#FFDAB9" }, { name: "Lilac", hex: "#C8A2C8" }],
  ],
  "Earthy & Organic": [
    [{ name: "Terracotta", hex: "#CC5533" }, { name: "Sage", hex: "#9CAF88" }, { name: "Cream", hex: "#F5F0E1" }, { name: "Walnut", hex: "#5C4033" }, { name: "Sand", hex: "#D2B48C" }],
    [{ name: "Olive", hex: "#808000" }, { name: "Clay", hex: "#B66A50" }, { name: "Linen", hex: "#FAF0E6" }, { name: "Moss", hex: "#4A5D23" }, { name: "Wheat", hex: "#F5DEB3" }],
  ],
  "Techy & Modern": [
    [{ name: "Cyber Blue", hex: "#00D4FF" }, { name: "Dark Matter", hex: "#0A0E17" }, { name: "Neon Green", hex: "#39FF14" }, { name: "Steel", hex: "#71797E" }, { name: "White", hex: "#F8F8F8" }],
    [{ name: "Electric Purple", hex: "#BF00FF" }, { name: "Midnight", hex: "#0F0F1A" }, { name: "Cyan", hex: "#00FFFF" }, { name: "Graphite", hex: "#383838" }, { name: "Ice", hex: "#E0F7FA" }],
  ],
  "Classic & Timeless": [
    [{ name: "Navy", hex: "#001F3F" }, { name: "Ivory", hex: "#FFFFF0" }, { name: "Burgundy", hex: "#722F37" }, { name: "Gold", hex: "#CFB53B" }, { name: "Charcoal", hex: "#36454F" }],
    [{ name: "Forest Green", hex: "#228B22" }, { name: "Cream", hex: "#FFFDD0" }, { name: "Mahogany", hex: "#C04000" }, { name: "Brass", hex: "#B5A642" }, { name: "Slate", hex: "#708090" }],
  ],
  "Edgy & Disruptive": [
    [{ name: "Acid Green", hex: "#B0BF1A" }, { name: "Void Black", hex: "#050505" }, { name: "Blood Red", hex: "#880000" }, { name: "Chrome", hex: "#DBE2E9" }, { name: "Toxic Yellow", hex: "#E8E800" }],
    [{ name: "Hot Magenta", hex: "#FF00FF" }, { name: "Abyss", hex: "#080808" }, { name: "Electric Lime", hex: "#CCFF00" }, { name: "Gunmetal", hex: "#2C3539" }, { name: "White", hex: "#FFFFFF" }],
  ],
};

const FONT_PAIRS: Record<string, { heading: string; body: string }[]> = {
  "Minimal & Clean": [{ heading: "Inter", body: "Inter" }, { heading: "Helvetica Neue", body: "Georgia" }],
  "Bold & Energetic": [{ heading: "Impact", body: "Arial" }, { heading: "Bebas Neue", body: "Open Sans" }],
  "Luxurious & Premium": [{ heading: "Playfair Display", body: "Lato" }, { heading: "Didot", body: "Garamond" }],
  "Playful & Fun": [{ heading: "Fredoka One", body: "Nunito" }, { heading: "Baloo 2", body: "Quicksand" }],
  "Earthy & Organic": [{ heading: "Merriweather", body: "Source Sans Pro" }, { heading: "Libre Baskerville", body: "Cabin" }],
  "Techy & Modern": [{ heading: "JetBrains Mono", body: "Inter" }, { heading: "Space Grotesk", body: "IBM Plex Sans" }],
  "Classic & Timeless": [{ heading: "Garamond", body: "Caslon" }, { heading: "Baskerville", body: "Palatino" }],
  "Edgy & Disruptive": [{ heading: "Anton", body: "Roboto Mono" }, { heading: "Oswald", body: "Source Code Pro" }],
};

const ICONS = ["◆", "✦", "⬡", "◎", "△", "⬢", "◈", "▲", "●", "✧", "⟁", "⊕", "⊗", "⬣", "◉"];

const PERSONALITIES: Record<string, string[][]> = {
  "Minimal & Clean": [["Refined", "Intentional", "Calm", "Precise"], ["Elegant", "Focused", "Quiet", "Thoughtful"]],
  "Bold & Energetic": [["Fearless", "Loud", "Dynamic", "Unstoppable"], ["Fierce", "Vibrant", "Electric", "Relentless"]],
  "Luxurious & Premium": [["Sophisticated", "Exclusive", "Curated", "Opulent"], ["Refined", "Prestigious", "Timeless", "Elegant"]],
  "Playful & Fun": [["Joyful", "Witty", "Friendly", "Spontaneous"], ["Cheerful", "Quirky", "Warm", "Adventurous"]],
  "Earthy & Organic": [["Grounded", "Authentic", "Nurturing", "Sustainable"], ["Wholesome", "Natural", "Honest", "Rooted"]],
  "Techy & Modern": [["Innovative", "Sharp", "Forward", "Disruptive"], ["Smart", "Agile", "Precise", "Cutting-edge"]],
  "Classic & Timeless": [["Trustworthy", "Dignified", "Enduring", "Authoritative"], ["Noble", "Established", "Reliable", "Respected"]],
  "Edgy & Disruptive": [["Rebellious", "Raw", "Provocative", "Unapologetic"], ["Defiant", "Gritty", "Unconventional", "Bold"]],
};

function generateBrand(name: string, industry: string, vibe: string, description: string): BrandResult {
  const palettes = PALETTES[vibe] || PALETTES["Minimal & Clean"];
  const colors = palettes[Math.floor(Math.random() * palettes.length)];
  const fontPairs = FONT_PAIRS[vibe] || FONT_PAIRS["Minimal & Clean"];
  const fonts = fontPairs[Math.floor(Math.random() * fontPairs.length)];
  const personalityOptions = PERSONALITIES[vibe] || PERSONALITIES["Minimal & Clean"];
  const personality = personalityOptions[Math.floor(Math.random() * personalityOptions.length)];
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];

  const taglines: Record<string, string[]> = {
    "Technology": ["Built for tomorrow.", "Code meets craft.", "Engineering the future."],
    "Food & Beverage": ["Taste the difference.", "Crafted with care.", "From our kitchen to yours."],
    "Health & Wellness": ["Your best self, daily.", "Wellness redefined.", "Thrive naturally."],
    "Fashion": ["Wear your story.", "Style without compromise.", "Designed to move."],
    "Finance": ["Your money, your terms.", "Wealth made simple.", "Smart money moves."],
    "Education": ["Learn without limits.", "Knowledge, amplified.", "Unlock your potential."],
    "Real Estate": ["Find your place.", "Spaces that inspire.", "Home starts here."],
    "Creative Agency": ["Ideas that move.", "Create fearlessly.", "Vision to reality."],
    "SaaS": ["Simplify everything.", "Work smarter.", "Scale with confidence."],
    "Local Business": ["Community first.", "Your neighbor, your partner.", "Local roots, real results."],
  };

  const industryTaglines = taglines[industry] || ["Make your mark.", "Something different.", "Built to last."];
  const tagline = industryTaglines[Math.floor(Math.random() * industryTaglines.length)];

  return {
    name,
    tagline,
    colors,
    fonts,
    personality,
    logoText: name.toUpperCase(),
    logoIcon: icon,
  };
}

function saveBrand(brand: BrandResult) {
  const saved = JSON.parse(localStorage.getItem("brandforge_brands") || "[]");
  saved.push({ ...brand, createdAt: new Date().toISOString() });
  localStorage.setItem("brandforge_brands", JSON.stringify(saved));
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [vibe, setVibe] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<BrandResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(name, industry, vibe, description);
      setResult(brand);
      saveBrand(brand);
      setGenerating(false);
      setStep(4);
    }, 1500);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const brand = generateBrand(name, industry, vibe, description);
      setResult(brand);
      saveBrand(brand);
      setGenerating(false);
    }, 800);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            BrandForge
          </span>
        </h1>
        <p className="text-neutral-400 text-lg">Generate a complete brand identity in seconds</p>
      </div>

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex gap-2 mb-8">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-colors ${
                s <= step ? "bg-gradient-to-r from-purple-400 to-pink-500" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>
      )}

      {/* Steps */}
      <div className="w-full max-w-lg">
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm text-neutral-400 mb-1">What&apos;s your brand name?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luminary"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
            <button
              onClick={() => name.trim() && setStep(1)}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              Next →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm text-neutral-400 mb-1">What industry?</label>
            <div className="grid grid-cols-3 gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => { setIndustry(ind); setStep(2); }}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    industry === ind
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="text-sm text-neutral-500 hover:text-neutral-300">← Back</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm text-neutral-400 mb-1">What vibe?</label>
            <div className="grid grid-cols-2 gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => { setVibe(v); setStep(3); }}
                  className={`px-4 py-3 rounded-lg text-sm border transition-colors ${
                    vibe === v
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-300">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm text-neutral-400 mb-1">Describe your brand in a sentence (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A premium coffee subscription for remote workers..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-purple-500 transition-colors resize-none h-24"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "✨ Generating..." : "Generate Brand ✨"}
            </button>
            <button onClick={() => setStep(2)} className="text-sm text-neutral-500 hover:text-neutral-300">← Back</button>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-8 animate-fade-in max-w-2xl">
            {/* Logo Preview */}
            <div className="text-center p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50">
              <div className="text-5xl mb-2">{result.logoIcon}</div>
              <h2 className="text-3xl font-bold tracking-widest" style={{ fontFamily: result.fonts.heading }}>
                {result.logoText}
              </h2>
              <p className="text-neutral-400 mt-2 italic" style={{ fontFamily: result.fonts.body }}>
                {result.tagline}
              </p>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Color Palette</h3>
              <div className="flex gap-2 rounded-xl overflow-hidden">
                {result.colors.map((c) => (
                  <div key={c.hex} className="flex-1 group cursor-pointer" onClick={() => navigator.clipboard.writeText(c.hex)}>
                    <div className="h-20 transition-transform group-hover:scale-105" style={{ backgroundColor: c.hex }} />
                    <div className="bg-neutral-900 px-2 py-2 text-center">
                      <p className="text-xs text-neutral-300">{c.name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-600 mt-1">Click a color to copy hex</p>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Typography</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-1">Heading</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: result.fonts.heading }}>{result.fonts.heading}</p>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-1">Body</p>
                  <p className="text-lg" style={{ fontFamily: result.fonts.body }}>{result.fonts.body}</p>
                </div>
              </div>
            </div>

            {/* Personality */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-3 uppercase tracking-wider">Brand Personality</h3>
              <div className="flex gap-2 flex-wrap">
                {result.personality.map((trait) => (
                  <span key={trait} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-neutral-300">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="flex-1 bg-neutral-800 text-white font-semibold py-3 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {generating ? "Regenerating..." : "🔄 Regenerate"}
              </button>
              <button
                onClick={() => { setStep(0); setResult(null); setName(""); setIndustry(""); setVibe(""); setDescription(""); }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                ✨ New Brand
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
