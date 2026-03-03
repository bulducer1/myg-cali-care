import { Clock } from "lucide-react";
import { motion } from "framer-motion";

const ScheduleSection = () => (
  <section className="py-12 bg-primary">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-primary-foreground"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-accent" />
          <h2 className="font-heading font-bold text-2xl">Horarios de Atención</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-center">
          <div>
            <p className="font-semibold text-lg">Lunes a Sábado</p>
            <p className="text-primary-foreground/80 text-accent font-bold text-xl">7:00 AM – 9:30 PM</p>
          </div>
          <div>
            <p className="font-semibold text-lg">Domingos</p>
            <p className="text-primary-foreground/80 text-accent font-bold text-xl">8:00 AM – 9:00 PM</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ScheduleSection;
