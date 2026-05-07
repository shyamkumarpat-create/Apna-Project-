"use client";

import Link from "next/link";
import { Heart, MessageCircle, MapPin, BedDouble, Bath, Maximize2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  type: string;
  listingType: string;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city: string;
  state: string;
  images: string[];
  status: string;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  owner: { id: string; name: string; avatar?: string | null };
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment", HOUSE: "House", VILLA: "Villa", PLOT: "Plot",
  COMMERCIAL: "Commercial", OFFICE: "Office", SHOP: "Shop", WAREHOUSE: "Warehouse",
  FARMHOUSE: "Farmhouse", PG: "PG",
};

export function PropertyCard(p: PropertyCardProps) {
  const img = p.images[0] ?? null;

  return (
    <Link href={`/properties/${p.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex items-center justify-center h-full text-blue-300">
              <Maximize2 className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            <Badge className={p.listingType === "SALE" ? "bg-blue-600" : "bg-green-600"}>
              {p.listingType === "SALE" ? "For Sale" : "For Rent"}
            </Badge>
            {p.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
            {p.status !== "AVAILABLE" && (
              <Badge variant="secondary">{p.status.replace("_", " ")}</Badge>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" />
            {p.viewCount}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Price */}
          <div className="flex items-start justify-between mb-1">
            <p className="text-xl font-bold text-blue-600">{formatCurrency(p.price)}</p>
            <Badge variant="outline" className="text-xs">{TYPE_LABELS[p.type]}</Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{p.title}</h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{p.city}, {p.state}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            {p.bedrooms != null && (
              <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{p.bedrooms} BHK</span>
            )}
            {p.bathrooms != null && (
              <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms}</span>
            )}
            <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{p.area} sqft</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6">
                <AvatarImage src={p.owner.avatar ?? ""} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {p.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 line-clamp-1 max-w-[80px]">{p.owner.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likeCount}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.commentCount}</span>
              <span>{formatRelativeTime(p.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
