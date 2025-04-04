
import React from "react";
import { Badge } from "@/components/ui/badge";
import { KeyStatus } from "@/types";

interface StatusBadgeProps {
  status: KeyStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "available":
        return {
          color: "bg-keyStatus-available text-white",
          label: "Available"
        };
      case "issued":
        return {
          color: "bg-keyStatus-issued text-white",
          label: "Issued"
        };
      case "missing":
        return {
          color: "bg-keyStatus-missing text-white",
          label: "Missing"
        };
      case "recovered":
        return {
          color: "bg-purple-600 text-white",
          label: "Recovered"
        };
      default:
        return {
          color: "bg-gray-500 text-white",
          label: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.color} uppercase text-xs font-medium py-1 px-2`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
