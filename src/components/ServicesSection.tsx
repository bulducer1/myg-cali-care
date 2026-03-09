import { Pill, Sparkles, Apple, Stethoscope, HandHeart } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: Pill, title: "Medicamentos originales", desc: "Amplio inventario de medicamentos de laboratorios reconocidos, garantizando autenticidad y calidad." },
  { icon: Sparkles, title: "Cuidado personal", desc: "Productos de higiene, belleza y cuidado personal de las mejores marcas del mercado." },
  { icon: Apple, title: "Vitaminas y suplementos", desc: "Suplementos nutricionales y vitaminas para fortalecer tu salud y bienestar diario." },
  { icon: Stethoscope, title: "Asesoría farmacéutica", desc: "Orientación profesional sobre el uso adecuado de medicamentos y productos de salud." },
  { icon: HandHeart, title: "Atención personalizada", desc: "Servicio cercano, cálido y profesional adaptado a las necesidades de cada cliente." },
];

const ServicesSection = () => (
  <section id="servicios" className="section-padding section-alt">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
          Nuestros <span className="text-accent">Servicios</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ofrecemos una atención integral en salud para ti y tu familia en Cali, Colombia.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border group"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <s.icon className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{s.title}</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
