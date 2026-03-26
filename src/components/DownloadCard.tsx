import { useState } from "react";
import { Download, Eye, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdModal } from "./AdModal";

interface DownloadCardProps {
  title: string;
  description: string;
  fileSize?: string;
  downloadUrl: string;
  previewUrl?: string;
  imageUrl?: string;
}

export function DownloadCard({
  title,
  description,
  fileSize = "Nieznany",
  downloadUrl,
  previewUrl,
  imageUrl,
}: DownloadCardProps) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [actionType, setActionType] = useState<"download" | "preview">("download");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDownloadClick = () => {
    setActionType("download");
    setShowAdModal(true);
  };

  const handlePreviewClick = () => {
    setActionType("preview");
    setShowAdModal(true);
  };

  const handleAdComplete = () => {
    setShowAdModal(false);
    setIsCompleted(true);
    const targetUrl = actionType === "download" ? downloadUrl : (previewUrl || downloadUrl);
    window.open(targetUrl, "_blank");
    setTimeout(() => setIsCompleted(false), 3000);
  };

  return (
    <>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
          {imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
              <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{fileSize}</span>
            <span className="flex items-center gap-1"><Shield className="h-4 w-4" />Bezpieczny link</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownloadClick} className="flex-1">
              {isCompleted && actionType === "download" ? (
                <><CheckCircle className="h-4 w-4 mr-2" />Pobieranie rozpoczęte!</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Pobierz</>
              )}
            </Button>
            {previewUrl && (
              <Button onClick={handlePreviewClick} variant="outline">
                {isCompleted && actionType === "preview" ? (
                  <><CheckCircle className="h-4 w-4 mr-2" />Otwarto!</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" />Podgląd</>
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Kliknięcie przycisku wyświetli reklamę wspierającą nasz darmowy serwis
          </p>
        </div>
      </div>
      <AdModal isOpen={showAdModal} onClose={() => setShowAdModal(false)} onComplete={handleAdComplete} />
    </>
  );
}
