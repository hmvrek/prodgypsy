import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { FloatingParticles } from "@/components/FloatingParticles";
import { FileUpload } from "@/components/FileUpload";
import { Shield, Zap, Globe, Copy, Check, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface LinkData {
  id: string;
  title: string;
  description: string;
  url: string;
  file_size: string;
  short_id: string;
  created_at: string;
  owner_token?: string;
  is_permanent?: boolean;
}

function getOwnerTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('link_owner_tokens') || '{}');
  } catch { return {}; }
}

function getOwnerToken(shortId: string): string | null {
  return getOwnerTokens()[shortId] || null;
}

function removeOwnerToken(shortId: string) {
  try {
    const tokens = getOwnerTokens();
    delete tokens[shortId];
    localStorage.setItem('link_owner_tokens', JSON.stringify(tokens));
  } catch {}
}

export default function Home() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const loadLinks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        // Show links owned by this user (via token or user_id)
        const ownerTokens = getOwnerTokens();
        const ownedShortIds = Object.keys(ownerTokens);
        const userLinks = data.filter((link: LinkData) =>
          ownedShortIds.includes(link.short_id) ||
          (user && (link as any).user_id === user.id)
        );
        setLinks(userLinks);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleDeleteLink = async (shortId: string) => {
    const ownerToken = getOwnerToken(shortId);
    setDeletingId(shortId);
    try {
      const supabase = createClient();
      if (ownerToken) {
        await supabase.from('links').delete().eq('short_id', shortId).eq('owner_token', ownerToken);
      } else if (user) {
        await supabase.from('links').delete().eq('short_id', shortId).eq('user_id', user.id);
      }
      // File is on GoFile.io - no local storage to delete
      setLinks(links.filter(l => l.short_id !== shortId));
      removeOwnerToken(shortId);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  const getShortUrl = (shortId: string) => `${window.location.origin}/link/?id=${shortId}`;

  const handleCopy = async (shortId: string) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(shortId));
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = getShortUrl(shortId);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
      <FloatingParticles />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Wrzuć plik,
              <span className="text-primary"> wyślij link</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wrzuć dowolny plik i otrzymaj link do pobrania. Szybko, prosto i za darmo.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">Bezpieczne pliki</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-sm">Błyskawiczny upload</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-5 w-5 text-primary" />
                <span className="text-sm">Darmowe</span>
              </div>
            </div>
          </div>

          {/* File Upload - centered big button */}
          <FileUpload onUploadComplete={loadLinks} />

          {/* User's links */}
          <div className="max-w-2xl mx-auto mt-12 space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                Ładowanie...
              </div>
            ) : links.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-4">Twoje pliki</h2>
                {links.map((link) => (
                  <div
                    key={link.short_id}
                    className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{link.title}</h3>
                        <p className="text-sm text-muted-foreground truncate mb-2">{link.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Rozmiar: {link.file_size}</span>
                          <span>•</span>
                          <span>{new Date(link.created_at).toLocaleDateString('pl-PL')}</span>
                          {link.is_permanent && (
                            <>
                              <span>•</span>
                              <span className="text-primary">Na stałe</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(link.short_id)} className="h-8 w-8 p-0">
                          {copiedId === link.short_id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <a href={getShortUrl(link.short_id)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDeleteLink(link.short_id)}
                          disabled={deletingId === link.short_id}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
