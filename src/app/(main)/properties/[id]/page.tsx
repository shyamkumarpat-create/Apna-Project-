"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin, BedDouble, Bath, Maximize2, Building2, Car, MessageCircle, Share2,
  ArrowLeft, User, Phone, CheckCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LikeButton } from "@/components/property/LikeButton";
import { CommentSection } from "@/components/property/CommentSection";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface PropertyDetail {
  id: string; title: string; description: string; price: number; priceUnit: string;
  type: string; listingType: string; area: number; bedrooms?: number; bathrooms?: number;
  floors?: number; parkingSpots?: number; city: string; state: string; address: string;
  pincode?: string; images: string[]; amenities: string[]; status: string;
  isFeatured: boolean; viewCount: number; likeCount: number; commentCount: number;
  createdAt: string; userLiked: boolean;
  owner: { id: string; name: string; avatar?: string; phone?: string; role: string };
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",PLOT:"Plot",COMMERCIAL:"Commercial",
  OFFICE:"Office",SHOP:"Shop",WAREHOUSE:"Warehouse",FARMHOUSE:"Farmhouse",PG:"PG",
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${id}`).then((r) => r.json()).then(setProperty);
  }, [id]);

  const startChat = async () => {
    if (!session) { router.push("/login"); return; }
    if (!property) return;
    setStartingChat(true);
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: property.owner.id, propertyId: id }),
    });
    const conv = await res.json();
    router.push(`/chat/${conv.id}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Property link copied to clipboard." });
  };

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="space-y-2">
            <div className="relative h-72 md:h-96 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl overflow-hidden">
              {property.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.images[activeImg]} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="h-24 w-24 text-blue-200" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={property.listingType === "SALE" ? "bg-blue-600" : "bg-green-600"}>
                  {property.listingType === "SALE" ? "For Sale" : "For Rent"}
                </Badge>
                {property.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                <Eye className="h-3 w-3" /> {property.viewCount} views
              </div>
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-md flex-shrink-0 cursor-pointer transition-all ${i === activeImg ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(property.price)}</p>
                <p className="text-sm text-gray-500">{TYPE_LABELS[property.type]} · {property.area} sqft</p>
              </div>
              <div className="flex gap-2">
                <LikeButton propertyId={property.id} initialLiked={property.userLiked} initialCount={property.likeCount} />
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mt-2">{property.title}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{property.address}, {property.city}, {property.state} {property.pincode}</span>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {property.bedrooms != null && (
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <BedDouble className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-semibold">{property.bedrooms}</p>
                <p className="text-xs text-gray-500">Bedrooms</p>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Bath className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-semibold">{property.bathrooms}</p>
                <p className="text-xs text-gray-500">Bathrooms</p>
              </div>
            )}
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Maximize2 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-semibold">{property.area}</p>
              <p className="text-xs text-gray-500">Sq. Ft.</p>
            </div>
            {property.parkingSpots != null && (
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Car className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-semibold">{property.parkingSpots}</p>
                <p className="text-xs text-gray-500">Parking</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-2">About this property</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <CommentSection propertyId={property.id} />
        </div>

        {/* Right: Owner card */}
        <div className="space-y-4">
          <div className="border rounded-xl p-5 sticky top-20 space-y-4">
            <h3 className="font-semibold text-gray-800">Contact Owner</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={property.owner.avatar ?? ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {property.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{property.owner.name}</p>
                <p className="text-xs text-gray-500">{property.owner.role === "SELLER" ? "Owner/Seller" : "Agent"}</p>
              </div>
            </div>

            {property.owner.id !== session?.user.id && (
              <>
                <Button className="w-full gap-2" onClick={startChat} disabled={startingChat}>
                  <MessageCircle className="h-4 w-4" />
                  {startingChat ? "Opening chat..." : "Chat with Owner"}
                </Button>
                {property.owner.phone && (
                  <a href={`tel:${property.owner.phone}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Call Owner
                    </Button>
                  </a>
                )}
              </>
            )}

            {property.owner.id === session?.user.id && (
              <Link href={`/properties/my-listings`}>
                <Button variant="outline" className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Manage Listing
                </Button>
              </Link>
            )}

            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t">
              <p>Listed on {formatDate(property.createdAt)}</p>
              <p>Status: <span className="capitalize text-green-600">{property.status.replace("_", " ").toLowerCase()}</span></p>
            </div>

            {/* Quick ROI */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-800 mb-1">Quick Analysis</p>
              <Link href={`/tools/roi-calculator?price=${property.price}`}>
                <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto text-xs">
                  Calculate ROI for this property →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
