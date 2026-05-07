import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export function getLevel(points: number): { level: number; name: string; nextLevelPoints: number; progress: number } {
  const levels = [
    { level: 1, name: "Newcomer", min: 0 },
    { level: 2, name: "Explorer", min: 100 },
    { level: 3, name: "Investor", min: 300 },
    { level: 4, name: "Analyst", min: 600 },
    { level: 5, name: "Broker", min: 1000 },
    { level: 6, name: "Expert", min: 1500 },
    { level: 7, name: "Mogul", min: 2500 },
    { level: 8, name: "Tycoon", min: 4000 },
    { level: 9, name: "Legend", min: 6000 },
    { level: 10, name: "Property King", min: 10000 },
  ];

  let current = levels[0];
  let next = levels[1];
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].min) {
      current = levels[i];
      next = levels[i + 1] ?? levels[i];
    }
  }

  const progress =
    current.level === 10
      ? 100
      : Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100));

  return { level: current.level, name: current.name, nextLevelPoints: next.min, progress };
}
