import React from 'react';
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';
import type { FileNode, Vulnerability } from '@/types';

interface CodeViewerProps {
  file: FileNode | null;
  vulnerabilities: Vulnerability[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, vulnerabilities }) => {
  const fileVulns = file ? vulnerabilities.filter(v => v.file === file.path) : [];
  const lines = file?.content?.split('\n') || [];
  
  const getVulnerabilityIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return { component: XCircle, class: 'w-4 h-4 text-red-600' };
      case 'high':
        return { component: AlertCircle, class: 'w-4 h-4 text-orange-600' };
      case 'medium':
        return { component: AlertTriangle, class: 'w-4 h-4 text-yellow-600' };
      case 'low':
        return { component: Info, class: 'w-4 h-4 text-blue-600' };
      default:
        return { component: Info, class: 'w-4 h-4 text-gray-600' };
    }
  };

  const getVulnerabilityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Select a file to view its content</p>
          <p className="text-sm">Choose a file from the explorer to start code review</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-600">{file.path}</p>
          </div>
          {fileVulns.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {fileVulns.length} issue{fileVulns.length !== 1 ? 's' : ''} found
              </span>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto bg-gray-50">
          <div className="bg-white border-r border-gray-200">
            <pre className="text-sm">
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const lineVulns = fileVulns.filter(v => v.line === lineNumber);
                const hasVulnerability = lineVulns.length > 0;
                
                return (
                  <div key={index} className="flex">
                    <div className={`w-12 px-2 py-1 text-right text-xs text-gray-500 bg-gray-50 border-r border-gray-200 select-none ${hasVulnerability ? 'bg-red-50' : ''}`}>
                      {lineNumber}
                    </div>
                    <div className={`flex-1 px-4 py-1 font-mono text-sm ${hasVulnerability ? 'bg-red-50' : ''}`}>
                      <code className="text-gray-800">{line || ' '}</code>
                      {hasVulnerability && (
                        <div className="mt-2 space-y-2">
                          {lineVulns.map((vuln) => {
                            const VulnIcon = getVulnerabilityIcon(vuln.type);
                            return (
                              <div key={vuln.id} className={`p-3 rounded-lg border ${getVulnerabilityColor(vuln.type)}`}>
                                <div className="flex items-start space-x-2">
                                  <VulnIcon.component className={VulnIcon.class} />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {vuln.title}
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                      {vuln.description}
                                    </p>
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-gray-600">
                                        Recommendation:
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {vuln.recommendation}
                                      </p>
                                    </div>
                                    {vuln.cweId && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                          {vuln.cweId}
                                        </span>
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
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;