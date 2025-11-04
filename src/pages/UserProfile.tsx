
import { Loader2, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSummary from "@/components/profile/ProfileSummary";
import { RecentActivity } from "@/components/billing/RecentActivity";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Admin emails - keep in sync with AdminDashboard
const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com", 
  "scott@sparkwave-ai.com",
];

const UserProfile = () => {
  const { profile, loading, updateProfile } = useUserProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section>
          <div className="container">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Summary Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileSummary profile={profile} />
                  
                  {/* Admin Dashboard Button */}
                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => navigate("/admin")}
                        variant="outline"
                        className="w-full"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileForm 
                    initialProfile={profile || {}}
                    onProfileUpdate={updateProfile}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Purchase History & Usage */}
            <div className="mt-6">
              <RecentActivity />
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
