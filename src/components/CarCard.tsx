import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const imageUrl = car.images && car.images.length > 0
    ? car.images[0]
    : "/placeholder.svg";

  return (
    <Link
      to={`/produto/${car.id}`}
      className="group card-hover block overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg tracking-wide text-card-foreground">
          {car.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {car.year && (
            <span className="text-xs text-muted-foreground">{car.year}</span>
          )}
          {car.series && (
            <span className="text-xs text-muted-foreground">• {car.series}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-block rounded-sm bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
            {car.condition === "novo" ? "Novo" : "Usado"}
          </span>
          <span className="font-display text-xl text-primary">
            R$ {car.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </Link>
  );
}
