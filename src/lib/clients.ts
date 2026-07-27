/**
 * Client (prospect) data access for personalized preview pages.
 *
 * Production: reads the `clients` item from Vercel Edge Config
 * (EDGE_CONFIG connection string is injected by Vercel once the
 * Edge Config store is connected to the project).
 *
 * Local dev / E2E tests: falls back to `src/data/clients.local.json`,
 * which is also what `scripts/sync-erpnext-edge-config.mjs --local`
 * writes to. Same shape in both stores, so the page code is identical.
 */

/** Which preview template renders for a record; default is 'motorrad'. */
export type ClientSegment = 'motorrad' | 'friseur' | 'fitness' | 'tiersalon' | 'werkstatt';

export interface ClientRecord {
  slug: string;
  company: string;
  /** Industry template for this prospect ('motorrad' when absent). */
  segment?: ClientSegment;
  street?: string;
  zip?: string;
  city?: string;
  email?: string;
  phone?: string;
  /** Optional external appointment-booking link (friseur template CTA). */
  bookingUrl?: string;
  /** Optional hand-written hero text; a default is generated otherwise. */
  heroText?: string;
  /** ERPNext document name this record was synced from (e.g. CRM-LEAD-2026-00042). */
  erpnextId?: string;
  /** Real contact person to address by name (GUD-68), e.g. "Frau Anna Müller". Absent when unknown. */
  contactName?: string;
  updatedAt?: string;
}

export type ClientsMap = Record<string, ClientRecord>;

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

async function readFromEdgeConfig(): Promise<ClientsMap | null> {
  if (!process.env.EDGE_CONFIG) return null;
  const { get } = await import('@vercel/edge-config');
  const clients = await get<ClientsMap>('clients');
  return clients ?? {};
}

async function readFromLocalFile(): Promise<ClientsMap> {
  const { readFile } = await import('node:fs/promises');
  const url = new URL('../data/clients.local.json', import.meta.url);
  try {
    const raw = await readFile(url, 'utf-8');
    return JSON.parse(raw) as ClientsMap;
  } catch {
    return {};
  }
}

export async function getClients(): Promise<ClientsMap> {
  return (await readFromEdgeConfig()) ?? (await readFromLocalFile());
}

export async function getClient(slug: string): Promise<ClientRecord | null> {
  if (!isValidSlug(slug)) return null;
  const clients = await getClients();
  const record = clients[slug];
  return record ? { ...record, slug } : null;
}

/** Normalized segment with fallback for records synced before the field existed. */
export function segmentFor(client: ClientRecord): ClientSegment {
  if (client.segment === 'friseur') return 'friseur';
  if (client.segment === 'fitness') return 'fitness';
  if (client.segment === 'tiersalon') return 'tiersalon';
  if (client.segment === 'werkstatt') return 'werkstatt';
  return 'motorrad';
}

/** Default personalized hero copy when the record has no custom heroText. */
export function heroTextFor(client: ClientRecord): string {
  if (client.heroText) return client.heroText;
  const wo = client.city ? ` in ${client.city}` : '';
  return (
    `So könnte der neue Web-Auftritt von ${client.company}${wo} aussehen — ` +
    'schnell, modern und auf Ihre Kundschaft zugeschnitten. ' +
    'Diese Vorschau ist unverbindlich und mit Beispielinhalten gefüllt.'
  );
}

/** One-line address, only from the parts that exist. */
export function addressLineFor(client: ClientRecord): string {
  const cityPart = [client.zip, client.city].filter(Boolean).join(' ');
  return [client.street, cityPart].filter(Boolean).join(', ');
}
