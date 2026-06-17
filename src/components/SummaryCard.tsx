import type { EnrichedContact } from "../types/apollo";

export function SummaryCard({
  contacts,
  domain,
}: {
  contacts: EnrichedContact[];
  domain: string;
}) {
  const total = contacts.length;
  const withAnyEmail = contacts.filter((c) => c.email).length;
  const withPhone = contacts.filter((c) => c.phone_numbers?.length > 0).length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 animate-fade-in w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Resultados para
          </p>
          <h2 className="text-lg font-bold text-foreground font-mono">{domain}</h2>
        </div>
        <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-mono font-semibold">
          {total} contacto{total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">Contactos encontrados</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-600">
            {withAnyEmail}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Con email</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold font-mono text-primary">{withPhone}</p>
          <p className="text-xs text-muted-foreground mt-1">Con teléfono</p>
        </div>
      </div>
    </div>
  );
}
