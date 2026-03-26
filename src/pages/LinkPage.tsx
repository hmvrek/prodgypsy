import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { DownloadCard } from "@/components/DownloadCard";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Shield, Zap, Globe, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface LinkData {
  id: string;
  title: string;
  description: string;
  url: string;
  file_size: string;
  short_id: string;
  image_url?: string;
  created_at: string;
}

export default function LinkPage() {
  const [searchParams] = useSearchParams();
  const shortId = searchParams.get('id');
  const [link, setLink] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLink() {
      if (!shortId) { setError("Nieprawidłowy link"); setIsLoading(false); return; }
      try {
        const supabase = createClient();
        const { data, error: e } = await supabase.from('links').select('*').eq('short_id', shortId).single();
        if (e || !data) { setError("Link nie istnieje lub został usunięty"); setIsLoading(false); return; }
        setLink(data);
      } catch { setError("Nie udało się załadować. Spróbuj ponownie."); }
      finally { setIsLoading(false); }
    }
    fetchLink();
  }, [shortId]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
      <FloatingParticles />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Ładowanie...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 max-w-md">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-xl font-bold text-foreground">{error}</h2>
                <p className="text-muted-foreground">Link którego szukasz nie istnieje lub został usunięty.</p>
                <a href="/" className="text-primary hover:underline text-sm">← Wróć na stronę główną</a>
              </div>
            ) : link ? (
              <div className="w-full max-w-lg">
                <DownloadCard
                  title={link.title}
                  description={link.description}
                  fileSize={link.file_size}
                  downloadUrl={link.url}
                  previewUrl={link.url}
                  imageUrl={link.image_url}
                />
                <div className="flex justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" /><span className="text-xs">Bezpieczne</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-accent" /><span className="text-xs">Szybkie</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4 text-primary" /><span className="text-xs">Darmowe</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
