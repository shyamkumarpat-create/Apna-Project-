"use client";

import { useState, useEffect } from "react";
import { FileCheck, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getChecklistForType, getCompletionStats, type PropertyTypeDoc, type DocChecklistItem } from "@/lib/doc-validator";

const PROPERTY_TYPES: { value: PropertyTypeDoc; label: string }[] = [
  { value: "APARTMENT", label: "Apartment / Flat" },
  { value: "HOUSE", label: "House / Bungalow" },
  { value: "VILLA", label: "Villa" },
  { value: "PLOT", label: "Plot / Land" },
  { value: "COMMERCIAL", label: "Commercial Space" },
  { value: "OFFICE", label: "Office" },
  { value: "SHOP", label: "Shop" },
  { value: "FARMHOUSE", label: "Farmhouse" },
];

const IMPORTANCE_CONFIG = {
  CRITICAL: { label: "Critical", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
  IMPORTANT: { label: "Important", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: Info },
  OPTIONAL: { label: "Optional", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info },
};

export default function DocValidatorPage() {
  const [propertyType, setPropertyType] = useState<PropertyTypeDoc>("APARTMENT");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const items = getChecklistForType(propertyType);
  const stats = getCompletionStats(items, checkedIds);

  useEffect(() => {
    setCheckedIds([]);
    setExpandedId(null);
  }, [propertyType]);

  useEffect(() => {
    if (stats.percent > 0 && !pointsAwarded) {
      fetch("/api/tools/roi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchasePrice: 1, holdingPeriodYears: 1, expectedAppreciationPercent: 0 }) });
      // Award doc validator points
      setPointsAwarded(true);
    }
  }, [stats.percent, pointsAwarded]);

  useEffect(() => {
    if (stats.percent >= 10 && !pointsAwarded) {
      fetch("/api/tools/roi", { method: "POST" });
    }
  });

  const toggle = (id: string) => {
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const grouped: Record<string, DocChecklistItem[]> = {
    CRITICAL: items.filter((i) => i.importance === "CRITICAL"),
    IMPORTANT: items.filter((i) => i.importance === "IMPORTANT"),
    OPTIONAL: items.filter((i) => i.importance === "OPTIONAL"),
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
          <FileCheck className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Document Validator</h1>
          <p className="text-gray-500 text-sm">Verify all legal documents before purchase · Earn +5 points</p>
        </div>
      </div>

      {/* Property Type Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1.5">Property Type</p>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyTypeDoc)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Dashboard */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">Checklist Progress</p>
            <span className={`text-2xl font-bold ${stats.percent === 100 ? "text-green-600" : stats.percent >= 70 ? "text-yellow-600" : "text-gray-700"}`}>
              {stats.percent}%
            </span>
          </div>
          <Progress value={stats.percent} className={`h-3 mb-4 ${stats.percent === 100 ? "[&>div]:bg-green-500" : ""}`} />
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-red-50 rounded-lg p-2">
              <p className="font-bold text-red-600">{stats.criticalChecked}/{stats.criticalTotal}</p>
              <p className="text-xs text-gray-500">Critical</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2">
              <p className="font-bold text-yellow-600">{stats.importantChecked}/{stats.importantTotal}</p>
              <p className="text-xs text-gray-500">Important</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="font-bold text-blue-600">{stats.checked}/{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          {stats.criticalChecked < stats.criticalTotal && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{stats.criticalTotal - stats.criticalChecked} critical documents still missing!</span>
            </div>
          )}
          {stats.percent === 100 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>All documents verified! Safe to proceed with purchase.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist by importance */}
      {(["CRITICAL", "IMPORTANT", "OPTIONAL"] as const).map((importance) => {
        const sectionItems = grouped[importance];
        if (sectionItems.length === 0) return null;
        const config = IMPORTANCE_CONFIG[importance];
        const Icon = config.icon;
        const sectionChecked = sectionItems.filter((i) => checkedIds.includes(i.id)).length;

        return (
          <div key={importance} className="mb-4">
            <div className={`flex items-center gap-2 mb-2 px-1 ${config.color}`}>
              <Icon className="h-4 w-4" />
              <span className="font-semibold text-sm">{config.label} Documents</span>
              <Badge variant="outline" className={`text-xs ml-auto ${config.color}`}>
                {sectionChecked}/{sectionItems.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {sectionItems.map((item) => {
                const checked = checkedIds.includes(item.id);
                const expanded = expandedId === item.id;

                return (
                  <Card key={item.id} className={`transition-all ${checked ? "opacity-75" : ""} ${!checked && importance === "CRITICAL" ? "border-red-200" : ""}`}>
                    <CardContent className="p-0">
                      <div
                        className="flex items-start gap-3 p-4 cursor-pointer"
                        onClick={() => toggle(item.id)}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked ? "bg-green-500 border-green-500" : importance === "CRITICAL" ? "border-red-300" : "border-gray-300"
                        }`}>
                          {checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : item.id); }}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                      {expanded && (
                        <div className={`px-4 pb-4 ${config.bg} mx-3 mb-3 rounded-lg border ${config.border}`}>
                          <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                          <Separator className="my-2" />
                          <div className="flex items-start gap-2">
                            <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                            <p className="text-xs text-gray-600"><strong>Tip:</strong> {item.tips}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
