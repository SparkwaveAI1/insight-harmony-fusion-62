
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSummary from "@/components/profile/ProfileSummary";
import { useUserProfile } from "@/hooks/useUserProfile";

const UserProfile = () => {
  const { profile, loading, updateProfile } = useUserProfile();

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
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
