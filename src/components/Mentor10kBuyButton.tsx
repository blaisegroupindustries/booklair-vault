import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fetchMentor10kOffer, openMentor10kCheckout, type Mentor10kOffer } from "@/lib/mentor10k-checkout";
import { useI18n } from "@/lib/i18n";

export function Mentor10kBuyButton({
  size = "xl",
  variant = "hero",
  label,
  showPrice = true,
  className = "",
}: {
  size?: "lg" | "xl";
  variant?: "hero" | "gold" | "goldOutline";
  label?: string;
  showPrice?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const [offer, setOffer] = useState<Mentor10kOffer | null>(null);

  useEffect(() => {
    void fetchMentor10kOffer().then(setOffer);
  }, []);

  const handleClick = () => {
    if (!offer?.checkoutUrl) {
      toast.info(lang === "pt" ? "O checkout do Mentor 10K ainda não está configurado. Painel admin → Definições → Mentor 10K." : "Mentor 10K checkout is not configured yet.");
      return;
    }
    openMentor10kCheckout(offer.checkoutUrl, user?.email);
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      <Sparkles className="h-4 w-4" />
      {label ?? (lang === "pt" ? "Adquirir o Mentor 10K" : "Get Mentor 10K")}
      {showPrice && offer?.priceUsd ? ` — $${offer.priceUsd}` : ""}
    </Button>
  );
}
