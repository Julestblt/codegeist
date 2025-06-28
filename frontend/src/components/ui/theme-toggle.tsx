import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="hover:text-white hover:bg-slate-700 transition-all duration-200"
      title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  );
};

export default ThemeToggle;
