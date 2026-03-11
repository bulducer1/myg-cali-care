import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Download, FileSpreadsheet, Image, Plus, Eye } from "lucide-react";

type Raffle = {
  id: string;
  title: string;
  description: string | null;
  prize_image_url: string | null;
  draw_date: string;
  is_active: boolean;
  created_at: string;
};

type Entry = {
  id: number;
  full_name: string;
  phone: string;
  receipt_path: string;
  created_at: string;
  raffle_id: string;
};

const AdminRaffles = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [showCreateRaffle, setShowCreateRaffle] = useState(false);
  const [newRaffle, setNewRaffle] = useState({ title: "", description: "", draw_date: "", prize_image_url: "" });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin-login");
        return;
      }
      const { data: hasRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!hasRole) {
        navigate("/admin-login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Load raffles
  useEffect(() => {
    supabase.rpc("get_all_raffles").then(({ data }) => {
      if (data) setRaffles(data);
    });
  }, []);

  // Load entries when raffle selected
  useEffect(() => {
    if (!selectedRaffle) return;
    supabase
      .rpc("get_raffle_entries", { _raffle_id: selectedRaffle })
      .then(({ data }) => {
        if (data) setEntries(data);
      });
  }, [selectedRaffle]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const viewReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (data) setReceiptUrl(data.signedUrl);
  };

  const exportCSV = useCallback(() => {
    const headers = "ID,Nombre,Teléfono,Fecha\n";
    const rows = entries
      .map((e) => `${e.id},\"${e.full_name}\",\"${e.phone}\",\"${new Date(e.created_at).toLocaleDateString()}\"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participantes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const downloadAllReceipts = useCallback(async () => {
    // Download receipts one by one (avoids needing a ZIP library - keeps it lean)
    for (const entry of entries) {
      const safeName = entry.full_name.replace(/[^a-zA-Z0-9]/g, "");
      const fileName = `${String(entry.id).padStart(3, "0")}-${safeName}-${entry.phone}.jpg`;
      const { data } = await supabase.storage.from("receipts").createSignedUrl(entry.receipt_path, 300);
      if (data) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = fileName;
        a.click();
      }
    }
  }, [entries]);

  const createRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("raffles").insert({
      title: newRaffle.title,
      description: newRaffle.description || null,
      draw_date: new Date(newRaffle.draw_date).toISOString(),
      prize_image_url: newRaffle.prize_image_url || null,
      is_active: true,
    });
    if (!error) {
      setShowCreateRaffle(false);
      setNewRaffle({ title: "", description: "", draw_date: "", prize_image_url: "" });
      const { data } = await supabase.rpc("get_all_raffles");
      if (data) setRaffles(data);
    }
    setCreating(false);
  };

  const toggleRaffleActive = async (id: string, currentActive: boolean) => {
    await supabase.from("raffles").update({ is_active: !currentActive }).eq("id", id);
    const { data } = await supabase.rpc("get_all_raffles");
    if (data) setRaffles(data);
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <h1 className="font-heading font-bold text-lg">🎯 Panel de Rifas</h1>
        <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80">
          <LogOut className="w-4 h-4 mr-2" /> Salir
        </Button>
      </header>

      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Raffle management */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-xl text-foreground">Rifas</h2>
          <Button onClick={() => setShowCreateRaffle(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nueva Rifa
          </Button>
        </div>

        <div className="grid gap-3 mb-8">
          {raffles.map((r) => (
            <div
              key={r.id}
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors ${
                selectedRaffle === r.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
              onClick={() => setSelectedRaffle(r.id)}
            >
              <div>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Sorteo: {new Date(r.draw_date).toLocaleDateString()} •{" "}
                  <span className={r.is_active ? "text-accent" : "text-muted-foreground"}>
                    {r.is_active ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRaffleActive(r.id, r.is_active);
                }}
              >
                {r.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          ))}
        </div>

        {/* Entries table */}
        {selectedRaffle && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-heading font-bold text-lg text-foreground">
                Participantes ({entries.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="sm" onClick={exportCSV} disabled={!entries.length}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAllReceipts} disabled={!entries.length}>
                  <Download className="w-4 h-4 mr-1" /> Recibos
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Recibo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">#{String(entry.id).padStart(3, "0")}</TableCell>
                      <TableCell>{entry.full_name}</TableCell>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => viewReceipt(entry.receipt_path)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredEntries.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay participantes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Create Raffle Dialog */}
        <Dialog open={showCreateRaffle} onOpenChange={setShowCreateRaffle}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nueva rifa</DialogTitle>
            </DialogHeader>
            <form onSubmit={createRaffle} className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  required
                  maxLength={100}
                  value={newRaffle.title}
                  onChange={(e) => setNewRaffle((r) => ({ ...r, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  maxLength={500}
                  value={newRaffle.description}
                  onChange={(e) => setNewRaffle((r) => ({ ...r, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Fecha del sorteo</Label>
                <Input
                  type="datetime-local"
                  required
                  value={newRaffle.draw_date}
                  onChange={(e) => setNewRaffle((r) => ({ ...r, draw_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>URL imagen del premio (opcional)</Label>
                <Input
                  type="url"
                  maxLength={500}
                  value={newRaffle.prize_image_url}
                  onChange={(e) => setNewRaffle((r) => ({ ...r, prize_image_url: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Creando..." : "Crear rifa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Receipt viewer */}
        <Dialog open={!!receiptUrl} onOpenChange={() => setReceiptUrl(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Recibo</DialogTitle>
            </DialogHeader>
            {receiptUrl && <img src={receiptUrl} alt="Recibo" className="w-full rounded-lg" />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRaffles;
