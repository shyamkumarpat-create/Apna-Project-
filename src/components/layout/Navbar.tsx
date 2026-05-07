"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Building2, Calculator, FileCheck, MessageCircle, Trophy, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/tools/roi-calculator", label: "ROI Calculator", icon: Calculator },
    { href: "/tools/doc-validator", label: "Doc Validator", icon: FileCheck },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Building2 className="h-6 w-6" />
          <span>Apna Project</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:flex gap-1 text-xs">
                <span>⚡</span>
                <span>{session.user.points ?? 0} pts</span>
              </Badge>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" title="Dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={session.user.avatar ?? ""} alt={session.user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out"
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("md:hidden border-t bg-white", open ? "block" : "hidden")}>
        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {session && (
            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50">
              <User className="h-4 w-4" />
              My Profile
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
