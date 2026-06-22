import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { EnrichedContact } from "../types/apollo";
import { buildCSV } from "./ExportButton";

export function CopyButton({ contacts }: { contacts: EnrichedContact[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildCSV(contacts));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copiado!" : "Copiar CSV"}
    </button>
  );
}
