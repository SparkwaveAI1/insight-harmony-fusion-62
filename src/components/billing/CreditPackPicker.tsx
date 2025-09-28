import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditPackOption {
  id: "CREDITS_100" | "CREDITS_500" | "CREDITS_1000";
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPacks: CreditPackOption[] = [
  { id: "CREDITS_100", credits: 100, price: 10 },
  { id: "CREDITS_500", credits: 500, price: 45, popular: true },
  { id: "CREDITS_1000", credits: 1000, price: 80 },
];

interface CreditPackPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

export function CreditPackPicker({ open, onOpenChange, onPurchaseComplete }: CreditPackPickerProps) {
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<string>("CREDITS_500");
  const [loading, setLoading] = useState(false);

  const handleBuyCredits = async () => {
    if (!user?.id) {
      toast.error("Please sign in to purchase credits");
      return;
    }

    try {
      setLoading(true);
      console.log("🛒 [BILLING] Starting credit pack checkout:", { userId: user.id, packType: selectedPack });

      const { data, error } = await supabase.functions.invoke('billing-checkout-credit-pack', {
        body: {
          userId: user.id,
          packType: selectedPack
        }
      });

      console.log("📋 [BILLING] Checkout response:", data);

      if (error) {
        throw new Error(error.message || "Checkout failed");
      }

      if (!data?.ok || !data?.url) {
        throw new Error(data?.error || "Invalid checkout response");
      }

      console.log("🚀 [BILLING] Redirecting to Stripe checkout:", data.url);
      
      // Open Stripe checkout in a new tab (as per requirements)
      window.open(data.url, '_blank');
      
      // Close the picker dialog
      onOpenChange(false);
      
      // Trigger refresh if callback provided
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
      
      toast.success("Redirecting to Stripe checkout...");

    } catch (err) {
      console.error("❌ [BILLING] Credit pack checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPackData = creditPacks.find(pack => pack.id === selectedPack);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit pack to purchase. Credits are granted automatically after payment completes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={selectedPack} onValueChange={setSelectedPack}>
            <div className="space-y-3">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                    selectedPack === pack.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={pack.id} id={pack.id} />
                  <Label
                    htmlFor={pack.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {pack.credits} Credits
                          {pack.popular && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(pack.price / pack.credits).toFixed(2)} per credit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${pack.price}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedPackData && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-sm text-muted-foreground">
                You're purchasing <strong>{selectedPackData.credits} credits</strong> for{" "}
                <strong>${selectedPackData.price}</strong>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuyCredits}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Credits
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            💳 Using Stripe Test Mode - Use test card 4242 4242 4242 4242
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}