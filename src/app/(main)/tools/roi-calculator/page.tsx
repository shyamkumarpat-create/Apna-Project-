"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Calculator, TrendingUp, IndianRupee, Percent, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { roiInputSchema, type ROIInput } from "@/lib/validations";
import type { ROIOutput } from "@/lib/roi-calculator";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";

function ROICalculatorInner() {
  const searchParams = useSearchParams();
  const defaultPrice = Number(searchParams.get("price") ?? 5000000);
  const [result, setResult] = useState<ROIOutput | null>(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ROIInput>({
    resolver: zodResolver(roiInputSchema) as any,
    defaultValues: {
      purchasePrice: defaultPrice,
      stampDutyPercent: 5,
      registrationFeePercent: 1,
      brokeragePercent: 1,
      renovationCost: 0,
      monthlyRent: 0,
      vacancyRatePercent: 5,
      maintenanceCostPercent: 10,
      isFinanced: false,
      loanAmount: 0,
      interestRatePercent: 8.5,
      loanTenureYears: 20,
      expectedAppreciationPercent: 8,
      holdingPeriodYears: 5,
    },
  });

  const isFinanced = watch("isFinanced");

  const onSubmit = async (data: ROIInput) => {
    setLoading(true);
    const res = await fetch("/api/tools/roi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const r = await res.json();
    setResult(r);
    setLoading(false);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const MetricCard = ({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) => (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${positive === true ? "text-green-600" : positive === false ? "text-red-500" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Calculator className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property ROI Calculator</h1>
          <p className="text-gray-500 text-sm">Calculate investment returns · Earn +5 points</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Purchase Details */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4 text-blue-600" />Purchase Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Purchase Price (₹)</Label>
                <Input type="number" {...register("purchasePrice", { valueAsNumber: true })} />
                {errors.purchasePrice && <p className="text-xs text-red-500">{errors.purchasePrice.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Stamp Duty %</Label>
                  <Input type="number" step="0.1" {...register("stampDutyPercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reg. Fee %</Label>
                  <Input type="number" step="0.1" {...register("registrationFeePercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Brokerage %</Label>
                  <Input type="number" step="0.1" {...register("brokeragePercent", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Renovation Cost (₹)</Label>
                <Input type="number" {...register("renovationCost", { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>

          {/* Rental Details */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" />Rental Income</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Expected Monthly Rent (₹)</Label>
                <Input type="number" {...register("monthlyRent", { valueAsNumber: true })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vacancy Rate %</Label>
                  <Input type="number" step="0.5" {...register("vacancyRatePercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Maintenance %</Label>
                  <Input type="number" step="0.5" {...register("maintenanceCostPercent", { valueAsNumber: true })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-purple-600" />Home Loan</span>
                <label className="flex items-center gap-2 text-sm font-normal">
                  <input type="checkbox" {...register("isFinanced")} className="rounded" />
                  Financed
                </label>
              </CardTitle>
            </CardHeader>
            {isFinanced && (
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Loan Amount (₹)</Label>
                  <Input type="number" {...register("loanAmount", { valueAsNumber: true })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Interest Rate %</Label>
                    <Input type="number" step="0.1" {...register("interestRatePercent", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tenure (Years)</Label>
                    <Input type="number" {...register("loanTenureYears", { valueAsNumber: true })} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Growth */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Percent className="h-4 w-4 text-orange-500" />Growth Assumptions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Annual Appreciation %</Label>
                  <Input type="number" step="0.5" {...register("expectedAppreciationPercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Holding Period (Yrs)</Label>
                  <Input type="number" {...register("holdingPeriodYears", { valueAsNumber: true })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
            <Calculator className="h-5 w-5" />
            {loading ? "Calculating..." : "Calculate ROI"}
          </Button>
        </form>

        {/* Results */}
        <div id="results">
          {result ? (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className={`rounded-xl p-6 text-white text-center ${result.totalROIPercent >= 0 ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                <p className="text-sm opacity-80 mb-1">Total ROI over {watch("holdingPeriodYears")} years</p>
                <p className="text-5xl font-bold">{result.totalROIPercent.toFixed(1)}%</p>
                <p className="text-sm opacity-80 mt-1">CAGR: {result.annualizedROIPercent.toFixed(2)}% per year</p>
              </div>

              {/* Investment */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Investment Breakdown</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard label="Total Investment" value={formatCurrency(result.totalInvestment)} />
                  <MetricCard label="Stamp Duty" value={formatCurrency(result.stampDutyAmount)} />
                  <MetricCard label="Registration Fee" value={formatCurrency(result.registrationFeeAmount)} />
                  <MetricCard label="Brokerage" value={formatCurrency(result.brokerageAmount)} />
                </div>
              </div>

              {/* Rental Yield */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Rental Analysis</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard label="Gross Rental Yield" value={`${result.grossRentalYield.toFixed(2)}%`} positive={result.grossRentalYield > 3} />
                  <MetricCard label="Net Rental Yield" value={`${result.netRentalYield.toFixed(2)}%`} positive={result.netRentalYield > 2} />
                  <MetricCard label="Annual Rental Income" value={formatCurrency(result.annualRentalIncome)} />
                  <MetricCard label="Monthly Cash Flow" value={formatCurrency(result.cashFlowMonthly)} positive={result.cashFlowMonthly > 0} />
                </div>
              </div>

              {/* Appreciation */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Capital Appreciation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard label="Future Value" value={formatCurrency(result.projectedFutureValue)} />
                  <MetricCard label="Capital Gain" value={formatCurrency(result.capitalGain)} positive={result.capitalGain > 0} />
                  <MetricCard label="Capital Gain %" value={`${result.capitalGainPercent.toFixed(1)}%`} positive={result.capitalGainPercent > 0} />
                  <MetricCard label="Payback Period" value={result.paybackPeriodYears > 0 ? `${result.paybackPeriodYears.toFixed(1)} yrs` : "N/A"} />
                </div>
              </div>

              {/* Loan */}
              {isFinanced && result.monthlyEMI > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm">Loan Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCard label="Monthly EMI" value={formatCurrency(result.monthlyEMI)} />
                    <MetricCard label="Total Interest" value={formatCurrency(result.totalInterestPaid)} />
                    <MetricCard label="Break-even Rent" value={formatCurrency(result.breakEvenRent)} sub="Min rent to cover costs" />
                    <MetricCard label="Total Loan Cost" value={formatCurrency(result.totalLoanCost)} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed">
              <Calculator className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-400 text-lg font-medium">Fill in the form to see</p>
              <p className="text-gray-300 text-sm">your property ROI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ROICalculatorPage() {
  return (
    <Suspense>
      <ROICalculatorInner />
    </Suspense>
  );
}
