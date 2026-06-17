import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import type { ApolloConfig } from "../types/apollo";

interface Props {
  config: ApolloConfig;
  setConfig: (c: ApolloConfig) => void;
}

export function ConfigPanel({ config, setConfig }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card border border-border rounded-xl shadow-sm animate-fade-in"
    >
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-5 py-4 text-left">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Configuración</span>
        <ChevronDown
          className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground block">
              API Key de Apollo
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="••••••••••••••••••••••••"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              Obtén tu API key en Settings → Integrations → API Keys en Apollo.io
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground block">
              Cargos a buscar
            </label>
            <p className="text-xs text-muted-foreground">
              Un cargo por línea. Se buscarán exactamente estos títulos.
            </p>
            <textarea
              value={config.personTitles.join("\n")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  personTitles: e.target.value
                    .split("\n")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              rows={8}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {config.personTitles.length} cargo(s) configurado(s)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground block">
              Resultados por página
            </label>
            <select
              value={config.perPage}
              onChange={(e) =>
                setConfig({ ...config, perPage: Number(e.target.value) })
              }
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>5 contactos</option>
              <option value={10}>10 contactos</option>
              <option value={25}>25 contactos</option>
              <option value={50}>50 contactos</option>
            </select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
