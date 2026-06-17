import { Linkedin } from "lucide-react";
import type { EnrichedContact } from "../types/apollo";

const statusColors: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "likely to engage": "bg-blue-100 text-blue-700 border border-blue-200",
  "accept all": "bg-yellow-100 text-yellow-700 border border-yellow-200",
  unverified: "bg-gray-100 text-gray-600 border border-gray-200",
  invalid: "bg-red-100 text-red-700 border border-red-200",
};

const statusLabels: Record<string, string> = {
  verified: "Verificado",
  "likely to engage": "Probable",
  "accept all": "Acepta todo",
  unverified: "Sin verificar",
  invalid: "Inválido",
};

const Empty = () => <span className="text-muted-foreground/40">—</span>;

function truncate(s: string | null, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function ResultsTable({ contacts }: { contacts: EnrichedContact[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm animate-fade-in">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            {[
              "Nombre",
              "Cargo",
              "Headline",
              "Email",
              "Estado Email",
              "Teléfono",
              "LinkedIn",
              "Ciudad",
              "Empresa",
              "Dominio",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => {
            const phone = c.phone_numbers?.[0]?.raw_number;
            const company =
              c.organization_name ?? c.organization?.name ?? c.account?.name ?? "";
            const dom = c.organization?.primary_domain ?? c.account?.domain ?? "";
            const status = c.email_status ?? "";
            return (
              <tr
                key={c.id ?? i}
                className="border-t border-border hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  {c.name || <Empty />}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{c.title || <Empty />}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.headline ? truncate(c.headline, 40) : <Empty />}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {c.email ? (
                    <a
                      href={`mailto:${c.email}`}
                      className="text-primary hover:underline"
                    >
                      {c.email}
                    </a>
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {status ? (
                    <span
                      className={`inline-block text-xs font-mono px-2 py-1 rounded-full ${
                        statusColors[status] ?? statusColors.unverified
                      }`}
                    >
                      {statusLabels[status] ?? status}
                    </span>
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {phone ? (
                    <a href={`tel:${phone}`} className="text-primary hover:underline">
                      {phone}
                    </a>
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="px-4 py-3">
                  {c.linkedin_url ? (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:opacity-70 inline-flex"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {c.city || c.country ? (
                    [c.city, c.country].filter(Boolean).join(", ")
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{company || <Empty />}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {dom || <Empty />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
