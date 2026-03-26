import { useState, useRef } from "react";
import { Upload, Copy, Check, ExternalLink, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface FileUploadProps {
  onUploadComplete?: () => void;
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
  } catch {}
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAdmin } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name);
      setError("");
      setCreatedLink(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name);
      setError("");
      setCreatedLink(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Wybierz plik do wrzucenia");
      return;
    }

    setIsUploading(true);
    setError("");

    const shortId = generateShortId();
    const ownerToken = generateOwnerToken();
    const supabase = createClient();

    try {
      // Upload file to Supabase Storage
      const filePath = `uploads/${shortId}/${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Save link info to database
      const linkData = {
        title: title.trim() || selectedFile.name,
        description: `Plik: ${selectedFile.name}`,
        url: urlData.publicUrl,
        file_size: formatFileSize(selectedFile.size),
        short_id: shortId,
        owner_token: ownerToken,
        user_id: user?.id || null,
        is_permanent: isAdmin,
      };

      const { error: dbError } = await supabase
        .from('links')
        .insert(linkData as any)
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      storeOwnerToken(shortId, ownerToken);
      setCreatedLink(`${window.location.origin}/link/?id=${shortId}`);
      onUploadComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wrzucić pliku');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = createdLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setTitle("");
    setCreatedLink(null);
    setCopied(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Success state
  if (createdLink) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-card/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Plik wrzucony!</h3>
          <p className="text-sm text-muted-foreground">Skopiuj link i wyślij go komuś</p>

          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
            <span className="text-sm text-foreground truncate flex-1">{createdLink}</span>
            <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-primary flex items-center justify-center gap-1">
              <Check className="h-3 w-3" /> Skopiowano!
            </p>
          )}

          <div className="flex gap-3">
            <a href={createdLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" /> Otwórz
              </Button>
            </a>
            <Button onClick={reset} className="flex-1">
              Wrzuć kolejny
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-10 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile ? (
            <div className="space-y-2">
              <FileIcon className="w-10 h-10 text-primary mx-auto" />
              <p className="text-foreground font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-xs text-destructive hover:underline flex items-center gap-1 mx-auto"
              >
                <X className="w-3 h-3" /> Usuń
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-primary/50 group-hover:text-primary mx-auto transition-colors" />
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">Kliknij</span> lub przeciągnij plik tutaj
              </p>
              <p className="text-xs text-muted-foreground">Dowolny plik do 50MB</p>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Nazwa (opcjonalnie)</label>
          <Input
            placeholder="Nazwa pliku..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 bg-secondary/50 border-border"
            disabled={isUploading}
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full h-12 text-base rounded-xl"
          size="lg"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
              Wrzucanie...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Wrzuć plik
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
