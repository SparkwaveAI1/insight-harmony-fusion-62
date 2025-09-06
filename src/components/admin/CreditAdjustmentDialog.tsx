import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface CreditAdjustmentDialogProps {
  userId: string;
  userEmail: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export function CreditAdjustmentDialog({ 
  userId, 
  userEmail, 
  currentBalance,
  onSuccess 
}: CreditAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delta, setDelta] = useState<string>("");
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!delta || !reason.trim()) {
      toast({
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const deltaNum = parseInt(delta);
    if (isNaN(deltaNum) || deltaNum === 0) {
      toast({
        description: "Please enter a valid non-zero credit amount",
        variant: "destructive",
      });
      return;
    }

    if (Math.abs(deltaNum) > 10000) {
      toast({
        description: "Maximum adjustment is 10,000 credits",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length < 5) {
      toast({
        description: "Reason must be at least 5 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🔧 [ADMIN] Submitting credit adjustment:', {
        userId,
        delta: deltaNum,
        reason: reason.substring(0, 50) + '...',
        currentBalance
      });

      const { data, error } = await supabase.functions.invoke('admin-adjust-credits', {
        body: {
          userId,
          delta: deltaNum,
          reason: reason.trim(),
          ticket: ticket.trim() || undefined,
          idempotencyKey: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      if (error) {
        console.error('❌ [ADMIN] Credit adjustment failed:', error);
        throw new Error(error.message || 'Failed to adjust credits');
      }

      if (!data.success) {
        throw new Error(data.message || 'Credit adjustment failed');
      }

      console.log('✅ [ADMIN] Credit adjustment successful:', data);

      toast({
        description: `Successfully ${deltaNum > 0 ? 'added' : 'removed'} ${Math.abs(deltaNum)} credits. New balance: ${data.balanceAfter}`,
      });

      // Reset form
      setDelta("");
      setReason("");
      setTicket("");
      setOpen(false);
      
      // Call success callback to refresh data
      onSuccess?.();

    } catch (err) {
      console.error('❌ [ADMIN] Error adjusting credits:', err);
      toast({
        description: err instanceof Error ? err.message : "Failed to adjust credits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adjust Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Credits</DialogTitle>
          <DialogDescription>
            Adjust credits for {userEmail}
            <br />
            Current balance: <span className="font-mono">{currentBalance}</span> credits
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delta">
              Credit Change <span className="text-destructive">*</span>
            </Label>
            <Input
              id="delta"
              type="number"
              placeholder="Enter positive (add) or negative (remove) amount"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              required
              min="-10000"
              max="10000"
            />
            <p className="text-sm text-muted-foreground">
              Positive numbers add credits, negative numbers remove credits. Max: ±10,000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why credits are being adjusted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {reason.length}/500 characters (minimum 5)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket">Support Ticket/Reference (optional)</Label>
            <Input
              id="ticket"
              placeholder="e.g., TICKET-1234 or support case reference"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Adjust Credits"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}