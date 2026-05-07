export type PropertyTypeDoc = "APARTMENT" | "HOUSE" | "VILLA" | "PLOT" | "COMMERCIAL" | "OFFICE" | "SHOP" | "WAREHOUSE" | "FARMHOUSE" | "PG";
export type Importance = "CRITICAL" | "IMPORTANT" | "OPTIONAL";

export interface DocChecklistItem {
  id: string;
  name: string;
  description: string;
  importance: Importance;
  applicableTo: PropertyTypeDoc[] | "ALL";
  tips: string;
}

export const DOC_CHECKLIST: DocChecklistItem[] = [
  // Universal documents
  {
    id: "sale-deed",
    name: "Sale Deed / Agreement to Sell",
    description: "Primary proof of ownership transfer between buyer and seller. Must be signed by both parties and registered.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "Verify seller's name matches government ID exactly. Ensure all previous owners are listed in the chain.",
  },
  {
    id: "title-deed",
    name: "Title Deed (30-year Chain)",
    description: "Verifies unencumbered ownership history for at least 30 years to ensure no disputes.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "Get a legal opinion from a property lawyer to check for gaps in the title chain.",
  },
  {
    id: "ec",
    name: "Encumbrance Certificate (EC)",
    description: "Proves no loans, mortgages, or legal claims exist on the property. Obtained from the Sub-Registrar office.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "Request EC for at least 13 years. Any loan should show as 'discharged'.",
  },
  {
    id: "property-tax",
    name: "Property Tax Receipts (Last 3 Years)",
    description: "Verifies no outstanding government dues on the property.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "Ensure all dues are cleared before sale. The name on receipts should match the seller's.",
  },
  {
    id: "khata",
    name: "Khata Certificate (Form A & B)",
    description: "Municipal record of property ownership used for tax purposes.",
    importance: "IMPORTANT",
    applicableTo: "ALL",
    tips: "Essential for obtaining building permits. Ensure it's in seller's name.",
  },
  {
    id: "noc-society",
    name: "NOC from Society / RWA",
    description: "No Objection Certificate from Housing Society if property is in a gated community.",
    importance: "IMPORTANT",
    applicableTo: "ALL",
    tips: "Ask for NOC on letterhead with secretary/president signature.",
  },
  {
    id: "utility-bills",
    name: "Latest Utility Bills (Electricity & Water)",
    description: "Verifies physical possession and no pending utility dues.",
    importance: "IMPORTANT",
    applicableTo: "ALL",
    tips: "Request last 3 months' bills. Ensure connection is in seller's name.",
  },
  {
    id: "seller-id",
    name: "Seller Identity Proofs (Aadhaar + PAN)",
    description: "KYC verification of the seller is mandatory for legal registration.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "If sold by company, get MoA, AoA, and Board Resolution authorizing the sale.",
  },
  {
    id: "poa",
    name: "Power of Attorney (if via agent)",
    description: "Legal authority granted to an agent to sell the property on owner's behalf.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "POA must be registered and notarized. Verify the principal (owner) is alive and competent.",
  },
  {
    id: "release-cert",
    name: "Release / Discharge Certificate",
    description: "Confirms any previous bank loan on the property has been fully repaid.",
    importance: "CRITICAL",
    applicableTo: "ALL",
    tips: "Get original copy from the bank with official stamp. Cross-check with EC.",
  },

  // Apartment/Flat specific
  {
    id: "builder-buyer-agr",
    name: "Builder-Buyer Agreement (Original)",
    description: "Original agreement between the first buyer and the builder.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT"],
    tips: "For resale flats, get all previous assignment deeds along with original Builder-Buyer Agreement.",
  },
  {
    id: "allotment-letter",
    name: "Allotment Letter from Builder",
    description: "Letter from builder confirming allotment of the specific unit.",
    importance: "IMPORTANT",
    applicableTo: ["APARTMENT"],
    tips: "Check flat number, floor, and parking details match with what you are buying.",
  },
  {
    id: "possession-letter",
    name: "Possession Letter",
    description: "Certificate from builder that possession of the flat was given.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT"],
    tips: "Possession letter date matters for capital gain tax calculation.",
  },
  {
    id: "oc",
    name: "Occupancy Certificate (OC)",
    description: "Certificate from local authority confirming the building is fit to live in.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT", "HOUSE", "VILLA"],
    tips: "Without OC, the building may be demolished. Always insist on OC.",
  },
  {
    id: "cc",
    name: "Completion Certificate (CC)",
    description: "Certificate confirming construction is complete as per approved plan.",
    importance: "IMPORTANT",
    applicableTo: ["APARTMENT", "HOUSE", "VILLA"],
    tips: "Different from OC. Both are needed for a legally compliant building.",
  },
  {
    id: "building-plan",
    name: "Building Plan Sanction (Approved Layout)",
    description: "Government-approved building plan from municipal authority.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT", "HOUSE", "VILLA"],
    tips: "Verify actual construction matches approved plan. Unauthorized deviations are illegal.",
  },
  {
    id: "rera",
    name: "RERA Registration Certificate",
    description: "Mandatory for projects above 500 sq m or 8 apartments under RERA Act.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT"],
    tips: "Verify RERA number at state RERA website. Project must be registered before booking.",
  },
  {
    id: "no-dues-society",
    name: "No Dues Certificate from Society",
    description: "Confirms seller has paid all maintenance charges and dues to the society.",
    importance: "CRITICAL",
    applicableTo: ["APARTMENT"],
    tips: "Get it on society letterhead. Unpaid dues become buyer's liability after transfer.",
  },
  {
    id: "share-cert",
    name: "Share Certificate (Co-op Society)",
    description: "Proof of membership in a cooperative housing society.",
    importance: "IMPORTANT",
    applicableTo: ["APARTMENT"],
    tips: "Society must transfer share certificate in buyer's name after completing sale.",
  },
  {
    id: "maintenance-receipts",
    name: "Maintenance Payment Receipts",
    description: "Proof that all maintenance charges are paid up to date.",
    importance: "IMPORTANT",
    applicableTo: ["APARTMENT"],
    tips: "Check for any special levies or pending sinking fund contributions.",
  },

  // Plot/Land specific
  {
    id: "survey-records",
    name: "Survey Settlement Records",
    description: "Government survey records identifying the plot with boundaries.",
    importance: "CRITICAL",
    applicableTo: ["PLOT", "FARMHOUSE"],
    tips: "Match survey number with actual plot boundaries on ground.",
  },
  {
    id: "mutation",
    name: "Mutation Certificate / Mutation Extract",
    description: "Government record updating the ownership in revenue records.",
    importance: "CRITICAL",
    applicableTo: ["PLOT", "FARMHOUSE"],
    tips: "Mutation in seller's name confirms legal ownership in government records.",
  },
  {
    id: "rtc",
    name: "RTC (Rights, Tenancy & Crops) Extract",
    description: "Revenue record showing ownership, tenancy, and crop details.",
    importance: "CRITICAL",
    applicableTo: ["PLOT", "FARMHOUSE"],
    tips: "Check for any tenant rights. Agricultural land with tenants cannot be easily sold.",
  },
  {
    id: "land-use-cert",
    name: "Land Use Certificate",
    description: "Confirms whether land is designated as agricultural or residential/commercial.",
    importance: "CRITICAL",
    applicableTo: ["PLOT"],
    tips: "Agricultural land cannot be used for residential construction without conversion.",
  },
  {
    id: "conversion-cert",
    name: "Conversion Certificate (DC Conversion)",
    description: "Certificate converting agricultural land to non-agricultural use.",
    importance: "CRITICAL",
    applicableTo: ["PLOT"],
    tips: "Required before building on converted agricultural land. Verify at local DC office.",
  },
  {
    id: "layout-approval",
    name: "Layout Plan Approvals",
    description: "Approved layout plan from planning authority for the plot.",
    importance: "CRITICAL",
    applicableTo: ["PLOT"],
    tips: "Unapproved layouts risk demolition orders.",
  },
  {
    id: "dtcp-approval",
    name: "DTCP/BDA/BMRDA/Authority Approval",
    description: "Town planning authority approval for the development.",
    importance: "CRITICAL",
    applicableTo: ["PLOT"],
    tips: "Name varies by city. Chennai: DTCP, Bangalore: BDA/BMRDA, Delhi: DDA.",
  },
  {
    id: "tippan",
    name: "Tippan (Sketch Map of Plot)",
    description: "Official sketch showing dimensions and boundaries of the plot.",
    importance: "IMPORTANT",
    applicableTo: ["PLOT", "FARMHOUSE"],
    tips: "Use this to verify actual plot dimensions on ground match documents.",
  },

  // Commercial specific
  {
    id: "trade-license",
    name: "Trade License / Shop Establishment Certificate",
    description: "License from municipality to operate commercial activity.",
    importance: "IMPORTANT",
    applicableTo: ["COMMERCIAL", "OFFICE", "SHOP"],
    tips: "Verify the license is current and covers the intended business activity.",
  },
  {
    id: "fire-noc",
    name: "Fire NOC",
    description: "No Objection Certificate from Fire Department for commercial use.",
    importance: "CRITICAL",
    applicableTo: ["COMMERCIAL", "OFFICE", "SHOP", "WAREHOUSE"],
    tips: "Fire NOC must be renewed periodically. Check expiry date.",
  },
  {
    id: "zoning-cert",
    name: "Zoning Certificate",
    description: "Confirms the property is in a zone approved for commercial use.",
    importance: "CRITICAL",
    applicableTo: ["COMMERCIAL", "OFFICE", "SHOP"],
    tips: "Using residential property for commercial use without zoning change is illegal.",
  },
];

export function getChecklistForType(propertyType: PropertyTypeDoc): DocChecklistItem[] {
  return DOC_CHECKLIST.filter(
    (item) => item.applicableTo === "ALL" || item.applicableTo.includes(propertyType)
  );
}

export function getCompletionStats(items: DocChecklistItem[], checkedIds: string[]) {
  const checkedSet = new Set(checkedIds);
  const critical = items.filter((i) => i.importance === "CRITICAL");
  const important = items.filter((i) => i.importance === "IMPORTANT");

  return {
    total: items.length,
    checked: checkedIds.length,
    criticalTotal: critical.length,
    criticalChecked: critical.filter((i) => checkedSet.has(i.id)).length,
    importantTotal: important.length,
    importantChecked: important.filter((i) => checkedSet.has(i.id)).length,
    percent: items.length > 0 ? Math.round((checkedIds.length / items.length) * 100) : 0,
  };
}
