import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];

const emptyForm: CarInsert = {
  name: "",
  price: 0,
  description: "",
  year: undefined,
  series: "",
  condition: "novo",
  featured: false,
  images: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarInsert>(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        await supabase.auth.signOut();
        navigate("/admin");
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: cars, isLoading } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (car: CarInsert & { id?: string }) => {
      if (car.id) {
        const { error } = await supabase.from("cars").update(car).eq("id", car.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cars").insert(car);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setDialogOpen(false);
      setEditingCar(null);
      setForm(emptyForm);
      toast({ title: editingCar ? "Carro atualizado!" : "Carro adicionado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      toast({ title: "Carro excluído!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setForm({
      name: car.name,
      price: car.price,
      description: car.description || "",
      year: car.year || undefined,
      series: car.series || "",
      condition: car.condition,
      featured: car.featured || false,
      images: car.images || [],
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCar(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [...(form.images || [])];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from("car-images").upload(path, file);
      if (error) {
        toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("car-images").getPublicUrl(path);
      newImages.push(urlData.publicUrl);
    }

    setForm({ ...form, images: newImages });
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...(form.images || [])];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      price: Number(form.price),
    };
    if (editingCar) {
      saveMutation.mutate({ ...payload, id: editingCar.id });
    } else {
      saveMutation.mutate(payload);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-2xl tracking-wider text-card-foreground">
            PAINEL <span className="text-primary">ADMIN</span>
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={handleNew} size="sm" className="font-display tracking-wider">
              <Plus className="mr-1 h-4 w-4" /> NOVO CARRO
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
              <LogOut className="mr-1 h-4 w-4" /> SAIR
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : !cars || cars.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-muted-foreground">Nenhum carro cadastrado</p>
            <Button onClick={handleNew} className="mt-4 font-display tracking-wider">
              <Plus className="mr-1 h-4 w-4" /> ADICIONAR PRIMEIRO CARRO
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Imagem</th>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Preço</th>
                  <th className="px-4 py-3 text-left font-medium">Condição</th>
                  <th className="px-4 py-3 text-left font-medium">Série</th>
                  <th className="px-4 py-3 text-left font-medium">Destaque</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <img
                        src={car.images?.[0] || "/placeholder.svg"}
                        alt={car.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{car.name}</td>
                    <td className="px-4 py-3 text-primary">R$ {car.price.toFixed(2).replace(".", ",")}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{car.condition}</td>
                    <td className="px-4 py-3 text-muted-foreground">{car.series || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{car.featured ? "⭐" : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(car)} className="text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir?")) {
                            deleteMutation.mutate(car.id);
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Car Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card text-card-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wider">
              {editingCar ? "EDITAR CARRO" : "NOVO CARRO"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-secondary text-secondary-foreground"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary text-secondary-foreground"
                  required
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Ano</Label>
                <Input
                  type="number"
                  value={form.year || ""}
                  onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-secondary text-secondary-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Série</Label>
                <Input
                  value={form.series || ""}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
                  className="bg-secondary text-secondary-foreground"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Condição</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger className="bg-secondary text-secondary-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-secondary text-secondary-foreground"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured || false}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
              <Label className="text-muted-foreground">Exibir em destaque na home</Label>
            </div>
            <div>
              <Label className="text-muted-foreground">Fotos</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="mt-1 bg-secondary text-secondary-foreground"
                disabled={uploading}
              />
              {uploading && <p className="mt-1 text-sm text-muted-foreground">Enviando...</p>}
              {form.images && form.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="group relative h-20 w-20">
                      <img src={img} alt="" className="h-full w-full rounded object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full font-display tracking-wider"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "SALVANDO..." : "SALVAR"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
