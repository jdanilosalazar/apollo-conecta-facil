import { Search } from "lucide-react";

interface Props {
  url: string;
  setUrl: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function SearchForm({ url, setUrl, onSubmit, isLoading }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-card border border-border rounded-xl shadow-sm p-5 animate-fade-in"
    >
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">
          URL de la empresa
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.ejemplo.com"
            required
            disabled={isLoading}
            className="flex-1 bg-background border border-border rounded-lg px-5 py-4 text-base font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </div>
    </form>
  );
}
