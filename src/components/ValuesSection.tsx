import { ShieldCheck, Scale, Gem, HeartHandshake, Star } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  { icon: ShieldCheck, name: "Confianza" },
  { icon: Scale, name: "Ética" },
  { icon: Gem, name: "Calidad" },
  { icon: HeartHandshake, name: "Compromiso" },
  { icon: Star, name: "Servicio" },
];

const ValuesSection = () => (
  <section className="section-padding section-alt">
    <div className="container mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
          Nuestros <span className="text-accent">Valores</span>
        </h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          Los pilares que guían cada una de nuestras acciones al servicio de tu salud.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-3 w-28 md:w-36"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <v.icon className="w-8 h-8 text-accent" />
            </div>
            <span className="font-heading font-semibold text-primary">{v.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ValuesSection;
