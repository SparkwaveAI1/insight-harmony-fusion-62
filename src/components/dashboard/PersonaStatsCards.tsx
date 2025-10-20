import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { usePersonaDashboardStats } from "@/hooks/usePersonaDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function PersonaStatsCards() {
  const { stats, loading } = usePersonaDashboardStats();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Personas",
      value: stats.totalPersonas,
      icon: Users,
      description: "Completed personas",
      onClick: () => navigate("/personas"),
    },
    {
      title: "Pending in Queue",
      value: stats.pendingQueue,
      icon: Clock,
      description: "Waiting to process",
      onClick: () => navigate("/persona-queue"),
    },
    {
      title: "Processing",
      value: stats.processingQueue,
      icon: Loader2,
      description: "Currently creating",
      onClick: () => navigate("/persona-queue"),
    },
    {
      title: "Failed",
      value: stats.failedQueue,
      icon: AlertCircle,
      description: "Needs attention",
      onClick: () => navigate("/persona-queue?filter=failed"),
      variant: stats.failedQueue > 0 ? "destructive" : undefined,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.variant === 'destructive' ? 'text-destructive' : ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
