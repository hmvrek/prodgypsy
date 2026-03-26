import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage("Sprawdź swoją skrzynkę email, aby potwierdzić konto!");
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
      <FloatingParticles />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              {isSignUp ? "Utwórz konto" : "Zaloguj się"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {isSignUp
                ? "Zarejestruj się aby korzystać z LekkaWrzuta"
                : "Zaloguj się na swoje konto"
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-secondary/50 border-border"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Hasło</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-secondary/50 border-border"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary">{message}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading ? "Ładowanie..." : isSignUp ? (
                  <><UserPlus className="w-4 h-4 mr-2" />Zarejestruj się</>
                ) : (
                  <><LogIn className="w-4 h-4 mr-2" />Zaloguj się</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
