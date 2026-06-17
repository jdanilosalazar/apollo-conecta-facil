import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { SearchForm } from "../components/SearchForm";
import { SearchLoading } from "../components/SearchLoading";
import { SummaryCard } from "../components/SummaryCard";
import { ResultsTable } from "../components/ResultsTable";
import { ExportButton } from "../components/ExportButton";
import { useApolloSearch } from "../hooks/useApolloSearch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apollo People Finder" },
      {
        name: "description",
        content:
          "Encuentra tomadores de decisión en cualquier empresa con datos de contacto verificados.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [url, setUrl] = useState("");
  const { state, search, reset } = useApolloSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    search(url.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <header className="space-y-2 py-4 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Apollo People Finder
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Encuentra contactos clave
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Ingresa una URL de empresa y encuentra a los tomadores de decisión con
            sus datos de contacto.
          </p>
        </header>

        <SearchForm
          url={url}
          setUrl={setUrl}
          onSubmit={handleSubmit}
          isLoading={state.status === "loading"}
        />

        {state.status === "loading" && (
          <SearchLoading message={state.message} progress={state.progress} />
        )}

        {state.status === "error" && (
          <div className="bg-card border border-destructive/30 rounded-xl shadow-sm p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">
                  No se pudo completar la búsqueda
                </p>
                <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              ← Intentar nuevamente
            </button>
          </div>
        )}

        {state.status === "success" && (
          <div className="space-y-4 animate-fade-in">
            <SummaryCard contacts={state.contacts} domain={state.domain} />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground font-mono">
                {state.contacts.length} resultado(s) encontrados
              </p>
              <ExportButton contacts={state.contacts} domain={state.domain} />
            </div>
            <ResultsTable contacts={state.contacts} />
            <button
              onClick={reset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              ← Nueva búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
