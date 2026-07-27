/**
 * Anonymous-slug prospect lookup for this repo's personalized route
 * (GUD-70, following GUD-68's rollout in gudecode-vorschau-motorrad and
 * GUD-72's port to the friseur standalone repo).
 *
 * Reads from the SAME `vorschau-prospects` Edge Config store the
 * motorrad repo uses (`EDGE_CONFIG_PROSPECTS` connection string, a
 * dedicated read-only token scoped to this Vercel project) — this repo
 * is read-only against that store, never writes to it. Only prospects
 * classified with segment 'werkstatt' render here; everything else 404s,
 * since this domain is the werkstatt-branded preview and should never show
 * a lead the wrong template.
 */

import type { ClientRecord } from './clients';

export interface ProspectRecord {
  firma: string;
  branche?: string;
  segment?: string;
  ansprechpartner?: string;
}

export type ProspectsMap = Record<string, ProspectRecord>;

/** Builds this template's client record from a classified werkstatt prospect. */
export function toClientRecord(nummer: string, prospect: ProspectRecord): ClientRecord {
  return {
    slug: nummer,
    company: prospect.firma,
    segment: 'werkstatt',
    contactName: prospect.ansprechpartner,
  };
}

const NUMMER_RE = /^[0-9]{1,10}$/;

/** Anonymous slugs are digits only — never a company name or ERPNext id. */
export function isNummerSlug(slug: string): boolean {
  return NUMMER_RE.test(slug);
}

async function readFromEdgeConfig(nummer: string): Promise<ProspectRecord | null | undefined> {
  if (!process.env.EDGE_CONFIG_PROSPECTS) return undefined;
  const { createClient } = await import('@vercel/edge-config');
  const client = createClient(process.env.EDGE_CONFIG_PROSPECTS);
  const record = await client.get<ProspectRecord>(nummer);
  return record ?? null;
}

async function readFromLocalFile(): Promise<ProspectsMap> {
  const { readFile } = await import('node:fs/promises');
  const url = new URL('../data/prospects.local.json', import.meta.url);
  try {
    const raw = await readFile(url, 'utf-8');
    return JSON.parse(raw) as ProspectsMap;
  } catch {
    return {};
  }
}

export async function getProspect(nummer: string): Promise<ProspectRecord | null> {
  if (!isNummerSlug(nummer)) return null;
  const fromEdgeConfig = await readFromEdgeConfig(nummer);
  if (fromEdgeConfig !== undefined) return fromEdgeConfig;
  const prospects = await readFromLocalFile();
  return prospects[nummer] ?? null;
}
