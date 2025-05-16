
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        // Specify the exact type for the data to avoid TypeScript errors
        type ProfileResponse = {
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };

        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single<ProfileResponse>();

        if (error) {
          console.error("Error fetching profile:", error);
          // If profile doesn't exist, we'll just use email data
        } else if (data) {
          setProfile({
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

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  return { profile, loading, updateProfile };
};
