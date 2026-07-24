/** @type {import('tailwindcss').Config} */

import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        emerald: {
          "primary": "#10b981",          // Emerald Accent (10%)
          "primary-content": "#ffffff",  // White text on primary
          "secondary": "#3b82f6",        // Blue Accent
          "secondary-content": "#ffffff",
          "accent": "#0f766e",           // Dark Teal
          "neutral": "#1f2937",          // Dark Gray
          "base-100": "#ffffff",         // Background 60%
          "base-200": "#f9fafb",         // Cards/Panels 60%
          "base-300": "#f3f4f6",         // Inputs/Borders 60%
          "base-content": "#1f2937",     // Text Content 30%
        },
        night: {
          "primary": "#06b6d4",          // Cyan Accent (10%)
          "primary-content": "#083344",
          "secondary": "#2563eb",        // Blue Accent
          "secondary-content": "#ffffff",
          "accent": "#38bdf8",
          "neutral": "#1e293b",
          "base-100": "#0b0f19",         // Background 60%
          "base-200": "#111827",         // Cards/Panels 60%
          "base-300": "#1f2937",         // Inputs/Borders 60%
          "base-content": "#f3f4f6",     // Text Content 30%
        },
        dracula: {
          "primary": "#8b5cf6",          // Purple Accent (10%)
          "primary-content": "#ffffff",
          "secondary": "#ec4899",        // Neon Pink Accent
          "secondary-content": "#ffffff",
          "accent": "#a78bfa",
          "neutral": "#2d1b4e",
          "base-100": "#120a21",         // Background 60%
          "base-200": "#1a0f30",         // Cards/Panels 60%
          "base-300": "#2d1b4e",         // Inputs/Borders 60%
          "base-content": "#f5f3ff",     // Text Content 30%
        },
        bumblebee: {
          "primary": "#d97706",          // Amber Accent (10%)
          "primary-content": "#ffffff",
          "secondary": "#b45309",        // Brown Gold Accent
          "secondary-content": "#ffffff",
          "accent": "#f59e0b",
          "neutral": "#2d2a26",
          "base-100": "#fdfbf7",         // Background 60%
          "base-200": "#f9f6ee",         // Cards/Panels 60%
          "base-300": "#f1ebe0",         // Inputs/Borders 60%
          "base-content": "#2d2a26",     // Text Content 30%
        },
        sunset: {
          "primary": "#f43f5e",          // Rose Red Accent (10%)
          "primary-content": "#ffffff",
          "secondary": "#fb923c",        // Peach Accent
          "secondary-content": "#ffffff",
          "accent": "#fda4af",
          "neutral": "#1e202e",
          "base-100": "#090a0f",         // Background 60%
          "base-200": "#12131a",         // Cards/Panels 60%
          "base-300": "#1e202e",         // Inputs/Borders 60%
          "base-content": "#fcefe9",     // Text Content 30%
        },
        dark: {
          "primary": "#6366f1",          // Indigo Accent (10%)
          "primary-content": "#ffffff",
          "secondary": "#475569",        // Slate Accent
          "secondary-content": "#ffffff",
          "accent": "#818cf8",
          "neutral": "#262626",
          "base-100": "#121212",         // Background 60%
          "base-200": "#1a1a1a",         // Cards/Panels 60%
          "base-300": "#262626",         // Inputs/Borders 60%
          "base-content": "#e5e5e5",     // Text Content 30%
        },
        light: {
          "primary": "#0071e3",          // Apple Blue Accent (10%)
          "primary-content": "#ffffff",
          "secondary": "#8e8e93",        // Gray Accent
          "secondary-content": "#ffffff",
          "accent": "#3399ff",
          "neutral": "#e5e5ea",
          "base-100": "#ffffff",         // Background 60%
          "base-200": "#f5f5f7",         // Cards/Panels 60%
          "base-300": "#e5e5ea",         // Inputs/Borders 60%
          "base-content": "#1c1c1e",     // Text Content 30%
        },
      }
    ],
  },
}