import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os Hot Wheels disponíveis."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-primary-foreground" />
    </a>
  );
}
