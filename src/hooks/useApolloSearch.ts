import { useState, useCallback } from "react";
import type { ApolloConfig, EnrichedContact, SearchStatus } from "../types/apollo";

const LOADING_MESSAGES = [
  "Conectando con Apollo.io...",
  "Buscando contactos en la organización...",
  "Analizando perfiles encontrados...",
  "Enriqueciendo correos electrónicos...",
  "Procesando resultados...",
  "Casi listo...",
];

export function useApolloSearch() {
  const [state, setState] = useState<SearchStatus>({ status: "idle" });

  const search = useCallback(async (companyUrl: string, config: ApolloConfig) => {
    if (!config.apiKey.trim()) {
      setState({ status: "error", message: "Por favor ingresa tu API key de Apollo." });
      return;
    }

    setState({ status: "loading", message: LOADING_MESSAGES[0], progress: 0 });

    let domain = companyUrl.trim();
    try {
      const parsed = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
      domain = parsed.hostname.replace(/^www\./, "");
    } catch {
      // keep as-is
    }

    try {
      setState({ status: "loading", message: LOADING_MESSAGES[1], progress: 1 });

      const searchPayload = {
        api_key: config.apiKey,
        q_organization_domains: domain,
        person_titles: config.personTitles,
        per_page: config.perPage,
        page: 1,
      };

      const searchResponse = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify(searchPayload),
      });

      if (searchResponse.status === 429) {
        throw new Error("Límite de solicitudes de Apollo alcanzado. Espera un momento y vuelve a intentarlo.");
      }
      if (searchResponse.status === 401) {
        throw new Error("API key de Apollo inválida o sin permisos. Verifica tu configuración.");
      }
      if (!searchResponse.ok) {
        throw new Error(`Error en la búsqueda de Apollo (estado ${searchResponse.status}).`);
      }

      const searchData = await searchResponse.json();

      const rawContacts: any[] = [
        ...(Array.isArray(searchData.contacts) ? searchData.contacts : []),
        ...(Array.isArray(searchData.people) ? searchData.people : []),
      ];

      if (rawContacts.length === 0) {
        setState({
          status: "error",
          message: `No se encontraron contactos para el dominio "${domain}". Prueba con diferentes títulos o verifica la URL.`,
        });
        return;
      }

      setState({ status: "loading", message: LOADING_MESSAGES[2], progress: 2 });

      const enriched: EnrichedContact[] = [];
      const total = rawContacts.length;

      for (let i = 0; i < total; i++) {
        const contact = rawContacts[i];
        const progressMsg = `${LOADING_MESSAGES[3]} (${i + 1}/${total})`;
        setState({
          status: "loading",
          message: progressMsg,
          progress: 3 + Math.floor((i / total) * 2),
        });

        try {
          const matchPayload: any = {
            api_key: config.apiKey,
            reveal_personal_emails: true,
          };

          if (contact.id) matchPayload.id = contact.id;
          else if (contact.first_name && contact.last_name) {
            matchPayload.first_name = contact.first_name;
            matchPayload.last_name = contact.last_name;
            matchPayload.domain = domain;
          }

          const matchResponse = await fetch("https://api.apollo.io/v1/people/match", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
            body: JSON.stringify(matchPayload),
          });

          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            const person = matchData.person ?? matchData;
            enriched.push({
              ...contact,
              personal_emails: person?.personal_emails ?? [],
              email: person?.email ?? contact.email,
              email_status: person?.email_status ?? contact.email_status,
              enriched: true,
            });
          } else {
            enriched.push({ ...contact, personal_emails: [], enriched: false });
          }

          if (i < total - 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        } catch {
          enriched.push({ ...contact, personal_emails: [], enriched: false });
        }
      }

      setState({ status: "loading", message: LOADING_MESSAGES[5], progress: 5 });
      await new Promise((r) => setTimeout(r, 400));

      setState({ status: "success", contacts: enriched, domain });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "La búsqueda falló. Intenta nuevamente.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, search, reset };
}
