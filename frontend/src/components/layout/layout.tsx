import React from "react";
import type { ReactNode } from "react";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
