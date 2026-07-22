'use client';
/**
 * ColorPickerField — A premium inline color picker like Google's colour picker
 * ────────────────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   value       string        (hex color e.g. "#2563EB")
 *   onChange    (hex) => void
 */
import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

// Hex to RGB utility
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

// RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const QUICK_SWATCHES = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#EC4899', '#F43F5E', '#0F172A',
  '#334155', '#64748B', '#FFFFFF', '#000000',
];

export default function ColorPickerField({ label, value = '#4F46E5', onChange }) {
  const [hexInput, setHexInput] = useState(value);

  // Sync if value changes from outside
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleHexInput = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  };

  const handlePickerChange = (hex) => {
    setHexInput(hex);
    onChange(hex);
  };

  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#4F46E5';
  const rgb = hexToRgb(safeHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold text-slate-700 block">{label}</label>}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Google-style gradient canvas via react-colorful */}
        <div className="[&_.react-colorful]:w-full [&_.react-colorful]:rounded-none [&_.react-colorful]:border-none [&_.react-colorful__saturation]:rounded-none [&_.react-colorful__saturation]:h-44 [&_.react-colorful__hue]:h-5 [&_.react-colorful__hue]:mx-3 [&_.react-colorful__hue]:my-3 [&_.react-colorful__hue]:rounded-full [&_.react-colorful__pointer]:w-5 [&_.react-colorful__pointer]:h-5 [&_.react-colorful__pointer]:border-2 [&_.react-colorful__pointer]:border-white [&_.react-colorful__pointer]:shadow-md">
          <HexColorPicker color={safeHex} onChange={handlePickerChange} />
        </div>

        {/* HEX Input Row */}
        <div className="px-4 pb-3 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl border-2 border-white shadow-md shrink-0"
              style={{ backgroundColor: safeHex }}
            />
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-wider">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInput}
                maxLength={7}
                className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Color Stats row — RGB / HSL */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">RGB</p>
              <p className="text-[11px] font-bold text-slate-700">{rgb.r}, {rgb.g}, {rgb.b}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">HSL</p>
              <p className="text-[11px] font-bold text-slate-700">{hsl.h}°, {hsl.s}%, {hsl.l}%</p>
            </div>
          </div>

          {/* Quick Swatches */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Quick Swatches</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SWATCHES.map(c => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => handlePickerChange(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-125 ${
                    safeHex.toLowerCase() === c.toLowerCase()
                      ? 'border-slate-800 scale-125 shadow-md'
                      : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
