import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Sparkles, ChevronLeft, ChevronRight, Leaf, Shield, Heart } from "lucide-react";

type FeaturedProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

const VIDEOS = ["/videos/mentol-forte-1.mp4", "/videos/mentol-forte-2.mp4"];

const FeaturedProductSection = () => {
  const [product, setProduct] = useState<FeaturedProduct | null>(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("featured_products")
        .select("id, title, description, price, image_url")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (data) setProduct(data);
    };
    load();
  }, []);

  useEffect(() => {
    videoRef.current?.load();
  }, [activeVideo]);

  const handleVideoEnd = () => {
    if (activeVideo < VIDEOS.length - 1) {
      setActiveVideo((prev) => prev + 1);
    }
  };

  const switchVideo = (dir: number) => {
    setActiveVideo((prev) => {
      const next = prev + dir;
      if (next < 0) return VIDEOS.length - 1;
      if (next >= VIDEOS.length) return 0;
      return next;
    });
  };

  if (!product) return null;

  const benefits = [
    { icon: Leaf, text: "Base de Cannabis Natural" },
    { icon: Shield, text: "Alivio Muscular Profundo" },
    { icon: Heart, text: "Cuidado Articular" },
  ];

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(215 100% 12%) 50%, hsl(var(--primary)) 100%)",
      }}
    >
      {/* Decorative blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border border-white/20">
            <Sparkles className="w-4 h-4" />
            Producto Estrella
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md">
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/15 transition-all duration-500" />
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  src={VIDEOS[activeVideo]}
                  className="w-full aspect-[9/16] object-cover max-h-[480px]"
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  controls
                />

                {/* Navigation arrows */}
                {VIDEOS.length > 1 && (
                  <>
                    <button
                      onClick={() => switchVideo(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Video anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => switchVideo(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Siguiente video"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {VIDEOS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVideo(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === activeVideo ? "bg-white scale-125" : "bg-white/40"
                      }`}
                      aria-label={`Video ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating star */}
              <div className="absolute -top-3 -right-3 bg-accent text-white p-2 rounded-full shadow-lg animate-bounce">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3 leading-tight">
              {product.title}
            </h2>

            <p className="text-emerald-300/90 font-medium text-sm uppercase tracking-widest mb-4">
              Fórmula Natural con Extracto de Cannabis
            </p>

            {product.description && (
              <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                {product.description}
              </p>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/90 text-sm"
                >
                  <b.icon className="w-4 h-4 text-emerald-400" />
                  {b.text}
                </div>
              ))}
            </div>

            {product.price != null && (
              <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <span className="text-white/60 text-sm font-medium">Desde</span>
                <span className="text-4xl md:text-5xl font-bold text-white">
                  ${product.price.toLocaleString("es-CO")}
                </span>
              </div>
            )}

            <p className="mt-6 text-white/50 text-sm">
              * Disponible en nuestras sedes. Pregunta por disponibilidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductSection;
