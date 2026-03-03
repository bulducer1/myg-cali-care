import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  { name: "María C.", text: "Excelente atención, siempre encuentro lo que necesito. Los recomiendo al 100%.", rating: 5 },
  { name: "Carlos R.", text: "Muy profesionales y amables. Me asesoran bien sobre mis medicamentos.", rating: 5 },
  { name: "Andrea P.", text: "La mejor droguería de mi barrio. Precios justos y buena variedad.", rating: 5 },
  { name: "Jorge L.", text: "Confianza total en la calidad de sus productos. Siempre compro aquí.", rating: 5 },
  { name: "Luisa M.", text: "La atención personalizada es lo que más valoro. Se toman el tiempo de explicarte todo.", rating: 5 },
  { name: "Fernando G.", text: "Llevo años comprando aquí y nunca me han fallado. Productos originales siempre.", rating: 5 },
  { name: "Patricia S.", text: "Horarios amplios que se adaptan a mi rutina. Muy conveniente.", rating: 4 },
  { name: "Diego H.", text: "Excelentes precios en vitaminas y suplementos. Mi droguería de cabecera.", rating: 5 },
  { name: "Sofía V.", text: "Me encanta que siempre están actualizados con los productos más recientes.", rating: 5 },
  { name: "Ricardo T.", text: "Atención rápida y eficiente. No tengo que esperar mucho.", rating: 4 },
  { name: "Carmen O.", text: "Los productos de cuidado personal que manejan son de muy buena calidad.", rating: 5 },
  { name: "Alejandro D.", text: "Me han ayudado mucho con la asesoría sobre interacciones de medicamentos.", rating: 5 },
  { name: "Valentina R.", text: "Ambiente limpio y organizado. Da gusto entrar a la droguería.", rating: 5 },
  { name: "Héctor M.", text: "Siempre tienen disponibilidad de los medicamentos que necesito. Muy confiables.", rating: 5 },
  { name: "Laura B.", text: "La mejor experiencia en droguerías de Cali. Personal muy capacitado.", rating: 5 },
];

const VISIBLE_COUNT = 3;

const TestimonialsSection = () => {
  const [startIndex, setStartIndex] = useState(() => Math.floor(Math.random() * testimonials.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      result.push(testimonials[(startIndex + i) % testimonials.length]);
    }
    return result;
  };

  return (
    <section id="testimonios" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            Lo que dicen nuestros <span className="text-accent">clientes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La confianza de nuestros clientes es nuestra mayor recompensa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 min-h-[220px]">
          <AnimatePresence mode="popLayout">
            {getVisibleTestimonials().map((t, i) => (
              <motion.div
                key={`${t.name}-${startIndex}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-secondary rounded-xl p-6 border border-border"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-border" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <p className="font-heading font-semibold text-primary text-sm">{t.name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
