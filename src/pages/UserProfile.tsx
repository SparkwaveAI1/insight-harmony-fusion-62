
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import { Loader2, User, Mail, Key } from "lucide-react";

interface UserProfile {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    username: "",
    full_name: "",
  });
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          // If profile doesn't exist, we'll just use email data
        } else if (data) {
          setProfile(data);
          setFormData({
            username: data.username || "",
            full_name: data.full_name || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update(formData)
          .eq("id", user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from("profiles")
          .insert([{ id: user.id, ...formData }]);

        if (error) throw error;
      }

      setProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

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
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={user?.email || ""} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-medium">
                      {profile?.full_name || user?.email?.split("@")[0] || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email verified: {user?.email_confirmed_at ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 items-stretch">
                  <Button variant="outline" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>

              {/* Edit Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Your username"
                        value={formData.username || ""}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        placeholder="Your full name"
                        value={formData.full_name || ""}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
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
