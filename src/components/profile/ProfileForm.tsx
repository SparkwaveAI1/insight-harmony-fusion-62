
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserProfile {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ProfileFormProps {
  initialProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileForm = ({ initialProfile, onProfileUpdate }: ProfileFormProps) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(initialProfile);

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
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            username: formData.username,
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
          }]);

        if (error) throw error;
      }

      onProfileUpdate(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
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
  );
};

export default ProfileForm;
