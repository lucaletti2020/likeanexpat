import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showLogout?: boolean;
  solidBackground?: boolean;
}

export function Header({ showLogout, solidBackground }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("onboarding_complete");
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        solidBackground
          ? "bg-white/10 backdrop-blur border-white/10"
          : "bg-background/80 backdrop-blur border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <Globe className="w-6 h-6" />
          Like an Expat
        </Link>

        <nav className="flex items-center gap-4">
          {showLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Log out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
