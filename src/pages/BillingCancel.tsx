import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, ArrowLeft, CreditCard } from "lucide-react";

const BillingCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const sessionId = searchParams.get('session_id');

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
                        <XCircle className="h-16 w-16 text-orange-500" />
                      </div>
                      <CardTitle className="text-2xl text-orange-600">
                        Payment Cancelled
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Your payment was cancelled and no charges were made to your account.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {sessionId && (
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span>Session ID: {sessionId.slice(0, 20)}...</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4 text-left">
                        <h3 className="font-semibold text-center">What happened?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• You cancelled the payment process before it completed</li>
                          <li>• No money was charged to your payment method</li>
                          <li>• Your account balance remains unchanged</li>
                          <li>• You can try again at any time</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> If you experienced any issues during checkout, 
                          please try again or contact our support team for assistance.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button
                          onClick={() => navigate('/dashboard/billing')}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Try Again
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => navigate('/dashboard')}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Dashboard
                        </Button>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Need help? Contact our support team and we'll be happy to assist you.
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

export default BillingCancel;