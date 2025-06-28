import React from "react";
import type { ReactNode } from "react";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentPath = window.location.pathname;

  if (currentPath.startsWith("/projects/")) {
    return (
      <div className="h-screen">
        <Header />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {children}
    </div>
  );
};

export default Layout;
