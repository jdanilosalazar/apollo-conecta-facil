import { Download } from "lucide-react";
import type { EnrichedContact } from "../types/apollo";

const CSV_HEADERS = [
  "Nombre",
  "Cargo",
  "Headline",
  "Email",
  "Estado Email",
  "Teléfono",
  "LinkedIn",
  "Ciudad",
  "País",
  "Empresa",
  "Dominio",
];

export function buildCSV(contacts: EnrichedContact[]): string {
  const rows = contacts.map((c) => [
    c.name ?? "",
    c.title ?? "",
    c.headline ?? "",
    c.email ?? "",
    c.email_status ?? "",
    c.phone_numbers?.[0]?.raw_number ?? "",
    c.linkedin_url ?? "",
    c.city ?? "",
    c.country ?? "",
    c.organization_name ?? c.organization?.name ?? c.account?.name ?? "",
    c.organization?.primary_domain ?? c.account?.domain ?? "",
  ]);

  return [CSV_HEADERS, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

function exportToCSV(contacts: EnrichedContact[], domain: string) {
  const csvContent = buildCSV(contacts);

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apollo-contactos-${domain}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({
  contacts,
  domain,
}: {
  contacts: EnrichedContact[];
  domain: string;
}) {
  return (
    <button
      onClick={() => exportToCSV(contacts, domain)}
      className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </button>
  );
}
