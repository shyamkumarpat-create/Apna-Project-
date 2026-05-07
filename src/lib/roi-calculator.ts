import type { ROIInput } from "@/lib/validations";

export interface ROIOutput {
  totalInvestment: number;
  stampDutyAmount: number;
  registrationFeeAmount: number;
  brokerageAmount: number;
  totalAcquisitionCost: number;
  grossRentalYield: number;
  netRentalYield: number;
  annualRentalIncome: number;
  annualExpenses: number;
  monthlyEMI: number;
  totalInterestPaid: number;
  totalLoanCost: number;
  projectedFutureValue: number;
  capitalGain: number;
  capitalGainPercent: number;
  totalROIPercent: number;
  annualizedROIPercent: number;
  paybackPeriodYears: number;
  breakEvenRent: number;
  cashFlowMonthly: number;
}

export function calculateROI(input: ROIInput): ROIOutput {
  const {
    purchasePrice,
    stampDutyPercent,
    registrationFeePercent,
    brokeragePercent,
    renovationCost,
    monthlyRent,
    vacancyRatePercent,
    maintenanceCostPercent,
    isFinanced,
    loanAmount,
    interestRatePercent,
    loanTenureYears,
    expectedAppreciationPercent,
    holdingPeriodYears,
  } = input;

  const stampDutyAmount = (purchasePrice * stampDutyPercent) / 100;
  const registrationFeeAmount = (purchasePrice * registrationFeePercent) / 100;
  const brokerageAmount = (purchasePrice * brokeragePercent) / 100;
  const totalAcquisitionCost = purchasePrice + stampDutyAmount + registrationFeeAmount + brokerageAmount;
  const totalInvestment = totalAcquisitionCost + renovationCost;

  // Rental yield
  const effectiveAnnualRent = monthlyRent * 12 * (1 - vacancyRatePercent / 100);
  const annualExpenses = effectiveAnnualRent * (maintenanceCostPercent / 100);
  const annualRentalIncome = effectiveAnnualRent;
  const grossRentalYield = purchasePrice > 0 ? (monthlyRent * 12 / purchasePrice) * 100 : 0;
  const netRentalYield = totalInvestment > 0 ? ((effectiveAnnualRent - annualExpenses) / totalInvestment) * 100 : 0;

  // Loan metrics
  let monthlyEMI = 0;
  let totalInterestPaid = 0;
  let totalLoanCost = 0;

  if (isFinanced && loanAmount > 0 && interestRatePercent > 0) {
    const r = interestRatePercent / 100 / 12;
    const n = loanTenureYears * 12;
    monthlyEMI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalLoanCost = monthlyEMI * n;
    totalInterestPaid = totalLoanCost - loanAmount;
  }

  // Appreciation
  const projectedFutureValue = purchasePrice * Math.pow(1 + expectedAppreciationPercent / 100, holdingPeriodYears);
  const capitalGain = projectedFutureValue - totalInvestment;
  const capitalGainPercent = totalInvestment > 0 ? (capitalGain / totalInvestment) * 100 : 0;

  // Total returns
  const totalRentalIncome = (effectiveAnnualRent - annualExpenses) * holdingPeriodYears;
  const loanCostDuringHolding = isFinanced ? monthlyEMI * 12 * holdingPeriodYears : 0;
  const totalReturnValue = capitalGain + totalRentalIncome - loanCostDuringHolding;
  const totalROIPercent = totalInvestment > 0 ? (totalReturnValue / totalInvestment) * 100 : 0;

  const finalValue = totalInvestment + totalReturnValue;
  const annualizedROIPercent =
    holdingPeriodYears > 0 && totalInvestment > 0 && finalValue > 0
      ? (Math.pow(finalValue / totalInvestment, 1 / holdingPeriodYears) - 1) * 100
      : 0;

  const annualNetIncome = effectiveAnnualRent - annualExpenses - monthlyEMI * 12;
  const paybackPeriodYears = annualNetIncome > 0 ? totalInvestment / annualNetIncome : 0;

  const monthlyExpenses = annualExpenses / 12 + monthlyEMI;
  const breakEvenRent = monthlyExpenses / (1 - vacancyRatePercent / 100 / 12);

  const cashFlowMonthly = monthlyRent * (1 - vacancyRatePercent / 100 / 12) - monthlyExpenses;

  return {
    totalInvestment,
    stampDutyAmount,
    registrationFeeAmount,
    brokerageAmount,
    totalAcquisitionCost,
    grossRentalYield,
    netRentalYield,
    annualRentalIncome,
    annualExpenses,
    monthlyEMI,
    totalInterestPaid,
    totalLoanCost,
    projectedFutureValue,
    capitalGain,
    capitalGainPercent,
    totalROIPercent,
    annualizedROIPercent,
    paybackPeriodYears,
    breakEvenRent,
    cashFlowMonthly,
  };
}
