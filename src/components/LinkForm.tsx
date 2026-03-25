import { useState } from "react";
import { Link2, Plus, Copy, Check, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface LinkFormProps {
  onLinkAdd: (link: LinkData) => void;
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateOwnerToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function storeOwnerToken(shortId: string, token: string) {
  try {
    const tokens = JSON.parse(localStorage.getItem('link_owner_tokens') || '{}');
    tokens[shortId] = token;
    localStorage.setItem('link_owner_tokens', JSON.stringify(tokens));
  } catch {
    // Ignore storage errors
  }
}

export function LinkForm({ onLinkAdd }: LinkFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState<LinkData | null>(null);
  const [copied, setCopied] = useState(false);

  const getShortUrl = (shortId: string) => {
    return `${window.location.origin}/link/?id=${shortId}`;
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(getShortUrl(createdLink.short_id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = getShortUrl(createdLink.short_id);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (include https://)");
      return;
    }

    if (imageUrl.trim()) {
      try {
        new URL(imageUrl);
      } catch {
        setError("Please enter a valid image URL (include https://)");
        return;
      }
    }

    setIsSubmitting(true);
    const shortId = generateShortId();
    const ownerToken = generateOwnerToken();

    try {
      const supabase = createClient();
      const linkData = {
        title: title.trim() || "My Link",
        description: description.trim() || "Click the button below to access your content.",
        url: url.trim(),
        file_size: fileSize.trim() || "Unknown",
        short_id: shortId,
        image_url: imageUrl.trim() || null,
        owner_token: ownerToken,
      };

      const { data, error: supabaseError } = await supabase
        .from('links')
        .insert(linkData)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message || 'Failed to create link');
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      storeOwnerToken(shortId, ownerToken);

      const newLink: LinkData = {
        ...data,
        owner_token: ownerToken,
      };

      onLinkAdd(newLink);
      setCreatedLink(newLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedLink(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setFileSize("");
    setImageUrl("");
    setCopied(false);
    setError("");
  };

  const handleAddAnother = () => {
    setCreatedLink(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setFileSize("");
    setImageUrl("");
    setCopied(false);
    setError("");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl shadow-primary/30 hover:scale-110 transition-all duration-300 z-40 p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold text-foreground">
            {createdLink ? "Link Created!" : "Add New Link"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {createdLink ? "Share this link with others" : "Add a new config link"}
          </p>
        </div>

        {/* Success State */}
        {createdLink ? (
          <div className="p-6 pt-2 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{createdLink.title}</h3>
            <p className="text-sm text-muted-foreground">Your shortened link is ready</p>

            {/* Shortened URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Shortened URL</label>
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
                <Link2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {getShortUrl(createdLink.short_id)}
                </span>
                <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Copied to clipboard!
                </p>
              )}
            </div>

            {/* Preview Link */}
            <a
              href={getShortUrl(createdLink.short_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open link in new tab
            </a>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
              <Button onClick={handleAddAnother} className="flex-1">Add Another</Button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">URL *</label>
              <Input
                placeholder="https://example.com/file.zip"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11 bg-secondary/50 border-border"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <Input
                placeholder="My awesome config"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 bg-secondary/50 border-border"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Input
                placeholder="Description of the link"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 bg-secondary/50 border-border"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">File Size</label>
              <Input
                placeholder="e.g., 2.5 MB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="h-11 bg-secondary/50 border-border"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                Image URL (optional)
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-11 bg-secondary/50 border-border"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Add an image to display with your link</p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Link"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
