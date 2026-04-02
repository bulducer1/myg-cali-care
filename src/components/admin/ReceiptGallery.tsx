import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, FileText, Loader2, Images } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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

type Props = {
  entries: Entry[];
};

const ReceiptGallery = ({ entries }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadThumbnails = async () => {
    if (loaded || loadingThumbs) return;
    setLoadingThumbs(true);
    const urls: Record<number, string> = {};
    for (const entry of entries) {
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(entry.receipt_path, 600);
      if (data) urls[entry.id] = data.signedUrl;
    }
    setThumbnails(urls);
    setLoaded(true);
    setLoadingThumbs(false);
  };

  const downloadAllAsZip = async () => {
    if (!entries.length) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const entry of entries) {
        const { data } = await supabase.storage
          .from("receipts")
          .createSignedUrl(entry.receipt_path, 300);
        if (data) {
          const response = await fetch(data.signedUrl);
          const blob = await response.blob();
          const ext = entry.receipt_path.split(".").pop() || "jpg";
          const fileName = `${entry.last_name}_${entry.first_name}_${entry.id}.${ext}`;
          zip.file(fileName, blob);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "recibos_sorteo.zip");
    } catch (e) {
      console.error("Error descargando recibos:", e);
    }
    setDownloading(false);
  };

  const isPdf = (path: string) => path.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Images className="w-5 h-5" />
          Galería de Recibos ({entries.length})
        </h3>
        <div className="flex gap-2">
          {!loaded && (
            <Button variant="outline" size="sm" onClick={loadThumbnails} disabled={loadingThumbs || !entries.length}>
              {loadingThumbs ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
              Cargar vista previa
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadAllAsZip} disabled={downloading || !entries.length}>
            {downloading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            {downloading ? "Descargando..." : "Descargar todo (ZIP)"}
          </Button>
        </div>
      </div>

      {loaded && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-border rounded-lg overflow-hidden bg-card hover:border-accent/50 transition-colors cursor-pointer group"
              onClick={() => thumbnails[entry.id] && setPreviewUrl(thumbnails[entry.id])}
            >
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {isPdf(entry.receipt_path) ? (
                  <FileText className="w-10 h-10 text-muted-foreground" />
                ) : thumbnails[entry.id] ? (
                  <img
                    src={thumbnails[entry.id]}
                    alt={`Recibo de ${entry.full_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground truncate">{entry.full_name}</p>
                <p className="text-xs text-muted-foreground">#{String(entry.id).padStart(3, "0")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loaded && entries.length > 0 && (
        <p className="text-muted-foreground text-center py-8 text-sm">
          Presiona "Cargar vista previa" para ver las imágenes de los recibos.
        </p>
      )}

      {!entries.length && (
        <p className="text-muted-foreground text-center py-8 text-sm">No hay recibos para mostrar.</p>
      )}

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibo</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.includes(".pdf") ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Abrir PDF en nueva pestaña
                </a>
              </div>
            ) : (
              <img src={previewUrl} alt="Recibo" className="w-full rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptGallery;
