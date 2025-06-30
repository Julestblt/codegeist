import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  layout?: "horizontal" | "vertical";
  titleColor?: string;
  valueColor?: string;
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  layout = "horizontal",
  titleColor = "text-gray-600 dark:text-gray-400",
  valueColor = "text-gray-900 dark:text-gray-100",
  className = "",
  onClick = () => {},
}) => {
  if (layout === "vertical") {
    return (
      <div
        className={`text-center p-2 bg-muted rounded ${className} border`}
        onClick={onClick}
      >
        <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
        <div className={`text-xs ${titleColor} capitalize`}>{title}</div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-muted rounded-lg ${className} border`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${titleColor}`}>{title}</span>
        <span className={`text-lg font-bold ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
