"use client";

import { useState, useEffect, useCallback } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";

interface Property {
  id: string; title: string; price: number; priceUnit: string; type: string;
  listingType: string; area: number; bedrooms?: number; bathrooms?: number;
  city: string; state: string; images: string[]; status: string; isFeatured: boolean;
  viewCount: number; likeCount: number; commentCount: number; createdAt: string;
  owner: { id: string; name: string; avatar?: string };
}

const PROPERTY_TYPES = ["APARTMENT","HOUSE","VILLA","PLOT","COMMERCIAL","OFFICE","SHOP","WAREHOUSE","FARMHOUSE","PG"];
const TYPE_LABELS: Record<string, string> = {
  APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",PLOT:"Plot",COMMERCIAL:"Commercial",
  OFFICE:"Office",SHOP:"Shop",WAREHOUSE:"Warehouse",FARMHOUSE:"Farmhouse",PG:"PG",
};

export default function PropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [listingType, setListingType] = useState("");
  const [sort, setSort] = useState("latest");
  const [bedrooms, setBedrooms] = useState("");

  const debouncedCity = useDebounce(city, 400);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "12", sort });
    if (debouncedCity) params.set("city", debouncedCity);
    if (type) params.set("type", type);
    if (listingType) params.set("listingType", listingType);
    if (bedrooms) params.set("bedrooms", bedrooms);

    const res = await fetch(`/api/properties?${params}`);
    const data = await res.json();
    setProperties(data.properties);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [page, debouncedCity, type, listingType, sort, bedrooms]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const resetFilters = () => {
    setCity(""); setType(""); setListingType(""); setBedrooms(""); setPage(1);
  };

  const activeFiltersCount = [city, type, listingType, bedrooms].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
          <p className="text-gray-500 text-sm">{total} properties found</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFiltersCount}</Badge>
            )}
          </Button>
          {session && (
            <Link href="/properties/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Post Property
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search city..."
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Property Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={listingType || "all"} onValueChange={(v) => { setListingType(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Listing Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">For Sale & Rent</SelectItem>
                <SelectItem value="SALE">For Sale</SelectItem>
                <SelectItem value="RENT">For Rent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bedrooms || "all"} onValueChange={(v) => { setBedrooms(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Bedrooms" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="1">1+ BHK</SelectItem>
                <SelectItem value="2">2+ BHK</SelectItem>
                <SelectItem value="3">3+ BHK</SelectItem>
                <SelectItem value="4">4+ BHK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-3 gap-1 text-gray-500">
              <X className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Showing {properties.length} of {total}</p>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No properties found</p>
          <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((p) => <PropertyCard key={p.id} {...p} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 flex items-center px-4">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
