import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, CreditCard, ArrowRight } from "lucide-react";
import { useBillingData } from "@/hooks/useBillingData";

const BillingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const { billingData, loading, refetch } = useBillingData();
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 2 minutes (60 * 2s = 120s)
    let initialBalance = billingData?.balance || 0;
    
    const pollForCredits = () => {
      pollCount++;
      
      refetch().then(() => {
        // If balance increased or we've polled enough times, stop processing
        if ((billingData && billingData.balance > initialBalance) || pollCount >= maxPolls) {
          setIsProcessing(false);
        } else {
          // Continue polling every 2 seconds
          setTimeout(pollForCredits, 2000);
        }
      }).catch(() => {
        // On error, continue polling but cap at maxPolls
        if (pollCount >= maxPolls) {
          setIsProcessing(false);
        } else {
          setTimeout(pollForCredits, 2000);
        }
      });
    };

    // Start polling after a brief delay
    const timer = setTimeout(pollForCredits, 1000);
    
    return () => clearTimeout(timer);
  }, []); // Remove refetch dependency to avoid restart loops

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <Card className="text-center">
                    <CardHeader className="pb-4">
                      <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <CardTitle className="text-2xl text-green-600">
                        Payment Successful!
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Thank you for your purchase. Your payment has been processed successfully.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {sessionId && (
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span>Transaction ID: {sessionId.slice(0, 20)}...</span>
                          </div>
                        </div>
                      )}
                      
                      {isProcessing ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing your credits...</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your credits are being added to your account. This usually takes a few seconds.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-green-600 font-medium">
                            ✅ Credits have been added to your account!
                          </div>
                          {!loading && billingData && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <p className="text-sm">
                                Current balance: <span className="font-semibold">{billingData.balance} credits</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button
                          onClick={() => navigate('/dashboard/billing')}
                          className="flex items-center gap-2"
                        >
                          View Billing Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => navigate('/dashboard')}
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          If you don't see your credits within 5 minutes, please contact support.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BillingSuccess;