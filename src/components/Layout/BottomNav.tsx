import { Home, Calendar, Zap, MessageSquare, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Matches", path: "/matches" },
  { icon: Zap, label: "Auto Place", path: "/auto-place" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px] transition-colors"
            activeClassName="nav-item-active"
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};