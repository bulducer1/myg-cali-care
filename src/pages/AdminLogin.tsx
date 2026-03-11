import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: hasRole } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (!hasRole) {
      await supabase.auth.signOut();
      setError("No tienes permisos de administrador");
      setLoading(false);
      return;
    }

    navigate("/admin-rifas");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 mx-auto text-primary mb-2" />
          <h1 className="font-heading font-bold text-xl text-primary">Panel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
