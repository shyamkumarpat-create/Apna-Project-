import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 mb-2">
              <Building2 className="h-5 w-5" />
              Apna Project
            </Link>
            <p className="text-sm text-gray-500">India&apos;s trusted property listing platform for buyers and sellers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Browse</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/properties" className="hover:text-blue-600">All Properties</Link></li>
              <li><Link href="/properties?listingType=SALE" className="hover:text-blue-600">For Sale</Link></li>
              <li><Link href="/properties?listingType=RENT" className="hover:text-blue-600">For Rent</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/tools/roi-calculator" className="hover:text-blue-600">ROI Calculator</Link></li>
              <li><Link href="/tools/doc-validator" className="hover:text-blue-600">Doc Validator</Link></li>
              <li><Link href="/leaderboard" className="hover:text-blue-600">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register" className="hover:text-blue-600">Register</Link></li>
              <li><Link href="/login" className="hover:text-blue-600">Login</Link></li>
              <li><Link href="/properties/new" className="hover:text-blue-600">Post Property</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Apna Project. Made with ❤️ in India.
        </div>
      </div>
    </footer>
  );
}
