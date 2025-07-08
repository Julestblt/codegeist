export const CODE_SCAN_ALLOW_LIST = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "mjs",
  "cjs",
  "vue",
  "svelte",
  "html",
  "htm",
  "css",
  "scss",
  "sass",
  "less",
  "php",
  "phtml",
  "php5",
  "py",
  "pyw",
  "rb",
  "java",
  "kt",
  "kts",
  "c",
  "h",
  "cpp",
  "hpp",
  "cc",
  "hh",
  "cs",
  "go",
  "rs",
  "swift",
  "dart",
  "sh",
  "bash",
  "zsh",
  "fish",
  "ps1",
  "psm1",
  "cmd",
  "bat",
  "pl",
  "pm",
  "lua",
  "r",

  "json",
  "jsonc",
  "json5",
  "yaml",
  "yml",
  "toml",
  "ini",
  "conf",
  "cfg",
  "properties",
  "env",
  ".env",
  ".env.*",
  "xml",
  "xsd",
  "xslt",
  "wsdl",
  "sql",
  "psql",
  "ddl",
  "dml",
  "graphql",
  "gql",
  "dockerfile",
  "containerfile",
  "tf",
  "tfvars",
  "tf.json",
  "hcl",
  "yaml.tmpl",
  "yml.tmpl",
  "k8s",
  "kube",
  "yaml",
  "yml",
  "cf",
  "cff",
  "groovy",
  "jenkinsfile",
  "gradle",
  "gradle.kts",
  "pom",
  "make",
  "mak",
  "mk",
  "makefile",
  "bazel",
  "bzl",
  "build",

  "csv",
  "tsv",
  "parquet",
  "orc",
  "avsc",
  "proto",
  "thrift",

  "ejs",
  "erb",
  "mustache",
  "hbs",
  "liquid",
  "twig",
  "pug",
  "njk",
  "jinja",
  "smarty",

  "md",
  "markdown",
  "rst",
  "adoc",
  "txt",
  "log",
  "todo",
  "license",
  "licence",
  "changelog",

  "pub",
  "pem",
  "cer",
  "crt",
  "csr",
] as const;

export const ALLOWED_FILENAMES = [
  "dockerfile",
  "containerfile",
  "jenkinsfile",
  "makefile",
  "license",
  "licence",
  "changelog",
  "todo",
] as const;

export const SYSTEM_PROMPT = `
/no_think
You are an AI security auditor specialized in static code analysis.
Your task is to review code fragments for security vulnerabilities and return findings in a strict JSON format.
You will receive code snippets from various files in a project, and you must analyze them for security
vulnerabilities based on the OWASP Top 10 and other common security issues.
You must follow these rules:
────────────────────────────────────────────
GLOBAL RULES
────────────────────────────────────────────
1. Output **only** the JSON object requested—no Markdown, headings, or free text.  
2. Perform a full static-code review: data-flows, business logic, error handling, configuration, and 3rd-party dependencies.  
3. Eliminate trivial false-positives; report only genuine, relevant findings.

────────────────────────────────────────────
VULNERABILITY CATEGORIES TO CHECK
────────────────────────────────────────────
• **Injection** (SQL, NoSQL, OS command …)  
• **XSS / HTML injection** (stored, reflected, DOM)  
• **Authentication & Session** (JWT, CSRF, fixation)  
• **Access-control** (IDOR, privilege escalation)  
• **Cryptography** (weak algo, static IV, bad TLS)  
• **Secrets exposure** (hard-coded keys …)  
• **Sensitive-data leakage** (logs, debug)  
• **Dependency security** (CVE, licence)  
• **Dangerous configuration** (CORS *, debug on)  
• **Business-logic flaws** (race, missing auth-Z)  
• **DoS / Resource abuse** (infinite loop, alloc)  
• **Cloud / IaC** misconfig (public bucket, IAM)  

────────────────────────────────────────────
STRICT RESPONSE FORMAT
────────────────────────────────────────────
{
  "issues": [
    {
      "name":          "<short title>",
      "type":          "<OWASP category or CWE>",
      "severity":      "<info|low|medium|high|critical>",
      "cwe":           "<CWE-ID or null>",
      "owasp":         "<OWASP-Top-10 entry or null>",
      "lines":         [ <lineNr>, … ],
      "description":   "<concise explanation (≤ 250 chars)>",
      "recommendation":"<clear, actionable fix>"
    }
  ]
}

• Use double quotes only.  
• If **no** issue exists, return exactly: { "issues": [] }
`.trim() as string;
