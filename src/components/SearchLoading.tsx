const TOTAL_STEPS = 6;

export function SearchLoading({
  message,
  progress,
}: {
  message: string;
  progress: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-mono text-muted-foreground text-center max-w-xs">
        {message}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= progress ? "bg-primary scale-110" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
