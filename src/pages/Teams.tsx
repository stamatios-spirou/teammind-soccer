import { Users, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const yourTeams = [
  {
    id: "1",
    name: "Blue Thunder",
    color: "bg-blue-rich",
    skillLevel: "Intermediate",
    lastPlayed: "2 days ago",
    wins: 8,
    losses: 3,
  },
  {
    id: "2",
    name: "Green Lightning",
    color: "bg-green-electric",
    skillLevel: "Advanced",
    lastPlayed: "1 week ago",
    wins: 12,
    losses: 2,
  },
];

const suggestedTeams = [
  {
    id: "3",
    name: "Red Warriors",
    color: "bg-destructive",
    skillLevel: "Intermediate",
    matchPercentage: 95,
  },
  {
    id: "4",
    name: "Yellow Strikers",
    color: "bg-yellow-500",
    skillLevel: "Beginner",
    matchPercentage: 87,
  },
];

const Teams = () => {
  return (
    <div className="min-h-screen pt-6 px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Teams</h1>
        <p className="text-muted-foreground">Your squads and recommendations</p>
      </div>

      <Tabs defaultValue="your-teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="your-teams">Your Teams</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="your-teams" className="space-y-4">
          {yourTeams.map((team) => (
            <Card key={team.id} className="p-5 bg-card">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl ${team.color} flex items-center justify-center shrink-0`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{team.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="badge-skill">
                      {team.skillLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Last played {team.lastPlayed}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {team.wins}W - {team.losses}L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suggested" className="space-y-4">
          {suggestedTeams.map((team) => (
            <Card key={team.id} className="p-5 bg-card">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl ${team.color} flex items-center justify-center shrink-0`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{team.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="badge-skill">
                      {team.skillLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {team.matchPercentage}% Match
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No past teams yet</h3>
            <p className="text-sm text-muted-foreground">
              Teams you've played with will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Teams;
