import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { EnrichedContact } from "../types/apollo";

const TSV_HEADERS = [
  "Nombre", "Cargo", "Headline", "Email", "Estado Email",
  "Teléfono", "LinkedIn", "Ciudad", "País", "Empresa", "Dominio",
];

function buildTSV(contacts: EnrichedContact[]): string {
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

  return [TSV_HEADERS, ...rows]
    .map((row) => row.map((cell) => String(cell).replace(/\t/g, " ")).join("\t"))
    .join("\n");
}

export function CopyButton({ contacts }: { contacts: EnrichedContact[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildTSV(contacts));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copiado!" : "Copiar tabla"}
    </button>
  );
}
