import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function ResetPlan({ planId, onDone }: { planId: string; onDone: () => void }) {
  const { lang } = useI18n();
  const pt = lang === "pt";
  const word = pt ? "APAGAR" : "DELETE";
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const close = () => { setStep(0); setTyped(""); };
  const confirm = async () => {
    setBusy(true);
    const { error } = await supabase.from("mentor10k_plans").update({ status: "archived" }).eq("id", planId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(pt ? "Plano removido. Faz um novo diagnóstico." : "Plan removed. Start a new diagnosis.");
    close();
    onDone();
    navigate({ to: "/mentor10k/diagnostico" });
  };

  return (
    <>
      <button type="button" onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 inline-flex items-center gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" /> {pt ? "Reiniciar plano e fazer novo diagnóstico" : "Reset plan and start a new diagnosis"}
      </button>
      <Dialog open={step > 0} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />
              {step === 1 ? (pt ? "Tens a certeza?" : "Are you sure?") : (pt ? "Última confirmação" : "Final confirmation")}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? (pt ? "Vais perder o acesso a este plano, às ações diárias e ao progresso associado. Esta ação não pode ser desfeita por ti." : "You will lose access to this plan, its daily actions and related progress. You cannot undo this.")
                : (pt ? `Escreve ${word} para confirmar.` : `Type ${word} to confirm.`)}
            </DialogDescription>
          </DialogHeader>
          {step === 2 && <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={word} autoFocus />}
          <DialogFooter>
            <Button variant="outline" onClick={close}>{pt ? "Cancelar" : "Cancel"}</Button>
            {step === 1
              ? <Button variant="destructive" onClick={() => setStep(2)}>{pt ? "Continuar" : "Continue"}</Button>
              : <Button variant="destructive" disabled={typed.trim().toUpperCase() !== word || busy} onClick={confirm}>{pt ? "Apagar plano" : "Delete plan"}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
