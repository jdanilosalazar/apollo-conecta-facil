import { useState, useCallback } from "react";
import type { EnrichedContact, SearchStatus } from "../types/apollo";

const WEBHOOK_URL =
  "https://n8n.jdanilosalazar.lat/webhook/c0d626d7-ff33-41d1-9e8b-1394ce10eb78";

const LOADING_MESSAGES = [
  "Enviando solicitud al flujo...",
  "Buscando contactos en la organización...",
  "Analizando perfiles encontrados...",
  "Enriqueciendo correos electrónicos...",
  "Procesando resultados...",
  "Casi listo...",
];

function extractContacts(payload: any): any[] {
  if (Array.isArray(payload)) {
    // n8n often wraps each item as { json: {...} }
    if (payload.length && payload[0] && typeof payload[0] === "object" && "json" in payload[0]) {
      return payload.map((item: any) => item.json);
    }
    return payload;
  }
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.contacts)) return payload.contacts;
    if (Array.isArray(payload.people)) return payload.people;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
  }
  return [];
}

function normalize(raw: any): EnrichedContact {
  // Map Spanish n8n field names to the EnrichedContact interface
  if ("Nombre" in raw || "Cargo" in raw) {
    const emailRaw: string = raw["Email"] ?? "";
    const email = emailRaw.startsWith("=") ? emailRaw.slice(1) : emailRaw;

    const ciudadRaw: string = raw["Ciudad"] ?? "";
    const ciudadParts = ciudadRaw.split(",").map((s: string) => s.trim());
    const city = ciudadParts.length > 1 ? ciudadParts.slice(0, -1).join(", ") : ciudadRaw;
    const country = ciudadParts.length > 1 ? ciudadParts[ciudadParts.length - 1] : "";

    const phone: string = raw["Teléfono"] ?? "";
    const dominio: string | null = raw["Dominio"] ?? null;

    return {
      id: raw["ID Contacto"] ?? raw["Person ID"] ?? "",
      name: raw["Nombre"] ?? "",
      first_name: (raw["Nombre"] ?? "").split(" ")[0] ?? "",
      last_name: (raw["Nombre"] ?? "").split(" ").slice(1).join(" ") ?? "",
      title: raw["Cargo"] ?? "",
      headline: raw["Headline"] || null,
      email: email || null,
      email_status: raw["Email Status"] || null,
      phone_numbers: phone ? [{ raw_number: phone, type: "other" }] : [],
      linkedin_url: raw["LinkedIn"] || null,
      city: city || null,
      state: null,
      country: country || null,
      organization_name: raw["Empresa"] || null,
      organization: dominio ? { primary_domain: dominio, name: raw["Empresa"] } : undefined,
      account: undefined,
      personal_emails: [],
      enriched: Boolean(email),
    };
  }

  // Fallback: English Apollo field names
  return {
    ...raw,
    personal_emails: Array.isArray(raw?.personal_emails) ? raw.personal_emails : [],
    enriched: raw?.enriched ?? Boolean(raw?.email),
  };
}

export function useApolloSearch() {
  const [state, setState] = useState<SearchStatus>({ status: "idle" });

  const search = useCallback(async (companyUrl: string) => {
    setState({ status: "loading", message: LOADING_MESSAGES[0], progress: 0 });

    let domain = companyUrl.trim();
    try {
      const parsed = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
      domain = parsed.hostname.replace(/^www\./, "");
    } catch {
      // keep as-is
    }

    // Animate intermediate progress messages while we wait for n8n.
    let step = 1;
    const interval = setInterval(() => {
      if (step < LOADING_MESSAGES.length - 1) {
        setState({ status: "loading", message: LOADING_MESSAGES[step], progress: step });
        step++;
      }
    }, 1200);

    try {
      const params = new URLSearchParams({ url: companyUrl.trim(), domain });
      const response = await fetch(`${WEBHOOK_URL}?${params}`, {
        method: "GET",
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`El flujo respondió con estado ${response.status}.`);
      }

      const data = await response.json().catch(() => null);
      const rawContacts = extractContacts(data);

      if (rawContacts.length === 0) {
        setState({
          status: "error",
          message: `No se encontraron contactos para "${domain}". Verifica la URL e intenta nuevamente.`,
        });
        return;
      }

      const contacts = rawContacts.map(normalize);
      const searchDate: string | null =
        (data && typeof data === "object" && typeof data.search_date === "string")
          ? data.search_date
          : null;
      const originalUrl: string | null =
        (data && typeof data === "object" && typeof data.original_url === "string")
          ? data.original_url
          : null;
      setState({ status: "success", contacts, domain, searchDate, originalUrl });
    } catch (err) {
      clearInterval(interval);
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "La búsqueda falló. Intenta nuevamente.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, search, reset };
}
