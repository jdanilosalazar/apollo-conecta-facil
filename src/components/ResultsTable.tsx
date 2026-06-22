import { useState, useMemo } from "react";
import { Linkedin, Mail, Phone, ChevronUp, ChevronDown, Search } from "lucide-react";
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

type SortKey = "name" | "title" | "email_status" | "city" | "organization_name";
type SortDir = "asc" | "desc";

function ContactCard({ c, i }: { c: EnrichedContact; i: number }) {
  const phone = c.phone_numbers?.[0]?.raw_number;
  const company = c.organization_name ?? c.organization?.name ?? c.account?.name ?? "";
  const status = c.email_status ?? "";
  const location = [c.city, c.country].filter(Boolean).join(", ");
  const noEmail = !c.email;

  return (
    <div
      key={c.id ?? i}
      className={`bg-card border border-border rounded-xl p-4 space-y-2 shadow-sm transition-opacity ${noEmail ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{c.name || "—"}</p>
          <p className="text-sm text-muted-foreground">{c.title || ""}</p>
        </div>
        {c.linkedin_url && (
          <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:opacity-70 shrink-0 mt-0.5">
            <Linkedin className="w-4 h-4" />
          </a>
        )}
      </div>

      {company && <p className="text-xs font-mono text-muted-foreground">{company}</p>}

      {c.email && (
        <div className="flex items-center gap-2 flex-wrap">
          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <a href={`mailto:${c.email}`} className="text-xs font-mono text-primary hover:underline break-all">{c.email}</a>
          {status && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${statusColors[status] ?? statusColors.unverified}`}>
              {statusLabels[status] ?? status}
            </span>
          )}
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <a href={`tel:${phone}`} className="text-xs font-mono text-primary hover:underline">{phone}</a>
        </div>
      )}

      {location && <p className="text-xs text-muted-foreground">{location}</p>}
    </div>
  );
}

export function ResultsTable({ contacts }: { contacts: EnrichedContact[] }) {
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const availableStatuses = useMemo(() => {
    const set = new Set(contacts.map((c) => c.email_status).filter(Boolean) as string[]);
    return Array.from(set);
  }, [contacts]);

  const filtered = useMemo(() => {
    let result = contacts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name ?? "").toLowerCase().includes(q) ||
          (c.title ?? "").toLowerCase().includes(q) ||
          (c.organization_name ?? c.organization?.name ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
      );
    }

    if (emailFilter === "no-email") {
      result = result.filter((c) => !c.email);
    } else if (emailFilter !== "all") {
      result = result.filter((c) => c.email_status === emailFilter);
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aVal = "";
        let bVal = "";
        if (sortKey === "name") { aVal = a.name ?? ""; bVal = b.name ?? ""; }
        else if (sortKey === "title") { aVal = a.title ?? ""; bVal = b.title ?? ""; }
        else if (sortKey === "email_status") { aVal = a.email_status ?? ""; bVal = b.email_status ?? ""; }
        else if (sortKey === "city") { aVal = a.city ?? ""; bVal = b.city ?? ""; }
        else if (sortKey === "organization_name") {
          aVal = a.organization_name ?? a.organization?.name ?? "";
          bVal = b.organization_name ?? b.organization?.name ?? "";
        }
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [contacts, search, emailFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="opacity-25 ml-1 text-[10px]">↕</span>;
    return sortDir === "asc"
      ? <ChevronUp className="inline w-3 h-3 ml-0.5" />
      : <ChevronDown className="inline w-3 h-3 ml-0.5" />;
  };

  const chips = [
    { key: "all", label: "Todos" },
    ...availableStatuses.map((s) => ({ key: s, label: statusLabels[s] ?? s })),
    { key: "no-email", label: "Sin email" },
  ];

  const columns: { label: string; key: SortKey | null }[] = [
    { label: "Nombre", key: "name" },
    { label: "Cargo", key: "title" },
    { label: "Headline", key: null },
    { label: "Email", key: null },
    { label: "Estado Email", key: "email_status" },
    { label: "Teléfono", key: null },
    { label: "LinkedIn", key: null },
    { label: "Ciudad", key: "city" },
    { label: "Empresa", key: "organization_name" },
    { label: "Dominio", key: null },
  ];

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setEmailFilter(chip.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-mono ${
                emailFilter === chip.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay resultados para ese filtro.
        </p>
      )}

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3 animate-fade-in">
        {filtered.map((c, i) => (
          <ContactCard key={c.id ?? i} c={c} i={i} />
        ))}
      </div>

      {/* Desktop: table */}
      {filtered.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm animate-fade-in">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {columns.map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={() => key && handleSort(key)}
                    className={`text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap ${
                      key ? "cursor-pointer hover:text-foreground select-none" : ""
                    }`}
                  >
                    {label}
                    {key && <SortIcon k={key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const phone = c.phone_numbers?.[0]?.raw_number;
                const company = c.organization_name ?? c.organization?.name ?? c.account?.name ?? "";
                const dom = c.organization?.primary_domain ?? c.account?.domain ?? "";
                const status = c.email_status ?? "";
                const noEmail = !c.email;
                return (
                  <tr
                    key={c.id ?? i}
                    className={`border-t border-border transition-colors ${
                      noEmail ? "opacity-40 hover:opacity-60" : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{c.name || <Empty />}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.title || <Empty />}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.headline ? truncate(c.headline, 40) : <Empty />}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                      ) : <Empty />}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {status ? (
                        <span className={`inline-block text-xs font-mono px-2 py-1 rounded-full ${statusColors[status] ?? statusColors.unverified}`}>
                          {statusLabels[status] ?? status}
                        </span>
                      ) : <Empty />}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {phone ? <a href={`tel:${phone}`} className="text-primary hover:underline">{phone}</a> : <Empty />}
                    </td>
                    <td className="px-4 py-3">
                      {c.linkedin_url ? (
                        <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:opacity-70 inline-flex">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      ) : <Empty />}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {c.city || c.country ? [c.city, c.country].filter(Boolean).join(", ") : <Empty />}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{company || <Empty />}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{dom || <Empty />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
