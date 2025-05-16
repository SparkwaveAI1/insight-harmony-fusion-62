
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface UserProfile {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ProfileSummaryProps {
  profile: UserProfile | null;
}

const ProfileSummary = ({ profile }: ProfileSummaryProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
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
      <Button variant="outline" onClick={handleSignOut} className="w-full">
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileSummary;
