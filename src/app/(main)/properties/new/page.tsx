"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus, ChevronRight, ChevronLeft, Check } from "lucide-react";

const PROPERTY_TYPES = ["APARTMENT","HOUSE","VILLA","PLOT","COMMERCIAL","OFFICE","SHOP","WAREHOUSE","FARMHOUSE","PG"];
const AMENITIES_LIST = [
  "Lift","Parking","Security","Power Backup","Swimming Pool","Gym","Garden",
  "Clubhouse","CCTV","Intercom","Water Supply 24/7","Gas Pipeline","WiFi Ready",
  "Play Area","Jogging Track","Visitor Parking",
];
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh",
];

const STEPS = ["Basic Info", "Details & Location", "Images & Review"];

export default function NewPropertyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: { listingType: "SALE", priceUnit: "TOTAL", status: "AVAILABLE", images: [], amenities: [] },
  });

  const images = watch("images") ?? [];

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setValue("images", [...images, imageUrl.trim()]);
    setImageUrl("");
  };

  const toggleAmenity = (a: string) => {
    const updated = selectedAmenities.includes(a)
      ? selectedAmenities.filter((x) => x !== a)
      : [...selectedAmenities, a];
    setSelectedAmenities(updated);
    setValue("amenities", updated);
  };

  const onSubmit = async (data: PropertyInput) => {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, amenities: selectedAmenities }),
    });
    if (res.ok) {
      const p = await res.json();
      toast({ title: "Property listed! +30 points", description: "Your listing is now live.", variant: "default" });
      router.push(`/properties/${p.id}`);
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to post a property</p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a Property</h1>
      <p className="text-gray-500 text-sm mb-6">Earn +30 points for each listing!</p>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${i === step ? "text-blue-600 font-medium" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px w-8 sm:w-16 mx-2 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input placeholder="e.g., Spacious 3 BHK Apartment in Koramangala" {...register("title")} />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Describe the property..." className="min-h-[120px]" {...register("description")} />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Property Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Listing For</Label>
                  <Controller
                    name="listingType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALE">For Sale</SelectItem>
                          <SelectItem value="RENT">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details & Location */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Details & Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="e.g., 5000000" {...register("price", { valueAsNumber: true })} />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Area (sq.ft)</Label>
                  <Input type="number" placeholder="e.g., 1200" {...register("area", { valueAsNumber: true })} />
                  {errors.area && <p className="text-xs text-red-500">{errors.area.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Bedrooms</Label>
                  <Input type="number" min="0" {...register("bedrooms", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bathrooms</Label>
                  <Input type="number" min="0" {...register("bathrooms", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input placeholder="e.g., Bangalore" {...register("city")} />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input placeholder="Full address" {...register("address")} />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input placeholder="560001" {...register("pincode")} />
              </div>
              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedAmenities.includes(a)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Images & Review */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Images & Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Property Images (URLs)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                  />
                  <Button type="button" onClick={addImage} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="h-20 w-28 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setValue("images", images.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">Add public image URLs (max 5). You can skip this step.</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-medium text-gray-700">Listing Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <span>Type:</span><span className="font-medium">{watch("type")}</span>
                  <span>Listing:</span><span className="font-medium">{watch("listingType")}</span>
                  <span>City:</span><span className="font-medium">{watch("city")}</span>
                  <span>Price:</span><span className="font-medium">₹{watch("price")?.toLocaleString("en-IN")}</span>
                  <span>Area:</span><span className="font-medium">{watch("area")} sqft</span>
                  <span>Amenities:</span><span className="font-medium">{selectedAmenities.length} selected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(step + 1)} className="gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Posting..." : "Post Property"} {!loading && <Check className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
