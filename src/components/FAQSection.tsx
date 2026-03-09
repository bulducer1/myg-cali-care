import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "¿Venden medicamentos con fórmula médica?",
    a: "Sí, dispensamos medicamentos con fórmula médica siguiendo todos los protocolos establecidos por la normatividad colombiana. Te recomendamos presentar tu fórmula vigente al momento de la compra.",
  },
  {
    q: "¿Cómo puedo consultar la disponibilidad de un medicamento?",
    a: "Puedes escribirnos directamente por WhatsApp al 3027284459 y con gusto verificamos la disponibilidad del producto que necesitas de forma rápida.",
  },
  {
    q: "¿Cuál es el horario de atención?",
    a: "Nuestro horario es de lunes a sábado de 7:00 AM a 9:30 PM y domingos de 8:00 AM a 9:00 PM. ¡Estamos disponibles para ti casi todo el día!",
  },
];

const FAQSection = () => (
  <section className="section-padding section-alt">
    <div className="container mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
          Preguntas <span className="text-accent">Frecuentes</span>
        </h2>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-background rounded-xl border border-border px-6 shadow-sm">
            <AccordionTrigger className="font-heading font-semibold text-primary text-left hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/80 leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
