
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  title: string;
  description: string;
  author: string;
  date: string;
  imageUrl?: string;
  className?: string;
}

const FeedCard = ({
  title,
  description,
  author,
  date,
  imageUrl,
  className,
}: FeedCardProps) => {
  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-lg", className)}>
      {imageUrl && (
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      )}
      <CardHeader className="space-y-2">
        <h3 className="text-xl font-semibold leading-none tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          By {author} • {date}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeedCard;
