import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
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
import {
  LogOut,
  Download,
  FileSpreadsheet,
  Eye,
  Trash2,
  AlertTriangle,
  Search,
  FileText,
} from "lucide-react";

type Entry = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  receipt_path: string;
  created_at: string;
  raffle_id: string;
};

type Raffle = {
  id: string;
  title: string;
  description: string | null;
  draw_date: string;
  is_active: boolean;
  created_at: string;
};

const AdminPanel = () => {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isAdmin = await verifyAdmin(session.user.email || "");
        if (isAdmin) {
          setAuthed(true);
        } else {
          await supabase.auth.signOut();
          setLoginError("Tu correo no está autorizado para acceder al panel.");
        }
      }
      setChecking(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const isAdmin = await verifyAdmin(session.user.email || "");
        if (isAdmin) {
          setAuthed(true);
          setLoginError("");
        } else {
          await supabase.auth.signOut();
          setLoginError("Tu correo no está autorizado para acceder al panel.");
        }
      } else {
        setAuthed(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdmin = async (email: string): Promise<boolean> => {
    const { data } = await supabase.rpc("is_admin_email", { _email: email });
    return !!data;
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setLoginError("Error al iniciar sesión con Google.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  // Load raffles when authed
  useEffect(() => {
    if (!authed) return;
    supabase.rpc("get_all_raffles").then(({ data }) => {
      if (data) setRaffles(data);
    });
  }, [authed]);

  // Load entries when raffle selected
  useEffect(() => {
    if (!selectedRaffle) return;
    loadEntries();
  }, [selectedRaffle]);

  const loadEntries = async () => {
    if (!selectedRaffle) return;
    const { data } = await supabase.rpc("get_raffle_entries", { _raffle_id: selectedRaffle });
    if (data) setEntries(data as Entry[]);
  };

  const viewReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (data) setReceiptUrl(data.signedUrl);
  };

  const downloadReceipt = async (entry: Entry) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(entry.receipt_path, 300);
    if (data) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = `recibo-${entry.id}-${entry.last_name}.${entry.receipt_path.split(".").pop()}`;
      a.click();
    }
  };

  const exportCSV = useCallback(() => {
    const headers = "ID,Nombre,Apellido,Teléfono,Fecha\n";
    const rows = entries
      .map(
        (e) =>
          `${e.id},"${e.first_name}","${e.last_name}","${e.phone}","${new Date(e.created_at).toLocaleDateString()}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participantes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const deleteEntry = async () => {
    if (deleteEntryId === null) return;
    setDeleting(true);
    const entry = entries.find((e) => e.id === deleteEntryId);
    if (entry) {
      await supabase.storage.from("receipts").remove([entry.receipt_path]);
      await supabase.from("raffle_entries").delete().eq("id", deleteEntryId);
    }
    setDeleteEntryId(null);
    setDeleting(false);
    await loadEntries();
  };

  const clearAllEntries = async () => {
    if (!selectedRaffle) return;
    setClearing(true);

    // Get all receipt paths
    const paths = entries.map((e) => e.receipt_path);
    if (paths.length) {
      await supabase.storage.from("receipts").remove(paths);
    }

    // Delete all entries via direct delete
    await supabase.from("raffle_entries").delete().eq("raffle_id", selectedRaffle);

    setEntries([]);
    setClearing(false);
    setShowClearConfirm(false);
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.first_name.toLowerCase().includes(search.toLowerCase()) ||
      e.last_name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search)
  );

  // Login screen
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-xl text-primary mb-1">Panel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión con tu cuenta de Google autorizada</p>
          </div>
          {loginError && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">
              {loginError}
            </div>
          )}
          <Button onClick={handleGoogleLogin} className="w-full" size="lg">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </Button>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <h1 className="font-heading font-bold text-lg">🎯 Panel de Administración</h1>
        <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80">
          <LogOut className="w-4 h-4 mr-2" /> Salir
        </Button>
      </header>

      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Raffle selector */}
        <h2 className="font-heading font-bold text-xl text-foreground mb-4">Sorteos</h2>
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
                    {r.is_active ? "Activo" : "Inactivo"}
                  </span>
                </p>
              </div>
            </div>
          ))}
          {!raffles.length && (
            <p className="text-muted-foreground text-center py-8">No hay sorteos creados.</p>
          )}
        </div>

        {/* Entries table */}
        {selectedRaffle && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-heading font-bold text-lg text-foreground">
                Participantes ({entries.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por teléfono..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-52 pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV} disabled={!entries.length}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Exportar CSV
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={!entries.length}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Cerrar sorteo y limpiar
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Recibo</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">#{String(entry.id).padStart(3, "0")}</TableCell>
                      <TableCell>{entry.first_name}</TableCell>
                      <TableCell>{entry.last_name}</TableCell>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => viewReceipt(entry.receipt_path)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadReceipt(entry)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteEntryId(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredEntries.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {search ? "No se encontraron resultados" : "No hay participantes"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Receipt viewer */}
      <Dialog open={!!receiptUrl} onOpenChange={() => setReceiptUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibo</DialogTitle>
          </DialogHeader>
          {receiptUrl && (
            receiptUrl.includes(".pdf") ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Abrir PDF en nueva pestaña
                </a>
              </div>
            ) : (
              <img src={receiptUrl} alt="Recibo" className="w-full rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete single entry confirm */}
      <AlertDialog open={deleteEntryId !== null} onOpenChange={(open) => { if (!open) setDeleteEntryId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar participante?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro y su recibo. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEntry} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all entries confirm */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ¿Cerrar sorteo y limpiar todos los participantes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará <strong>todos los registros de participantes</strong> y sus recibos almacenados
              de este sorteo. El sistema quedará listo para un nuevo sorteo. <strong>No se puede deshacer.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllEntries} disabled={clearing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {clearing ? "Limpiando..." : "Sí, limpiar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
