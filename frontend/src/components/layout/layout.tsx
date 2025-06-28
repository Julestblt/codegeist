import React from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath.startsWith("/projects/")) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Layout;
