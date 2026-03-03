import { MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-pharmacy.jpg";

const WHATSAPP_URL = "https://wa.me/573027284459";

const HeroSection = () => (
  <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
    {/* Background image with overlay */}
    <div className="absolute inset-0">
      <img src={heroImage} alt="Farmacia moderna en Cali - Droguería MyG" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/40" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className="text-primary-foreground/80 font-medium text-sm uppercase tracking-wider">
              Droguería de confianza en Cali
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-6">
            Tu salud es nuestra{" "}
            <span className="text-accent">prioridad</span>
          </h1>

          <p className="text-primary-foreground/85 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            En Droguería MyG te brindamos atención profesional, ética y personalizada. 
            Medicamentos originales y asesoría farmacéutica confiable para ti y tu familia en Cali.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-8 text-base shadow-lg">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Escríbenos por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8 text-base">
              <a href="#servicios">Conoce nuestros servicios</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
