"use client";

import { useState, useEffect } from "react";
import { FLAG_DEFINITIONS, getFlag, setFlag } from "@/lib/flags";
import Link from "next/link";

export default function FlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    FLAG_DEFINITIONS.forEach((f) => {
      initial[f.name] = getFlag(f.name);
    });
    setFlags(initial);
    setMounted(true);
  }, []);

  const toggle = (name: string) => {
    const newVal = !flags[name];
    setFlag(name, newVal);
    setFlags((prev) => ({ ...prev, [name]: newVal }));
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 sm:p-10">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-6 inline-block">
          ← Back to LogoTruffle
        </Link>
        <h1 className="text-2xl font-bold mb-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Feature Flags
          </span>
        </h1>
        <p className="text-neutral-500 text-sm mb-8">Toggle experimental features on and off.</p>

        <div className="space-y-3">
          {FLAG_DEFINITIONS.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
            >
              <div className="pr-4">
                <p className="text-sm font-medium text-neutral-200 font-mono">{f.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{f.description}</p>
              </div>
              <button
                onClick={() => toggle(f.name)}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                  flags[f.name] ? "bg-purple-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                    flags[f.name] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
