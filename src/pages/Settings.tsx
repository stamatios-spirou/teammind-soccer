import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const settingsOptions = [
  {
    icon: User,
    label: "Profile",
    description: "Update your information",
    section: "account",
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "Manage your alerts",
    section: "account",
  },
  {
    icon: Shield,
    label: "Privacy & Security",
    description: "Control your data",
    section: "account",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get assistance",
    section: "support",
  },
];

const Settings = () => {
  return (
    <div className="min-h-screen pt-6 px-4 pb-8">
      {/* Profile Header */}
      <Card className="p-6 bg-card mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              AC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Alex Chen</h2>
            <p className="text-sm text-muted-foreground mb-2">alex.chen@university.edu</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="badge-skill">
                Midfielder
              </Badge>
              <Badge variant="outline" className="badge-skill border-primary text-primary">
                Intermediate
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">8.5</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">92%</div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </div>
      </Card>

      {/* Settings Options */}
      <div className="space-y-2">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.label}
              className="p-4 bg-card cursor-pointer hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Logout Button */}
      <Card className="mt-6 p-4 bg-destructive/10 border-destructive cursor-pointer hover:bg-destructive/20 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Log Out</h3>
            <p className="text-sm text-destructive/80">Sign out of your account</p>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>TeamMind v1.0.0</p>
        <p className="mt-1">© 2025 TeamMind. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
