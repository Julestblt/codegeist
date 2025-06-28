import React from "react";
import { Shield, Settings, User, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = {
    dashboard: {
      label: "Dashboard",
      path: "/",
    },
    projects: {
      label: "Projects",
      path: "/projects",
    },
  };

  const getCurrentView = () => {
    if (location.pathname.startsWith("/projects")) return "projects";
    return "dashboard";
  };

  const currentView = getCurrentView();

  return (
    <header className="bg-background px-6 py-4 shadow-sm border-b">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <Shield className="w-8 h-8 " />
            <Zap className="w-4 h-4 absolute -top-0.5 -right-0.5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text ">CodeGeist</h1>
            <p className="text-xs text-slate-500 font-medium">
              Code Security Analysis
            </p>
          </div>
        </div>

        <nav className="flex items-center space-x-1">
          {Object.entries(navigationItems).map(([key, { label, path }]) => (
            <Button
              key={key}
              variant={currentView === key ? "secondary" : "ghost"}
              onClick={() => navigate(path)}
            >
              {label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
