import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const locations = [
  {
    name: "Droguería MyG",
    address: "Carrera 26J #105-05",
    barrio: "Barrio Manuela Beltrán, Cali",
  },
  {
    name: "Farmacentro MyG",
    address: "CR 90 Oeste 3C 12",
    barrio: "Barrio Las Palmas, Santiago de Cali",
  },
  {
    name: "Farma Vital MyG",
    address: "Cl. 4 Oe. #74G-78",
    barrio: "La Luisa, Cali, Valle del Cauca",
  },
];

const LocationsSection = () => (
  <section id="sedes" className="section-padding bg-primary">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary-foreground mb-4">
          Nuestras <span className="text-accent">Sedes</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {locations.map((loc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
          >
            <MapPin className="w-6 h-6 text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="font-heading font-semibold text-base text-primary-foreground">{loc.name}</h3>
              <p className="text-sm text-primary-foreground/90 font-medium">{loc.address}</p>
              <p className="text-sm text-primary-foreground/70">{loc.barrio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LocationsSection;
