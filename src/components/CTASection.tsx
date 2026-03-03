import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const WHATSAPP_URL = "https://wa.me/573027284459";

const CTASection = () => (
  <section className="py-16 bg-primary">
    <div className="container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-foreground mb-4">
          Más que una droguería, somos un aliado en el cuidado de tu salud.
        </h2>
        <p className="text-primary-foreground/75 mb-8 max-w-xl mx-auto">
          Consulta disponibilidad, precios y recibe asesoría farmacéutica directamente por WhatsApp.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-10 text-base shadow-lg">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Escríbenos por WhatsApp
          </a>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
