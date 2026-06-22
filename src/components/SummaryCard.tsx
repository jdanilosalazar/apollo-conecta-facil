import type { EnrichedContact } from "../types/apollo";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function SummaryCard({
  contacts,
  domain,
  searchDate,
  originalUrl,
}: {
  contacts: EnrichedContact[];
  domain: string;
  searchDate: string | null;
  originalUrl: string | null;
}) {
  const total = contacts.length;
  const withAnyEmail = contacts.filter((c) => c.email).length;
  const withPhone = contacts.filter((c) => (c.phone_numbers?.length ?? 0) > 0).length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 animate-fade-in w-full">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Resultados para
          </p>
          <h2 className="text-lg font-bold text-foreground font-mono truncate">{domain}</h2>
          {originalUrl && (
            <a
              href={originalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono truncate block"
            >
              {originalUrl}
            </a>
          )}
          {searchDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Buscado el {formatDate(searchDate)}
            </p>
          )}
        </div>
        <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-mono font-semibold shrink-0">
          {total} contacto{total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">Contactos encontrados</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-600">{withAnyEmail}</p>
          <p className="text-xs text-muted-foreground mt-1">Con email</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-primary">{withPhone}</p>
          <p className="text-xs text-muted-foreground mt-1">Con teléfono</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Emails encontrados</span>
            <span className="font-mono">{withAnyEmail}/{total} ({Math.round((withAnyEmail / total) * 100)}%)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((withAnyEmail / total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
