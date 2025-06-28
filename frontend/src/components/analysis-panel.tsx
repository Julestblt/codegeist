import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react";
import type { AnalysisResult, Vulnerability } from "@/types";

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  onVulnerabilitySelect: (vulnerability: Vulnerability) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  onVulnerabilitySelect,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);

  const filteredVulnerabilities =
    selectedSeverity === "all"
      ? analysis?.vulnerabilities || []
      : analysis?.vulnerabilities.filter((v) => v.type === selectedSeverity) ||
        [];

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "critical":
        return { component: XCircle, class: "w-5 h-5 text-red-600" };
      case "high":
        return { component: AlertCircle, class: "w-5 h-5 text-orange-600" };
      case "medium":
        return { component: AlertTriangle, class: "w-5 h-5 text-yellow-600" };
      case "low":
        return { component: Info, class: "w-5 h-5 text-blue-600" };
      default:
        return { component: Info, class: "w-5 h-5 text-gray-600" };
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200";
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const handleVulnerabilityClick = (vuln: Vulnerability) => {
    onVulnerabilitySelect(vuln);
    setExpandedVuln(expandedVuln === vuln.id ? null : vuln.id);
  };

  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No analysis available</p>
          <p className="text-sm">
            Upload and analyze a project to see security results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Security Analysis
          </h3>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Total Issues
              </span>
              <span className="text-lg font-bold text-gray-900">
                {analysis.summary.total}
              </span>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                Coverage
              </span>
              <span className="text-lg font-bold text-green-700">
                {analysis.coverage.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {
              type: "critical",
              count: analysis.summary.critical,
              color: "text-red-600",
            },
            {
              type: "high",
              count: analysis.summary.high,
              color: "text-orange-600",
            },
            {
              type: "medium",
              count: analysis.summary.medium,
              color: "text-yellow-600",
            },
            {
              type: "low",
              count: analysis.summary.low,
              color: "text-blue-600",
            },
          ].map(({ type, count, color }) => (
            <div key={type} className="text-center p-2 bg-gray-50 rounded">
              <div className={`text-lg font-bold ${color}`}>{count}</div>
              <div className="text-xs text-gray-600 capitalize">{type}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredVulnerabilities.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-gray-900">No issues found</p>
            <p className="text-sm text-gray-600">
              {selectedSeverity === "all"
                ? "Your code looks secure!"
                : `No ${selectedSeverity} severity issues found.`}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredVulnerabilities.map((vuln) => {
              const SeverityIcon = getSeverityIcon(vuln.type);
              return (
                <div
                  key={vuln.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getSeverityColor(
                    vuln.type
                  )}`}
                  onClick={() => handleVulnerabilityClick(vuln)}
                >
                  <div className="flex items-start space-x-3">
                    <SeverityIcon.component className={SeverityIcon.class} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {vuln.title}
                        </h4>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {vuln.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {vuln.description}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-600 space-x-4">
                        <span>{vuln.file}</span>
                        <span>Line {vuln.line}</span>
                        {vuln.cweId && <span>{vuln.cweId}</span>}
                      </div>

                      {expandedVuln === vuln.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            <div>
                              <h5 className="text-xs font-medium text-gray-900">
                                Code:
                              </h5>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {vuln.code}
                              </code>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-gray-900">
                                Recommendation:
                              </h5>
                              <p className="text-xs text-gray-700">
                                {vuln.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
