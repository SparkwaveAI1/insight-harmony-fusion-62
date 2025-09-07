import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserBillingDetail } from "./UserBillingDetail";

interface User {
  id: string;
  email: string;
}

export function AdminBillingUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      toast({
        description: "Please enter an email or user ID to search",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 [ADMIN] Searching users with query:", searchQuery);

      // Call the secure admin search endpoint
      const { data, error } = await supabase.functions.invoke('admin-search-users', {
        body: { query: searchQuery.trim() }
      });

      if (error) {
        console.error("❌ [ADMIN] Error calling search function:", error);
        throw new Error(error.message || "Search failed");
      }

      if (!data?.users) {
        console.error("❌ [ADMIN] Invalid response format:", data);
        throw new Error("Invalid response from search");
      }

      const foundUsers: User[] = data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
      }));

      console.log("✅ [ADMIN] Users found:", foundUsers);
      setUsers(foundUsers);

    } catch (err) {
      console.error("❌ [ADMIN] Error searching users:", err);
      toast({
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Billing Management
        </CardTitle>
        <CardDescription>
          Search users by email or ID to view their billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by email or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={searchUsers} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {users.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Search Results ({users.length})
            </h4>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[600px] sm:w-[700px]">
                    <SheetHeader>
                      <SheetTitle>Billing Details - {user.email}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {selectedUserId && (
                        <UserBillingDetail userId={selectedUserId} userEmail={user.email} />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ))}
          </div>
        )}

        {users.length === 0 && searchQuery && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No users found for "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}