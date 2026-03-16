import { useState, useEffect, useMemo } from "react";
import { Gift, Upload, CheckCircle, PartyPopper, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const participantSchema = z.object({
  first_name: z.string().trim().min(2, "Nombre muy corto").max(50),
  last_name: z.string().trim().min(2, "Apellido muy corto").max(50),
  phone: z.string().trim().min(7, "Teléfono inválido").max(15).regex(/^[0-9+]+$/, "Solo números"),
});

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type Raffle = {
  id: string;
  title: string;
  description: string | null;
  prize_image_url: string | null;
  draw_date: string;
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = useMemo(() => {
    const ms = new Date(targetDate).getTime() - now;
    if (ms <= 0) return null;
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return { days, hours, mins, secs };
  }, [targetDate, now]);

  if (!diff) return <p className="text-accent font-bold text-lg">¡El sorteo es hoy!</p>;

  return (
    <div className="flex gap-3 justify-center">
      {[
        { value: diff.days, label: "Días" },
        { value: diff.hours, label: "Horas" },
        { value: diff.mins, label: "Min" },
        { value: diff.secs, label: "Seg" },
      ].map((item) => (
        <div key={item.label} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold font-heading">{item.value}</div>
          <div className="text-xs opacity-80">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
};

const RaffleSection = () => {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "" });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase
      .from("raffles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setRaffle(data?.[0] ?? null);
        setLoading(false);
      });
  }, []);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return "Solo se aceptan JPG, PNG o PDF";
    if (f.size > MAX_FILE_SIZE) return "El archivo no puede superar 2 MB";
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const fileError = validateFile(selected);
      if (fileError) {
        setErrors((prev) => ({ ...prev, file: fileError }));
        setFile(null);
        return;
      }
      setErrors((prev) => {
        const { file: _, ...rest } = prev;
        return rest;
      });
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = participantSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!file) {
      setErrors({ file: "Debes subir tu recibo de compra" });
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setErrors({ file: fileError });
      return;
    }

    if (!raffle) return;
    setSubmitting(true);

    try {
      // Prepare file for upload
      let uploadBlob: Blob = file;
      let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      let contentType = file.type;

      if (file.type.startsWith("image/")) {
        uploadBlob = await compressImage(file);
        ext = "jpg";
        contentType = "image/jpeg";
      }

      const fileName = `${raffle.id}/${Date.now()}-${validation.data.phone}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, uploadBlob, { contentType });

      if (uploadError) throw uploadError;

      const { data, error: insertError } = await supabase
        .from("raffle_entries")
        .insert({
          raffle_id: raffle.id,
          first_name: validation.data.first_name,
          last_name: validation.data.last_name,
          full_name: `${validation.data.first_name} ${validation.data.last_name}`,
          phone: validation.data.phone,
          receipt_path: fileName,
        })
        .select("id")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setErrors({ phone: "Este número ya está registrado en este sorteo" });
        } else {
          throw insertError;
        }
        return;
      }

      setSuccess(data.id);
    } catch (err) {
      console.error(err);
      setErrors({ general: "Error al registrar. Intenta de nuevo." });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ first_name: "", last_name: "", phone: "" });
    setFile(null);
    setErrors({});
    setSuccess(null);
  };

  if (loading) return null;

  return (
    <section id="rifas" className="section-padding section-alt">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            🎁 Rifas y <span className="text-accent">Promociones</span>
          </h2>
        </motion.div>

        {!raffle ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto text-center py-12"
          >
            <PartyPopper className="w-16 h-16 mx-auto text-accent mb-4" />
            <p className="text-lg text-foreground/80 font-medium">
              🎁 Muy pronto tendremos nuevas rifas y promociones para nuestros clientes.
            </p>
            <p className="text-muted-foreground mt-2">
              ¡Sigue visitándonos y compra en nuestra farmacia para participar!
            </p>
          </motion.div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
            >
              {raffle.prize_image_url && (
                <img
                  src={raffle.prize_image_url}
                  alt={raffle.title}
                  className="w-full h-48 md:h-64 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-6 md:p-8">
                <h3 className="font-heading font-bold text-2xl text-primary mb-2">{raffle.title}</h3>
                {raffle.description && (
                  <p className="text-muted-foreground mb-4">{raffle.description}</p>
                )}

                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Sorteo:</p>
                  <CountdownTimer targetDate={raffle.draw_date} />
                </div>

                <Button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Participar en el sorteo
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Participation Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading">
              {success ? "¡Registro exitoso!" : "Participar en el sorteo"}
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 mx-auto text-accent mb-3" />
              <p className="font-heading font-bold text-lg text-primary">
                ¡Participación registrada!
              </p>
              <p className="text-muted-foreground mt-1">
                Tu número de participante es{" "}
                <span className="font-bold text-accent">#{String(success).padStart(3, "0")}</span>
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(false)}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  placeholder="Tu nombre"
                  maxLength={50}
                  value={formData.first_name}
                  onChange={(e) => setFormData((f) => ({ ...f, first_name: e.target.value }))}
                />
                {errors.first_name && <p className="text-destructive text-sm mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  placeholder="Tu apellido"
                  maxLength={50}
                  value={formData.last_name}
                  onChange={(e) => setFormData((f) => ({ ...f, last_name: e.target.value }))}
                />
                {errors.last_name && <p className="text-destructive text-sm mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Número de teléfono</Label>
                <Input
                  id="phone"
                  placeholder="3001234567"
                  maxLength={15}
                  value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                />
                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="receipt">Recibo de compra (JPG, PNG o PDF - máx 2MB)</Label>
                <div className="mt-1">
                  <label
                    htmlFor="receipt"
                    className="flex items-center gap-2 cursor-pointer border border-input rounded-md px-4 py-3 text-sm hover:bg-secondary transition-colors"
                  >
                    {file?.type === "application/pdf" ? (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">
                      {file ? file.name.slice(0, 30) : "Seleccionar archivo"}
                    </span>
                  </label>
                  <input
                    id="receipt"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {errors.file && <p className="text-destructive text-sm mt-1">{errors.file}</p>}
              </div>
              {errors.general && <p className="text-destructive text-sm">{errors.general}</p>}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full"
              >
                <Gift className="w-4 h-4 mr-2" />
                {submitting ? "Registrando..." : "Enviar participación"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RaffleSection;
