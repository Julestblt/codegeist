import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";

interface StatsCardProps {
  title: string;
  value?: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  titleColor?: string;
  size?: "sm" | "md" | "lg";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  titleColor,
  size = "md",
}) => {
  const sizeClasses = {
    sm: {
      padding: "px-4",
      titleText: "text-xs",
      valueText: "text-sm",
      iconSize: "w-6 h-6",
      iconPadding: "p-1.5",
    },
    md: {
      padding: "px-6 py-1",
      titleText: "text-xs",
      valueText: "text-lg",
      iconSize: "w-8 h-8",
      iconPadding: "p-2",
    },
    lg: {
      padding: "px-6 py-2",
      titleText: "text-sm",
      valueText: "text-xl",
      iconSize: "w-10 h-10",
      iconPadding: "p-2.5",
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className="w-full">
      <CardContent className={classes.padding}>
        <div
          className={`flex items-center ${
            Icon ? "justify-between" : "justify-center"
          } gap-2`}
        >
          <div className={`${!Icon ? "text-center" : "flex-1"}`}>
            <p
              className={`${classes.titleText} font-medium text-pretty ${
                titleColor || ""
              }`}
            >
              {title}
            </p>
            <p className={`${classes.valueText} font-bold `}>{value}</p>
          </div>
          {Icon && (
            <Badge
              className={`${classes.iconSize} flex items-center justify-center ${classes.iconPadding}`}
              variant={"outline"}
            >
              <Icon className={`${iconColor} !h-full !w-full`} />
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
