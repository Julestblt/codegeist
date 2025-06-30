import React, { useEffect, useState } from "react";
import { AlertTriangle, Info, AlertCircle, XCircle } from "lucide-react";
import {
  getFileContent,
  getVulnerabilitiesForFile,
  type Vulnerability,
} from "@/services/api";
import type { FileNode } from "@/types";

interface CodeViewerProps {
  file: FileNode | null;
  path: string | null;
  projectId?: string | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, path, projectId }) => {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mimeType, setMimeType] = useState<string>("text/plain");
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);

  useEffect(() => {
    setVulnerabilities([]);
    if (!projectId || !path) {
      setCode("");
      return;
    }

    let cancel = false;
    setLoading(true);

    const fetchContent = async () => {
      const { content, mimeType } = await getFileContent(projectId, path);
      if (!cancel) {
        setCode(content || "");
        setMimeType(mimeType || "text/plain");
        setLoading(false);
      }

      if (file?.id) {
        setVulnerabilities(await getVulnerabilitiesForFile(projectId, file.id));
      }
    };

    fetchContent();

    return () => {
      cancel = true;
    };
  }, [projectId, path]);

  const icon = (sev: string) => {
    const map = {
      critical: { component: XCircle, class: "text-red-600" },
      high: { component: AlertCircle, class: "text-orange-600" },
      medium: { component: AlertTriangle, class: "text-yellow-600" },
      low: { component: Info, class: "text-blue-600" },
    } as const;
    return (
      map[sev as keyof typeof map] ?? {
        component: Info,
        class: "text-gray-600",
      }
    );
  };

  const color = (sev: string) => {
    const map = {
      critical: "bg-red-50 dark:bg-red-900/20",
      high: "bg-orange-50 dark:bg-orange-900/20",
      medium: "bg-yellow-50 dark:bg-yellow-900/20",
      low: "bg-blue-50 dark:bg-blue-900/20",
    } as const;
    return map[sev as keyof typeof map] ?? "bg-gray-50 border-gray-200";
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Select a file to view its content
          </p>
          <p className="text-sm">
            Choose a file from the explorer to start code review
          </p>
        </div>
      </div>
    );
  }

  const lines = code.split("\n");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{file.name}</h3>
            <p className="text-sm">{file.path}</p>
          </div>
          {vulnerabilities.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {vulnerabilities.length} issue
                {vulnerabilities.length !== 1 ? "s" : ""} found
              </span>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <div className="text-sm">
                {lines.map((line, idx) => {
                  const lineNo = idx + 1;
                  const lineVulns = vulnerabilities.filter((v) => {
                    if (v.lines.includes(lineNo)) return true;

                    if (v.lines.length === 2) {
                      const [start, end] = v.lines.sort((a, b) => a - b);
                      return lineNo >= start && lineNo <= end;
                    }

                    return false;
                  });
                  const has = lineVulns.length > 0;

                  // Only show vulnerabilities after their last line
                  const vulnsToShow = vulnerabilities.filter(
                    (v) => Math.max(...v.lines) === lineNo
                  );

                  return (
                    <div key={idx} className="flex">
                      <div
                        className={`w-12 px-2 py-1 text-right text-xs select-none border-r
                      ${
                        has
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                      >
                        {lineNo}
                      </div>

                      <div
                        className={`flex-1 px-4 py-1 font-mono break-words whitespace-pre-wrap ${
                          has ? "bg-red-50 dark:bg-red-900/20" : ""
                        }`}
                      >
                        <code>{line || " "}</code>

                        {vulnsToShow.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {vulnsToShow.map((v) => {
                              const Icon = icon(v.severity.toLowerCase());
                              return (
                                <div
                                  key={v.id}
                                  className={`p-3 rounded-lg border ${color(
                                    v.severity.toLowerCase()
                                  )}`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <Icon.component
                                      className={`w-4 h-4 ${Icon.class}`}
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-medium">{v.type}</h4>
                                      <p className="text-sm">{v.description}</p>
                                      <p className="mt-2 text-xs">
                                        <span className="font-medium">
                                          Fix:
                                        </span>{" "}
                                        {v.recommendation}
                                      </p>
                                      {v.cwe && v.cwe !== "null" && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs rounded">
                                          {v.cwe}
                                        </span>
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
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
