import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";

interface StatsCardProps {
  title: string;
  value?: string | number;
  icon: LucideIcon;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Badge
            className="w-12 h-12 flex items-center justify-center p-3"
            variant={"outline"}
          >
            <Icon className={`${iconColor} !h-full !w-full`} />
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
