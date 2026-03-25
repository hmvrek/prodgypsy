import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LinkForm } from "@/components/LinkForm";
import { Shield, Zap, Globe, Copy, Check, ExternalLink, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  owner_token?: string;
}

function getOwnerTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('link_owner_tokens') || '{}');
  } catch {
    return {};
  }
}

function getOwnerToken(shortId: string): string | null {
  const tokens = getOwnerTokens();
  return tokens[shortId] || null;
}

function removeOwnerToken(shortId: string) {
  try {
    const tokens = getOwnerTokens();
    delete tokens[shortId];
    localStorage.setItem('link_owner_tokens', JSON.stringify(tokens));
  } catch {
    // Ignore
  }
}

export default function Home() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading links:', error);
        return;
      }

      if (data) {
        const ownerTokens = getOwnerTokens();
        const ownedShortIds = Object.keys(ownerTokens);
        const userLinks = data.filter((link: LinkData) => ownedShortIds.includes(link.short_id));
        setLinks(userLinks);
      }
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadLinks();
  }, [loadLinks]);

  const handleAddLink = (link: LinkData) => {
    setLinks([link, ...links]);
  };

  const handleDeleteLink = async (shortId: string) => {
    const ownerToken = getOwnerToken(shortId);
    if (!ownerToken) return;

    setDeletingId(shortId);
    try {
      const supabase = createClient();
      const { data: existingLink } = await supabase
        .from('links')
        .select('owner_token')
        .eq('short_id', shortId)
        .single();

      if (!existingLink || existingLink.owner_token !== ownerToken) return;

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('short_id', shortId)
        .eq('owner_token', ownerToken);

      if (!error) {
        setLinks(links.filter(l => l.short_id !== shortId));
        removeOwnerToken(shortId);
      }
    } catch {
      // Failed to delete
    } finally {
      setDeletingId(null);
    }
  };

  const getShortUrl = (shortId: string) => {
    return `${window.location.origin}/link/?id=${shortId}`;
  };

  const handleCopy = async (shortId: string) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(shortId));
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = getShortUrl(shortId);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Share Your
              <span className="text-primary"> Config Links</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create shortened links for your configs, files and downloads. 
              Share them easily with a built-in ad system to monetize your content.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">Secure Links</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-sm">Instant Shortening</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-5 w-5 text-primary" />
                <span className="text-sm">Ad Monetization</span>
              </div>
            </div>
          </div>

          {/* Links List */}
          {mounted && (
            <div className="max-w-2xl mx-auto space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  Loading your links...
                </div>
              ) : links.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Your Links</h2>
                  {links.map((link) => (
                    <div
                      key={link.short_id}
                      className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {link.image_url && (
                              <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <h3 className="font-semibold text-foreground truncate">{link.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-2">{link.url}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Size: {link.file_size}</span>
                            <span>•</span>
                            <span>{new Date(link.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(link.short_id)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === link.short_id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <a
                            href={getShortUrl(link.short_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
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
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p>No links yet. Click the + button to create one!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Link Form FAB */}
      <LinkForm onLinkAdd={handleAddLink} />
    </div>
  );
}
