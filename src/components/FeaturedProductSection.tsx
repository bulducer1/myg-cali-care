import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Sparkles } from "lucide-react";

type FeaturedProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

const FeaturedProductSection = () => {
  const [product, setProduct] = useState<FeaturedProduct | null>(null);

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

  if (!product) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(215 100% 15%) 50%, hsl(var(--primary)) 100%)" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border border-white/20">
            <Sparkles className="w-4 h-4" />
            Producto Estrella
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-5xl mx-auto">
          {/* Image */}
          {product.image_url && (
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md">
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/15 transition-all duration-500" />
                <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-auto rounded-xl object-contain max-h-80"
                    loading="lazy"
                  />
                </div>
                {/* Floating stars */}
                <div className="absolute -top-3 -right-3 bg-accent text-white p-2 rounded-full shadow-lg animate-bounce">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 leading-tight">
              {product.title}
            </h2>

            {product.description && (
              <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                {product.description}
              </p>
            )}

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
