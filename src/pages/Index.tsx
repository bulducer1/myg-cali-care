import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import LocationsSection from "@/components/LocationsSection";
import ScheduleSection from "@/components/ScheduleSection";
import ValuesSection from "@/components/ValuesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import RaffleSection from "@/components/RaffleSection";
import FeaturedProductSection from "@/components/FeaturedProductSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Pharmacy",
  name: "Droguerías MyG",
  image: "",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Carrera 26J #105-05",
    addressLocality: "Cali",
    addressRegion: "Valle del Cauca",
    postalCode: "",
    addressCountry: "CO",
  },
  geo: { "@type": "GeoCoordinates", latitude: 3.48, longitude: -76.52 },
  url: "",
  telephone: "+573027284459",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "07:00", closes: "21:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "08:00", closes: "21:00" },
  ],
  areaServed: "Cali, Colombia",
};

const Index = () => (
  <>
    <Helmet>
      <title>Droguerías MyG | Tu Droguería de Confianza en Cali, Colombia</title>
      <meta
        name="description"
        content="Droguerías MyG en Cali. Medicamentos originales, asesoría farmacéutica y atención personalizada en Manuela Beltrán. Tu farmacia de confianza cerca de ti."
      />
      <meta name="keywords" content="droguerías en Cali, droguería en Manuela Beltrán, medicamentos en Cali, farmacia cerca en Cali, droguerías MyG" />
      <link rel="canonical" href="https://drogueriamyg.com" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content="Droguerías MyG - Medicamentos y Farmacia en Cali" />
      <meta property="og:description" content="Tu cadena de droguerías de confianza en Cali. Medicamentos originales y atención profesional." />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>

    <Header />
    <main>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <LocationsSection />
      <ScheduleSection />
      <ValuesSection />
      <FeaturedProductSection />
      <RaffleSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </main>
    <FooterSection />
    <WhatsAppFloat />
  </>
);

export default Index;
