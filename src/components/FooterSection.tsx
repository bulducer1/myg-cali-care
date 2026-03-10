import { MessageCircle, MapPin, Clock, Facebook, Instagram } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/573027284459";

const FooterSection = () => (
  <footer id="contacto" className="bg-primary text-primary-foreground pt-12 pb-6">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-extrabold text-sm">M</span>
            </div>
            <span className="font-heading font-bold text-lg">
              Droguería <span className="text-accent">MyG</span>
            </span>
          </div>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Tu droguería de confianza en Cali, Colombia. Medicamentos originales y atención profesional.
          </p>
        </div>

        {/* Dirección */}
        <div>
          <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" /> Dirección
          </h3>
          <p className="text-primary-foreground/70 text-sm">
            Carrera 26J #105-05<br />
            Barrio Manuela Beltrán<br />
            Cali, Colombia
          </p>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" /> Horarios
          </h3>
          <p className="text-primary-foreground/70 text-sm">
            Lun – Sáb: 7:00 AM – 9:30 PM<br />
            Domingo: 8:00 AM – 9:00 PM
          </p>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-heading font-semibold mb-3">Contacto</h3>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent/90 transition-colors mb-4"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <div className="flex gap-3 mt-2">
            <a href="https://www.facebook.com/profile.php?id=100092547113303" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-accent transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/drogueriamyg" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-accent transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 text-center">
        <p className="text-primary-foreground/50 text-xs">
          © {new Date().getFullYear()} Droguería MyG. Todos los derechos reservados. Cali, Colombia.
        </p>
      </div>
    </div>
  </footer>
);

export default FooterSection;
