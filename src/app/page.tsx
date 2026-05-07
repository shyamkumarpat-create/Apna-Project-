import Link from "next/link";
import { Building2, Calculator, FileCheck, Shield, MessageCircle, Trophy, ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [propertyCount, userCount] = await Promise.all([
      prisma.property.count(),
      prisma.user.count(),
    ]);
    return { propertyCount, userCount };
  } catch {
    return { propertyCount: 0, userCount: 0 };
  }
}

export default async function LandingPage() {
  const { propertyCount, userCount } = await getStats();

  const features = [
    {
      icon: Building2, title: "Smart Property Listings",
      description: "Browse thousands of verified properties for sale and rent across India with advanced filters.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: MessageCircle, title: "Real-time Chat",
      description: "Connect directly with owners and buyers via real-time messaging. Get answers instantly.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: TrendingUp, title: "ROI Calculator",
      description: "Calculate rental yield, EMI, capital appreciation, and complete investment returns before buying.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FileCheck, title: "Document Validator",
      description: "Never miss a critical legal document. Our checklist covers all 30+ documents for every property type.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Trophy, title: "Gamification",
      description: "Earn points, unlock badges, and climb the leaderboard as you engage with the community.",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Shield, title: "Safe & Secure",
      description: "Verified listings, secure messaging, and document validation to protect your investment.",
      color: "bg-red-100 text-red-600",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Create Account", desc: "Register in seconds and earn 50 welcome points instantly." },
    { step: "02", title: "Browse or List", desc: "Search properties or post your listing to reach thousands of buyers." },
    { step: "03", title: "Connect & Validate", desc: "Chat with owners, validate documents, calculate ROI before deciding." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
            <Star className="h-4 w-4 text-yellow-300" />
            India&apos;s Smartest Property Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Buy, Sell & Rent <br />
            <span className="text-yellow-300">Properties</span> Smarter
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            With real-time chat, ROI calculator, document validator and gamification — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full sm:w-auto">
                Browse Properties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 w-full sm:w-auto">
                Register Free (+50 pts)
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-yellow-300">{propertyCount}+</p>
              <p className="text-sm text-blue-200">Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">{userCount}+</p>
              <p className="text-sm text-blue-200">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">30+</p>
              <p className="text-sm text-blue-200">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500">Powerful tools for buyers and sellers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${f.color}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((h, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {h.step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-500">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-2xl">
          <Trophy className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Ready to start earning?</h2>
          <p className="text-blue-100 mb-6">Join thousands of property enthusiasts. Earn points, badges, and find your dream property.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Join Apna Project Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
