// Server-side RIDB (Recreation.gov) API wrapper.
// Never imported in client code — the API key lives in process.env and stays
// on the server. The Next.js API route at /api/permit/[id] is what the client
// hits, and it calls into here.

const BASE = "https://ridb.recreation.gov/api/v1";

export interface PermitFacilityDetails {
  id: string;
  name: string;
  description: string | null;
  importantInfo: string | null;
  parking: string | null;
  directions: string | null;
  url: string | null;
  lastUpdated: string | null;
}

interface RawAttribute {
  AttributeName: string;
  AttributeValue: string;
}
interface RawPermitEntrance {
  FacilityID?: string;
  PermitEntranceName?: string;
  PermitEntranceDescription?: string;
  ATTRIBUTES?: RawAttribute[];
  LastUpdatedDate?: string;
}

function attr(rec: RawPermitEntrance, name: string): string | null {
  const a = rec.ATTRIBUTES?.find((x) => x.AttributeName === name);
  return a?.AttributeValue ?? null;
}

/** Strip the HTML tags RIDB sprinkles in description fields. */
function clean(html: string | null): string | null {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s*\n\s*\n+/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export async function fetchPermitFacility(id: string): Promise<PermitFacilityDetails | null> {
  const apiKey = process.env.RIDB_API_KEY;
  if (!apiKey) throw new Error("RIDB_API_KEY not set");

  const headers = { apikey: apiKey, accept: "application/json" };
  const cacheOpts = { next: { revalidate: 86400 } } as const;

  // Pattern: /facilities/{id}/permitentrances → returns the rich permit-entrance
  // record with ATTRIBUTES (Important Information, Long Description, etc.).
  // For state-park style facilities that aren't permit entrances (Fern Canyon),
  // /facilities/{id} returns the basic record.
  try {
    const peRes = await fetch(`${BASE}/facilities/${id}/permitentrances?limit=1`, {
      headers,
      ...cacheOpts,
    });
    if (peRes.ok) {
      const j = await peRes.json();
      const rec: RawPermitEntrance | undefined = j.RECDATA?.[0];
      if (rec) {
        return {
          id,
          name: rec.PermitEntranceName || "",
          description: clean(
            rec.PermitEntranceDescription || attr(rec, "Long Description"),
          ),
          importantInfo: clean(attr(rec, "Important Information")),
          parking: clean(attr(rec, "Parking Instructions")),
          directions: clean(attr(rec, "Direction") || attr(rec, "Directions")),
          url: null,
          lastUpdated: rec.LastUpdatedDate ?? null,
        };
      }
    }
  } catch {
    // fall through
  }

  // Fallback: plain facility (no permit entrance under it)
  try {
    const fRes = await fetch(`${BASE}/facilities/${id}`, { headers, ...cacheOpts });
    if (fRes.ok) {
      const rec = await fRes.json();
      return {
        id,
        name: rec.FacilityName || "",
        description: clean(rec.FacilityDescription),
        importantInfo: null,
        parking: null,
        directions: clean(rec.FacilityDirections),
        url: rec.FacilityURL || null,
        lastUpdated: rec.LastUpdatedDate ?? null,
      };
    }
  } catch {
    // fall through
  }

  return null;
}
