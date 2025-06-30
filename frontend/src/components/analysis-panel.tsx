import React, { useEffect, useState } from "react";
import {
  Info,
  CheckCircle,
  Clock,
  Filter,
  XCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import type { Vulnerability } from "@/types";
import type { Scans } from "@/services/api";
import StatCard from "./ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AnalysisPanelProps {
  onVulnerabilitySelect: (vulnerability: Vulnerability) => void;
  scans: Scans[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  onVulnerabilitySelect,
  scans,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scans | null>(null);

  useEffect(() => {
    console.log("Scans received:", scans);
    setSelectedScan(scans[0] || null);
    console.log("Selected scan:", scans[0]);
  }, [scans]);

  const handleVulnerabilityClick = (vuln: Vulnerability) => {
    onVulnerabilitySelect(vuln);
    setExpandedVuln(expandedVuln === vuln.id ? null : vuln.id);
  };

  if (scans.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-foreground">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No analysis available</p>
          <p className="text-sm">
            Start a scan to see security analysis results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Security Analysis
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            title="Total Issues"
            value={selectedScan?.results?.totalIssues || 0}
          />
          <StatCard
            title="Scanned Files"
            value={selectedScan?.results?.scannedFiles || 0}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries({
            critical: {
              title: "Critical",
              count: selectedScan?.results?.issuesBySeverity?.critical || 0,
              color: "text-red-600",
            },
            high: {
              title: "High",
              count: selectedScan?.results?.issuesBySeverity?.high || 0,
              color: "text-orange-600",
            },
            medium: {
              title: "Medium",
              count: selectedScan?.results?.issuesBySeverity?.medium || 0,
              color: "text-yellow-600",
            },
            low: {
              title: "Low",
              count: selectedScan?.results?.issuesBySeverity?.low || 0,
              color: "text-blue-600",
            },
          }).map(([key, { count, color, title }]) => (
            <StatCard
              key={key}
              layout="vertical"
              title={title}
              value={count}
              valueColor={color}
              className="cursor-pointer hover:bg-card transition-colors"
              onClick={() => {
                setSelectedSeverity(key);
                setExpandedVuln(null);
              }}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                onClick={() => {
                  setSelectedSeverity("all");
                }}
                value="all"
              >
                All Severities
              </SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedScan?.issues?.filter(
          (issue) =>
            selectedSeverity === "all" ||
            issue.severity.toLowerCase() === selectedSeverity
        ).length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-muted-foreground">
              No issues found
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedSeverity === "all"
                ? "Your code looks secure!"
                : `No ${selectedSeverity} severity issues found.`}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {selectedScan?.issues
              ?.filter(
                (issue) =>
                  selectedSeverity === "all" ||
                  issue.severity.toLowerCase() === selectedSeverity
              )
              .map((issue) => (
                <div
                  key={issue.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    issue.severity === "CRITICAL"
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : issue.severity === "HIGH"
                      ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                      : issue.severity === "MEDIUM"
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                      : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                  }`}
                  onClick={() =>
                    handleVulnerabilityClick({
                      id: issue.id,
                      title: issue.type,
                      description: issue.description,
                      type: issue.severity.toLowerCase() as
                        | "critical"
                        | "high"
                        | "medium"
                        | "low"
                        | "info",
                      file: issue.filePath,
                      line: issue.lines[0] || 0,
                      code: "",
                      recommendation: issue.recommendation,
                      cweId:
                        issue.cwe && issue.cwe !== "null"
                          ? issue.cwe
                          : undefined,
                    })
                  }
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {issue.severity === "CRITICAL" ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : issue.severity === "HIGH" ? (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          ) : issue.severity === "MEDIUM" ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Info className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">
                              {issue.type}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground font-thin mt-1">
                            {issue.description}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
                            <span className="truncate">{issue.filePath}</span>
                            <span className="whitespace-nowrap">
                              {issue.lines.length === 1 ? "Line" : "Lines"}{" "}
                              {issue.lines.join(", ")}
                            </span>
                            {issue.cwe !== "null" && <span>{issue.cwe}</span>}
                          </div>
                        </div>
                      </div>

                      {expandedVuln === issue.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 ">
                          <div className="space-y-2">
                            <div>
                              <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                Recommendation:
                              </h5>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
