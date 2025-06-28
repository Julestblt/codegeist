import type { Project, FileNode, AnalysisResult, Vulnerability } from "@/types";

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock file structure for e-commerce project
const ecommerceFiles: FileNode[] = [
  {
    id: generateId(),
    name: "src",
    type: "folder",
    path: "src",
    children: [
      {
        id: generateId(),
        name: "components",
        type: "folder",
        path: "src/components",
        children: [
          {
            id: generateId(),
            name: "Auth.tsx",
            type: "file",
            path: "src/components/Auth.tsx",
            extension: "tsx",
            size: 2847,
            content: `import React, { useState } from 'react';

const Auth = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const handleLogin = async () => {
    // VULNERABILITY: Hardcoded API endpoint
    const response = await fetch('https://api.example.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password // VULNERABILITY: Plain text password
      })
    });
    
    const data = await response.json();
    
    // VULNERABILITY: Using eval for response processing
    eval('window.user = ' + JSON.stringify(data));
    
    // VULNERABILITY: XSS via innerHTML
    document.getElementById('welcome')!.innerHTML = 'Welcome ' + data.name;
  };

  return (
    <div className="auth-container">
      <input 
        type="text" 
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        placeholder="Username"
      />
      <input 
        type="password" 
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
      <div id="welcome"></div>
    </div>
  );
};

export default Auth;`,
          },
          {
            id: generateId(),
            name: "ProductList.tsx",
            type: "file",
            path: "src/components/ProductList.tsx",
            extension: "tsx",
            size: 1923,
            content: `import React, { useEffect, useState } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      // VULNERABILITY: Hardcoded API key
      const api_key = "sk-1234567890abcdef";
      
      const response = await fetch('/api/products?key=' + api_key);
      const data = await response.json();
      setProducts(data);
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="product-list">
      {products.map((product: any) => (
        <div key={product.id}>
          {/* VULNERABILITY: XSS via dangerouslySetInnerHTML */}
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;`,
          },
        ],
      },
      {
        id: generateId(),
        name: "utils",
        type: "folder",
        path: "src/utils",
        children: [
          {
            id: generateId(),
            name: "database.js",
            type: "file",
            path: "src/utils/database.js",
            extension: "js",
            size: 1456,
            content: `const mysql = require('mysql');

// VULNERABILITY: Hardcoded database credentials
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'admin123',
  database: 'ecommerce'
});

const getUserById = (userId) => {
  // VULNERABILITY: SQL Injection
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        console.log('Database error:', error); // VULNERABILITY: Information disclosure
        reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = { getUserById };`,
          },
        ],
      },
    ],
  },
  {
    id: generateId(),
    name: "package.json",
    type: "file",
    path: "package.json",
    extension: "json",
    size: 892,
    content: `{
  "name": "ecommerce-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  },
];

// Mock vulnerabilities
const ecommerceVulnerabilities: Vulnerability[] = [
  {
    id: generateId(),
    type: "critical",
    title: "Code Injection - eval() usage",
    description:
      "Use of eval() function can lead to code injection vulnerabilities",
    file: "src/components/Auth.tsx",
    line: 18,
    column: 5,
    code: "eval('window.user = ' + JSON.stringify(data));",
    recommendation:
      "Avoid using eval(). Use JSON.parse() for JSON data or implement safer alternatives.",
    cweId: "CWE-94",
  },
  {
    id: generateId(),
    type: "critical",
    title: "SQL Injection - String concatenation",
    description:
      "SQL queries using string concatenation are vulnerable to SQL injection",
    file: "src/utils/database.js",
    line: 12,
    column: 19,
    code: 'const query = "SELECT * FROM users WHERE id = \'" + userId + "\'";',
    recommendation: "Use parameterized queries or prepared statements.",
    cweId: "CWE-89",
  },
  {
    id: generateId(),
    type: "high",
    title: "XSS - innerHTML usage",
    description:
      "Direct innerHTML assignment can lead to Cross-Site Scripting (XSS) vulnerabilities",
    file: "src/components/Auth.tsx",
    line: 21,
    column: 5,
    code: "document.getElementById('welcome')!.innerHTML = 'Welcome ' + data.name;",
    recommendation:
      "Use textContent or DOM manipulation methods instead of innerHTML.",
    cweId: "CWE-79",
  },
  {
    id: generateId(),
    type: "high",
    title: "XSS - dangerouslySetInnerHTML",
    description:
      "React dangerouslySetInnerHTML can lead to XSS if used with untrusted content",
    file: "src/components/ProductList.tsx",
    line: 23,
    column: 10,
    code: "<div dangerouslySetInnerHTML={{ __html: product.description }} />",
    recommendation:
      "Sanitize HTML content or use text interpolation instead of dangerouslySetInnerHTML.",
    cweId: "CWE-79",
  },
  {
    id: generateId(),
    type: "high",
    title: "Hardcoded API Key",
    description: "API keys should not be hardcoded in source code",
    file: "src/components/ProductList.tsx",
    line: 8,
    column: 21,
    code: 'const api_key = "sk-1234567890abcdef";',
    recommendation: "Store API keys in environment variables or secure vaults.",
    cweId: "CWE-798",
  },
  {
    id: generateId(),
    type: "critical",
    title: "Hardcoded Password",
    description: "Hardcoded passwords in source code pose security risks",
    file: "src/utils/database.js",
    line: 7,
    column: 12,
    code: "password: 'admin123',",
    recommendation:
      "Use environment variables or secure configuration files for passwords.",
    cweId: "CWE-798",
  },
  {
    id: generateId(),
    type: "low",
    title: "Debug Information Disclosure",
    description:
      "Console.log statements may leak sensitive information in production",
    file: "src/utils/database.js",
    line: 18,
    column: 9,
    code: "console.log('Database error:', error);",
    recommendation:
      "Remove console.log statements before production deployment.",
    cweId: "CWE-532",
  },
];

// Mock analysis result
const ecommerceAnalysis: AnalysisResult = {
  id: generateId(),
  projectId: "ecommerce-project",
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  vulnerabilities: ecommerceVulnerabilities,
  summary: {
    total: 7,
    critical: 3,
    high: 3,
    medium: 0,
    low: 1,
    info: 0,
  },
  coverage: {
    filesAnalyzed: 4,
    totalFiles: 4,
    percentage: 100,
  },
};

// Mock projects
export const mockProjects: Project[] = [
  {
    id: "ecommerce-project",
    name: "E-Commerce Platform",
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    fileCount: 4,
    size: 7118,
    status: "completed",
    files: ecommerceFiles,
    analysis: ecommerceAnalysis,
  },
  {
    id: "blog-project",
    name: "Personal Blog",
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    fileCount: 12,
    size: 24567,
    status: "completed",
    files: [
      {
        id: generateId(),
        name: "index.html",
        type: "file",
        path: "index.html",
        extension: "html",
        size: 1234,
        content:
          "<html><head><title>Blog</title></head><body><h1>My Blog</h1></body></html>",
      },
    ],
    analysis: {
      id: generateId(),
      projectId: "blog-project",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      vulnerabilities: [
        {
          id: generateId(),
          type: "medium",
          title: "Missing Security Headers",
          description: "HTML page lacks security headers",
          file: "index.html",
          line: 1,
          code: "<html>",
          recommendation:
            "Add Content Security Policy and other security headers.",
          cweId: "CWE-693",
        },
      ],
      summary: {
        total: 1,
        critical: 0,
        high: 0,
        medium: 1,
        low: 0,
        info: 0,
      },
      coverage: {
        filesAnalyzed: 12,
        totalFiles: 12,
        percentage: 100,
      },
    },
  },
  {
    id: "api-project",
    name: "REST API Service",
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    fileCount: 8,
    size: 15432,
    status: "analyzing",
    files: [
      {
        id: generateId(),
        name: "server.js",
        type: "file",
        path: "server.js",
        extension: "js",
        size: 2345,
        content:
          'const express = require("express");\nconst app = express();\napp.listen(3000);',
      },
    ],
  },
  {
    id: "mobile-project",
    name: "Mobile App Backend",
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    fileCount: 23,
    size: 45678,
    status: "error",
    files: [],
  },
];
