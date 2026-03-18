import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Calendar, Power } from "lucide-react";
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

type Raffle = {
  id: string;
  title: string;
  description: string | null;
  draw_date: string;
  is_active: boolean;
  created_at: string;
  prize_image_url: string | null;
};

type RaffleForm = {
  title: string;
  description: string;
  draw_date: string;
  is_active: boolean;
  prize_image_url: string;
};

const emptyForm: RaffleForm = {
  title: "",
  description: "",
  draw_date: "",
  is_active: true,
  prize_image_url: "",
};

type Props = {
  raffles: Raffle[];
  selectedRaffle: string | null;
  onSelectRaffle: (id: string | null) => void;
  onRafflesChange: () => void;
};

const RaffleManager = ({ raffles, selectedRaffle, onSelectRaffle, onRafflesChange }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<RaffleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (r: Raffle) => {
    setEditing(r.id);
    setForm({
      title: r.title,
      description: r.description || "",
      draw_date: r.draw_date.slice(0, 16),
      is_active: r.is_active,
      prize_image_url: r.prize_image_url || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.draw_date) {
      setError("Título y fecha de sorteo son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      draw_date: new Date(form.draw_date).toISOString(),
      is_active: form.is_active,
      prize_image_url: form.prize_image_url.trim() || null,
    };

    let result;
    if (editing) {
      result = await supabase.from("raffles").update(payload).eq("id", editing);
    } else {
      result = await supabase.from("raffles").insert(payload);
    }

    if (result.error) {
      setError("Error al guardar: " + result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    onRafflesChange();
  };

  const toggleActive = async (r: Raffle) => {
    await supabase.from("raffles").update({ is_active: !r.is_active }).eq("id", r.id);
    onRafflesChange();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    // Delete entries and receipts first
    const { data: entries } = await supabase
      .from("raffle_entries")
      .select("receipt_path")
      .eq("raffle_id", deleteId);
    
    if (entries?.length) {
      await supabase.storage.from("receipts").remove(entries.map(e => e.receipt_path));
      await supabase.from("raffle_entries").delete().eq("raffle_id", deleteId);
    }
    
    await supabase.from("raffles").delete().eq("id", deleteId);
    
    if (selectedRaffle === deleteId) onSelectRaffle(null);
    setDeleteId(null);
    setDeleting(false);
    onRafflesChange();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-xl text-foreground">Sorteos</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo sorteo
        </Button>
      </div>

      <div className="grid gap-3 mb-8">
        {raffles.map((r) => (
          <div
            key={r.id}
            className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors ${
              selectedRaffle === r.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
            onClick={() => onSelectRaffle(r.id)}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{r.title}</h3>
              <p className="text-sm text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {new Date(r.draw_date).toLocaleDateString()} •{" "}
                <span className={r.is_active ? "text-accent" : "text-muted-foreground"}>
                  {r.is_active ? "✅ Activo" : "⏸️ Inactivo"}
                </span>
              </p>
            </div>
            <div className="flex gap-1 ml-3" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(r)} title={r.is_active ? "Desactivar" : "Activar"}>
                <Power className={`w-4 h-4 ${r.is_active ? "text-accent" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {!raffles.length && (
          <p className="text-muted-foreground text-center py-8">No hay sorteos creados.</p>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar sorteo" : "Nuevo sorteo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="raffle-title">Título *</Label>
              <Input
                id="raffle-title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Sorteo Navideño 2025"
              />
            </div>
            <div>
              <Label htmlFor="raffle-desc">Descripción</Label>
              <Textarea
                id="raffle-desc"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del sorteo..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="raffle-date">Fecha del sorteo *</Label>
              <Input
                id="raffle-date"
                type="datetime-local"
                value={form.draw_date}
                onChange={(e) => setForm(f => ({ ...f, draw_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="raffle-image">URL imagen del premio</Label>
              <Input
                id="raffle-image"
                value={form.prize_image_url}
                onChange={(e) => setForm(f => ({ ...f, prize_image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_active: checked }))}
              />
              <Label>Sorteo activo</Label>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear sorteo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este sorteo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán el sorteo, todos sus participantes y recibos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Eliminando..." : "Eliminar sorteo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RaffleManager;
