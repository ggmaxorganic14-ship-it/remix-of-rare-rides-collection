import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { CarCard } from "@/components/CarCard";
import { CatalogFilters, type Filters } from "@/components/CatalogFilters";
import { Skeleton } from "@/components/ui/skeleton";

const Catalog = () => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    condition: "all",
    sortPrice: "none",
    series: "all",
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const seriesOptions = useMemo(() => {
    if (!cars) return [];
    const series = cars.map((c) => c.series).filter(Boolean) as string[];
    return [...new Set(series)];
  }, [cars]);

  const filtered = useMemo(() => {
    if (!cars) return [];
    let result = [...cars];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filters.condition !== "all") {
      result = result.filter((c) => c.condition === filters.condition);
    }
    if (filters.series !== "all") {
      result = result.filter((c) => c.series === filters.series);
    }
    if (filters.sortPrice === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortPrice === "desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [cars, filters]);

  return (
    <Layout>
      <section className="container py-12">
        <h1 className="font-display text-4xl tracking-wider text-foreground md:text-5xl">
          CATÁLOGO
        </h1>
        <p className="mt-2 text-muted-foreground">
          {filtered.length} modelo{filtered.length !== 1 ? "s" : ""} disponíve{filtered.length !== 1 ? "is" : "l"}
        </p>

        <div className="mt-6">
          <CatalogFilters filters={filters} onFiltersChange={setFilters} seriesOptions={seriesOptions} />
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-xl text-muted-foreground">Nenhum modelo encontrado</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Catalog;
