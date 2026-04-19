import { Clock, Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
        <Clock className="w-7 h-7 text-primary-foreground" />
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  );
}
