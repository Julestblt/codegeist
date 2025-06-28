import type { Vulnerability, AnalysisResult, FileNode, Project } from "@/types";

const VULNERABILITY_PATTERNS = {
  javascript: [
    {
      pattern: /eval\s*\(/gi,
      type: "critical" as const,
      title: "Code Injection - eval() usage",
      description:
        "Use of eval() function can lead to code injection vulnerabilities",
      recommendation:
        "Avoid using eval(). Use JSON.parse() for JSON data or implement safer alternatives.",
      cweId: "CWE-94",
    },
    {
      pattern: /innerHTML\s*=/gi,
      type: "high" as const,
      title: "XSS - innerHTML usage",
      description:
        "Direct innerHTML assignment can lead to Cross-Site Scripting (XSS) vulnerabilities",
      recommendation:
        "Use textContent or DOM manipulation methods instead of innerHTML.",
      cweId: "CWE-79",
    },
    {
      pattern: /setTimeout\s*\(\s*["'`]/gi,
      type: "medium" as const,
      title: "Code Injection - setTimeout with string",
      description:
        "Using setTimeout with string parameter can lead to code injection",
      recommendation:
        "Use setTimeout with function references instead of strings.",
      cweId: "CWE-94",
    },
  ],
  react: [
    {
      pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:/gi,
      type: "high" as const,
      title: "XSS - dangerouslySetInnerHTML",
      description:
        "React dangerouslySetInnerHTML can lead to XSS if used with untrusted content",
      recommendation:
        "Sanitize HTML content or use text interpolation instead of dangerouslySetInnerHTML.",
      cweId: "CWE-79",
    },
  ],
  sql: [
    {
      pattern: /SELECT\s+.*\s+WHERE\s+.*\+.*["'`]/gi,
      type: "critical" as const,
      title: "SQL Injection - String concatenation",
      description:
        "SQL queries using string concatenation are vulnerable to SQL injection",
      recommendation: "Use parameterized queries or prepared statements.",
      cweId: "CWE-89",
    },
  ],
  generic: [
    {
      pattern: /password\s*=\s*["'`][^"'`]+["'`]/gi,
      type: "critical" as const,
      title: "Hardcoded Password",
      description: "Hardcoded passwords in source code pose security risks",
      recommendation:
        "Use environment variables or secure configuration files for passwords.",
      cweId: "CWE-798",
    },
    {
      pattern: /api[_-]?key\s*=\s*["'`][^"'`]+["'`]/gi,
      type: "high" as const,
      title: "Hardcoded API Key",
      description: "API keys should not be hardcoded in source code",
      recommendation:
        "Store API keys in environment variables or secure vaults.",
      cweId: "CWE-798",
    },
    {
      pattern: /console\.log\s*\(/gi,
      type: "low" as const,
      title: "Debug Information Disclosure",
      description:
        "Console.log statements may leak sensitive information in production",
      recommendation:
        "Remove console.log statements before production deployment.",
      cweId: "CWE-532",
    },
  ],
};

export const analyzeCode = async (
  project: Project
): Promise<AnalysisResult> => {
  const vulnerabilities: Vulnerability[] = [];
  let filesAnalyzed = 0;

  const analyzeNode = (node: FileNode) => {
    if (node.type === "file" && node.content) {
      filesAnalyzed++;
      const fileVulns = analyzeFileContent(node);
      vulnerabilities.push(...fileVulns);
    }

    if (node.children) {
      node.children.forEach(analyzeNode);
    }
  };

  project.files.forEach(analyzeNode);

  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  const summary = calculateSummary(vulnerabilities);

  return {
    id: generateId(),
    projectId: project.id,
    timestamp: new Date(),
    vulnerabilities,
    summary,
    coverage: {
      filesAnalyzed,
      totalFiles: project.fileCount,
      percentage: Math.round((filesAnalyzed / project.fileCount) * 100),
    },
  };
};

const analyzeFileContent = (file: FileNode): Vulnerability[] => {
  const vulnerabilities: Vulnerability[] = [];
  const content = file.content!;
  const lines = content.split("\n");

  const patterns = [
    ...VULNERABILITY_PATTERNS.generic,
    ...getLanguagePatterns(file.extension),
  ];

  patterns.forEach((patternDef) => {
    let match;
    const regex = new RegExp(
      patternDef.pattern.source,
      patternDef.pattern.flags
    );

    lines.forEach((line, lineIndex) => {
      while ((match = regex.exec(line)) !== null) {
        vulnerabilities.push({
          id: generateId(),
          type: patternDef.type,
          title: patternDef.title,
          description: patternDef.description,
          file: file.path,
          line: lineIndex + 1,
          column: match.index + 1,
          code: line.trim(),
          recommendation: patternDef.recommendation,
          cweId: patternDef.cweId,
        });

        if (!patternDef.pattern.global) break;
      }
      regex.lastIndex = 0;
    });
  });

  return vulnerabilities;
};

const getLanguagePatterns = (extension?: string) => {
  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return [
        ...VULNERABILITY_PATTERNS.javascript,
        ...VULNERABILITY_PATTERNS.react,
      ];
    case "sql":
      return VULNERABILITY_PATTERNS.sql;
    default:
      return [];
  }
};

const calculateSummary = (vulnerabilities: Vulnerability[]) => {
  const summary = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  vulnerabilities.forEach((vuln) => {
    summary[vuln.type]++;
  });

  return summary;
};

const generateId = () => Math.random().toString(36).substr(2, 9);
