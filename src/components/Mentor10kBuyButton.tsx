import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fetchMentor10kOffer, openMentor10kCheckout, type Mentor10kOffer } from "@/lib/mentor10k-checkout";

export function Mentor10kBuyButton({
  size = "xl",
  variant = "hero",
  label = "Adquirir o Mentor 10K",
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
  const [offer, setOffer] = useState<Mentor10kOffer | null>(null);

  useEffect(() => {
    void fetchMentor10kOffer().then(setOffer);
  }, []);

  const handleClick = () => {
    if (!offer?.checkoutUrl) {
      toast.info("O checkout do Mentor 10K ainda não está configurado. Painel admin → Definições → Mentor 10K.");
      return;
    }
    openMentor10kCheckout(offer.checkoutUrl, user?.email);
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      <Sparkles className="h-4 w-4" />
      {label}
      {showPrice && offer?.priceUsd ? ` — $${offer.priceUsd}` : ""}
    </Button>
  );
}
