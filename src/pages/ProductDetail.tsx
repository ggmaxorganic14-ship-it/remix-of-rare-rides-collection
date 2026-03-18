import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <Skeleton className="h-8 w-32" />
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-xl text-muted-foreground">Produto não encontrado</p>
          <Link to="/catalogo">
            <Button variant="outline" className="mt-4">Voltar ao catálogo</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : ["/placeholder.svg"];
  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no Hot Wheels "${car.name}" (R$ ${car.price.toFixed(2).replace(".", ",")}). Ele ainda está disponível?`
  );

  return (
    <Layout>
      <div className="container py-12">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={images[selectedImage]}
                alt={car.name}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-4xl tracking-wider text-foreground md:text-5xl">
              {car.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-sm bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                Hot Wheels
              </span>
              {car.year && (
                <span className="rounded-sm bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {car.year}
                </span>
              )}
              {car.series && (
                <span className="rounded-sm bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {car.series}
                </span>
              )}
              <span className="rounded-sm bg-secondary px-3 py-1 text-sm capitalize text-secondary-foreground">
                {car.condition === "novo" ? "Novo" : "Usado"}
              </span>
            </div>

            <p className="mt-6 font-display text-5xl text-primary">
              R$ {car.price.toFixed(2).replace(".", ",")}
            </p>

            {car.description && (
              <div className="mt-6">
                <h3 className="font-display text-lg tracking-wide text-foreground">DESCRIÇÃO</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{car.description}</p>
              </div>
            )}

            <a
              href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="mt-8 w-full font-display text-lg tracking-wider sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" />
                COMPRAR VIA WHATSAPP
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
