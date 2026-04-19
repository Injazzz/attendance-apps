import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface Props {
  meta: Meta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: Props) {
  if (meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
      <p>
        Menampilkan {(meta.current_page - 1) * meta.per_page + 1}–
        {Math.min(meta.current_page * meta.per_page, meta.total)} dari{" "}
        {meta.total} data
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="min-w-16 text-center">
          {meta.current_page} / {meta.last_page}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
