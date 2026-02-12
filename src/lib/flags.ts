"use client";

const STORAGE_KEY = "logotruffle_flags";

export const FLAG_DEFINITIONS: { name: string; description: string }[] = [
  { name: "shareable-link", description: "Shareable Brand Link — encode brand inputs in a URL for sharing" },
  { name: "export-kit", description: "Export Brand Kit — download the style tile hero as a PNG image" },
  { name: "brand-voice", description: "Brand Voice Generator — sample copy based on brand personality" },
  { name: "prompt-editor", description: "Logo Prompt Editor — view and edit the AI prompt for logo generation" },
  { name: "a11y-checker", description: "Palette Accessibility Checker — WCAG contrast ratio analysis" },
];

function getFlags(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getFlag(name: string): boolean {
  return getFlags()[name] === true;
}

export function setFlag(name: string, value: boolean): void {
  const flags = getFlags();
  flags[name] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}
