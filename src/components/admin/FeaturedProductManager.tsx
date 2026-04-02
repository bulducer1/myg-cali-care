import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

type ProductForm = {
  title: string;
  description: string;
  price: string;
  image_url: string;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  image_url: "",
  is_active: false,
};

const FeaturedProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("featured_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      image_url: p.image_url || "",
      is_active: p.is_active,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setSaving(true);
    setError("");

    // If activating this product, deactivate others first
    if (form.is_active) {
      await supabase.from("featured_products").update({ is_active: false }).neq("id", editing || "");
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: form.price ? parseFloat(form.price) : null,
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };

    const result = editing
      ? await supabase.from("featured_products").update(payload).eq("id", editing)
      : await supabase.from("featured_products").insert(payload);

    if (result.error) {
      setError("Error: " + result.error.message);
    } else {
      setShowForm(false);
      loadProducts();
    }
    setSaving(false);
  };

  const toggleActive = async (p: Product) => {
    if (!p.is_active) {
      // Deactivate all others first
      await supabase.from("featured_products").update({ is_active: false }).neq("id", p.id);
    }
    await supabase.from("featured_products").update({ is_active: !p.is_active }).eq("id", p.id);
    loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("featured_products").delete().eq("id", deleteId);
    setDeleteId(null);
    loadProducts();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          Producto Estrella
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo producto
        </Button>
      </div>

      <div className="grid gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className={`border rounded-lg p-4 flex items-center gap-4 transition-colors ${
              p.is_active ? "border-accent bg-accent/5" : "border-border"
            }`}
          >
            {p.image_url ? (
              <img src={p.image_url} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
              <p className="text-sm text-muted-foreground">
                {p.price != null ? `$${Number(p.price).toLocaleString("es-CO")}` : "Sin precio"} •{" "}
                <span className={p.is_active ? "text-accent" : ""}>
                  {p.is_active ? "✅ Visible en la web" : "⏸️ Oculto"}
                </span>
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => toggleActive(p)} title={p.is_active ? "Ocultar" : "Mostrar"}>
                <Star className={`w-4 h-4 ${p.is_active ? "text-accent fill-accent" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {!products.length && (
          <p className="text-muted-foreground text-center py-6 text-sm">
            No hay productos estrella. Crea uno para destacar en tu página.
          </p>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto estrella"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del producto *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Vitamina C 1000mg" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beneficios y detalles del producto..." rows={3} />
            </div>
            <div>
              <Label>Precio (COP)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="25000" />
            </div>
            <div>
              <Label>URL de la imagen del producto</Label>
              <Input value={form.image_url} onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm(f => ({ ...f, is_active: checked }))} />
              <Label>Mostrar en la página (solo 1 activo a la vez)</Label>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará el producto estrella. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeaturedProductManager;
