import { Heart, Users, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Heart, title: "Compromiso", text: "Con la salud y el bienestar de la comunidad caleña" },
  { icon: Users, title: "Atención personalizada", text: "Cada paciente recibe un trato cercano y profesional" },
  { icon: Award, title: "Ética profesional", text: "Dispensación responsable de medicamentos" },
  { icon: Clock, title: "Disponibilidad", text: "Amplios horarios para atenderte cuando lo necesites" },
];

const AboutSection = () => (
  <section id="nosotros" className="section-padding">
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-6">
            Sobre <span className="text-accent">Nosotros</span>
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            <strong>Droguerías MyG</strong> es una cadena de droguerías consolidada en Cali, Colombia, comprometida con la salud y el bienestar de las familias caleñas. Nos distinguimos por nuestra responsabilidad en la dispensación de medicamentos, asegurando siempre productos originales y de la más alta calidad.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Nuestro equipo de profesionales ofrece asesoría farmacéutica confiable, atención personalizada y un servicio ético que ha generado la confianza de miles de clientes en la ciudad. Somos más que una droguería: somos un aliado en el cuidado de tu salud.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Con presencia en barrios estratégicos de Cali, trabajamos día a día para ser la droguería de referencia en la comunidad, ofreciendo cercanía, calidad y precios justos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {features.map((f, i) => (
            <div key={i} className="bg-secondary rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-primary mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
