import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (data) navigate("/admin/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          // Add admin role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "admin",
          });
          if (roleError) {
            // Role insert may fail due to RLS, but we proceed
            toast({ title: "Conta criada!", description: "Conta criada. Faça login para continuar." });
            setIsSignUp(false);
            setLoading(false);
            return;
          }
          toast({ title: "Conta admin criada!", description: "Faça login para acessar o painel." });
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });

        if (!isAdmin) {
          await supabase.auth.signOut();
          toast({ title: "Acesso negado", description: "Você não tem permissão de administrador.", variant: "destructive" });
          return;
        }

        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <h1 className="text-center font-display text-3xl tracking-wider text-card-foreground">
          ADMIN
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-secondary text-secondary-foreground"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-muted-foreground">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-secondary text-secondary-foreground"
              required
            />
          </div>
          <Button type="submit" className="w-full font-display tracking-wider" disabled={loading}>
            {loading ? (isSignUp ? "CRIANDO..." : "ENTRANDO...") : (isSignUp ? "CRIAR CONTA" : "ENTRAR")}
          </Button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? "Já tem conta? Faça login" : "Criar conta de admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
