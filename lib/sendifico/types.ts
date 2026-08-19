export interface SendificoTerritory {
  territoryBaseId: string;
  territory1Name: string;
  territory2Name: string;
  territory3Name: string;
  searchableText: string;
}

export interface SendificoQuotationRate {
  quotationId: number;
  carrierToken: string;
  priceSubtotal: number;
  priceTotal: number;
  currency: string;
  estimateDays: number;
  available: boolean;
  unavailableReason?: string;
}

export interface ShippingQuote {
  priceTotal: number;
  currency: string;
  estimateDays: number;
}
