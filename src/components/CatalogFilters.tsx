import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Filters {
  search: string;
  condition: string;
  sortPrice: string;
  series: string;
}

interface CatalogFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  seriesOptions: string[];
}

export function CatalogFilters({ filters, onFiltersChange, seriesOptions }: CatalogFiltersProps) {
  const update = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
      <Input
        placeholder="Buscar modelo..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="bg-secondary text-secondary-foreground placeholder:text-muted-foreground"
      />
      <Select value={filters.condition} onValueChange={(v) => update("condition", v)}>
        <SelectTrigger className="w-full bg-secondary text-secondary-foreground sm:w-40">
          <SelectValue placeholder="Condição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="novo">Novo</SelectItem>
          <SelectItem value="usado">Usado</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.sortPrice} onValueChange={(v) => update("sortPrice", v)}>
        <SelectTrigger className="w-full bg-secondary text-secondary-foreground sm:w-40">
          <SelectValue placeholder="Preço" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Ordenar por</SelectItem>
          <SelectItem value="asc">Menor preço</SelectItem>
          <SelectItem value="desc">Maior preço</SelectItem>
        </SelectContent>
      </Select>
      {seriesOptions.length > 0 && (
        <Select value={filters.series} onValueChange={(v) => update("series", v)}>
          <SelectTrigger className="w-full bg-secondary text-secondary-foreground sm:w-40">
            <SelectValue placeholder="Série" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas séries</SelectItem>
            {seriesOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
