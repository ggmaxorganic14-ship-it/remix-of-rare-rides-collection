export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container text-center">
        <p className="font-display text-lg tracking-wider text-foreground">
          HW <span className="text-primary">COLLECTOR</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          © {new Date().getFullYear()} HW Collector. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
