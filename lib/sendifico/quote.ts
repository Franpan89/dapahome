import { sendificoFetch, SendificoError } from './client';
import type { SendificoQuotationRate, SendificoTerritory, ShippingQuote } from './types';

const SENDER_TERRITORY_BASE_ID = process.env.SENDIFICO_SENDER_TERRITORY_BASE_ID ?? '';
const COUNTRY = process.env.SENDIFICO_COUNTRY ?? 'EC';

// Paquete promedio para un artículo de decoración/hogar. Se usa solo para
// estimar el costo de envío en el checkout — no hay peso/medidas por producto.
const DEFAULT_PARCEL = {
  weight: Number(process.env.SENDIFICO_DEFAULT_PARCEL_WEIGHT ?? 3),
  length: Number(process.env.SENDIFICO_DEFAULT_PARCEL_LENGTH ?? 40),
  width: Number(process.env.SENDIFICO_DEFAULT_PARCEL_WIDTH ?? 30),
  height: Number(process.env.SENDIFICO_DEFAULT_PARCEL_HEIGHT ?? 20),
};

interface QuotationListEnvelope {
  payload: { data: SendificoQuotationRate[] };
}

/** Cotiza el envío a un territorio y devuelve la tarifa disponible más barata, o null si ninguna aplica. */
export async function getCheapestShippingQuote(recipientTerritoryBaseId: string): Promise<ShippingQuote | null> {
  if (!SENDER_TERRITORY_BASE_ID) {
    throw new SendificoError(500, 'sendificoSenderTerritoryMissing');
  }

  const { payload } = await sendificoFetch<QuotationListEnvelope>('/quotation', {
    method: 'POST',
    body: JSON.stringify({
      senderAddress: { territoryBaseId: SENDER_TERRITORY_BASE_ID, country: COUNTRY },
      recipientAddress: { territoryBaseId: recipientTerritoryBaseId, country: COUNTRY },
      parcel: DEFAULT_PARCEL,
      goodsCollection: 0,
      goodsInsured: 0,
      goodsCurrency: 'USD',
    }),
    cache: 'no-store',
  });

  const cheapest = payload.data
    .filter((rate) => rate.available)
    .sort((a, b) => a.priceTotal - b.priceTotal)[0];

  if (!cheapest) return null;
  return { priceTotal: cheapest.priceTotal, currency: cheapest.currency, estimateDays: cheapest.estimateDays };
}

interface TerritoryListEnvelope {
  payload: { data: SendificoTerritory[] };
}

/** Lista completa de territorios estandarizados (no paginada) — cachear en el cliente. */
export async function listTerritories(): Promise<SendificoTerritory[]> {
  const { payload } = await sendificoFetch<TerritoryListEnvelope>('/territory', {
    method: 'GET',
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  return payload.data;
}
