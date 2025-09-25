import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { useBillingData } from "@/hooks/useBillingData";

interface InsightsCostPreviewProps {
  personaCount: number;
  questionCount: number;
}

export function InsightsCostPreview({ personaCount, questionCount }: InsightsCostPreviewProps) {
  const { billingData, loading } = useBillingData();
  const [totalCredits, setTotalCredits] = useState(0);
  const [canAfford, setCanAfford] = useState(false);

  useEffect(() => {
    // Calculate total credits: 2 credits per persona per question
    const credits = personaCount * questionCount * 2;
    setTotalCredits(credits);
    setCanAfford((billingData?.balance || 0) >= credits);
  }, [personaCount, questionCount, billingData?.balance]);

  if (loading || personaCount === 0 || questionCount === 0) {
    return null;
  }

  const balance = billingData?.balance || 0;
  const creditsNeeded = totalCredits - balance;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Cost Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Personas selected:</span>
            <Badge variant="secondary">{personaCount}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Questions to ask:</span>
            <Badge variant="secondary">{questionCount}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Credits per response:</span>
            <Badge variant="secondary">2</Badge>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center font-medium">
            <span>Total credits needed:</span>
            <Badge variant="default" className="bg-primary">
              <Coins className="h-3 w-3 mr-1" />
              {totalCredits}
            </Badge>
          </div>
        </div>

        {/* Credit Balance Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Current balance:</span>
            <span className="font-medium">{balance} credits</span>
          </div>
          
          {canAfford ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                You have sufficient credits to run this study.
                <br />
                <span className="text-xs">Remaining after: {balance - totalCredits} credits</span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Insufficient credits. You need {creditsNeeded} more credits to run this study.
                <br />
                <span className="text-xs">Consider reducing personas/questions or buying credits.</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Study Size Guide */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Study Size Guide:</strong></p>
          <p>• Small study: 3-5 personas × 2-3 questions = 12-30 credits</p>
          <p>• Medium study: 5-8 personas × 3-5 questions = 30-80 credits</p>
          <p>• Large study: 8+ personas × 5+ questions = 80+ credits</p>
        </div>
      </CardContent>
    </Card>
  );
}