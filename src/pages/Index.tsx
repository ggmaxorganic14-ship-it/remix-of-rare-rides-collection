import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { CarCard } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { data: featuredCars } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("featured", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 container text-center">
          <h1 className="animate-fade-in font-display text-5xl tracking-wider text-foreground md:text-7xl">
            COLEÇÃO <span className="text-gradient">PREMIUM</span>
          </h1>
          <h1 className="font-display text-5xl tracking-wider text-foreground md:text-7xl">
            DE HOT WHEELS
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
            Modelos exclusivos para colecionadores
          </p>
          <Link to="/catalogo">
            <Button size="lg" className="mt-8 font-display text-lg tracking-wider">
              VER CATÁLOGO
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featuredCars && featuredCars.length > 0 && (
        <section className="container py-20">
          <h2 className="text-center font-display text-3xl tracking-wider text-foreground md:text-4xl">
            EM <span className="text-primary">DESTAQUE</span>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border bg-card py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl tracking-wider text-card-foreground md:text-4xl">
            ENCONTRE SEU <span className="text-primary">PRÓXIMO</span> MODELO
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Navegue pelo nosso catálogo completo com modelos raros, séries especiais e edições limitadas.
          </p>
          <Link to="/catalogo">
            <Button size="lg" variant="outline" className="mt-8 font-display text-lg tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              EXPLORAR CATÁLOGO
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
