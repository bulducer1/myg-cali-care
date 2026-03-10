import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const locations = [
  {
    name: "Droguería MyG",
    address: "Carrera 26J #105-05",
    barrio: "Barrio Manuela Beltrán, Cali",
    active: true,
  },
  {
    name: "Farmacentro MyG",
    address: "Dirección por confirmar",
    barrio: "Cali",
    active: true,
  },
  {
    name: "Farma Vital MyG",
    address: "Dirección por confirmar",
    barrio: "Cali",
    active: true,
  },
];

const LocationsSection = () => (
  <section id="sedes" className="section-padding">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
          Nuestras <span className="text-accent">Sedes</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Encuéntranos en puntos estratégicos de Cali para estar siempre cerca de ti.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {locations.map((loc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl p-6 border text-center ${
              loc.active
                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                : "bg-secondary border-border opacity-70"
            }`}
          >
            <MapPin className={`w-8 h-8 mx-auto mb-3 ${loc.active ? "text-accent" : "text-muted-foreground"}`} />
            <h3 className="font-heading font-semibold text-lg mb-1">{loc.name}</h3>
            <p className={`text-sm ${loc.active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {loc.address}
            </p>
            <p className={`text-xs mt-1 ${loc.active ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
              {loc.barrio}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Google Maps embed */}
      <div className="rounded-xl overflow-hidden shadow-md border border-border">
        <iframe
          title="Ubicación Droguerías MyG - Manuela Beltrán, Cali"
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500!2d-76.4743474!3d3.422335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1709000000000"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>
);

export default LocationsSection;
