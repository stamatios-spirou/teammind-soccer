import { useState } from "react";
import { MessageSquare, Users, Crown, Send, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const chatChannels = [
  {
    id: "1",
    name: "Blue Thunder",
    type: "team" as const,
    lastMessage: "See you at the field!",
    time: "2m ago",
    unread: 3,
  },
  {
    id: "2",
    name: "Captains Chat",
    type: "captain" as const,
    lastMessage: "Game postponed to 6:30",
    time: "15m ago",
    unread: 1,
  },
  {
    id: "3",
    name: "Green Lightning",
    type: "team" as const,
    lastMessage: "Great game everyone!",
    time: "1h ago",
    unread: 0,
  },
];

const mockMessages = [
  {
    id: "1",
    sender: "Sarah",
    message: "Hey everyone! Looking forward to today's game",
    time: "2:30 PM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    message: "Me too! What time are we meeting?",
    time: "2:32 PM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Mike",
    message: "5:45 at the field entrance",
    time: "2:33 PM",
    isOwn: false,
  },
];

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (selectedChat) {
    return (
      <div className="flex flex-col bg-background min-h-screen">
        {/* Chat Header */}
        <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChat(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">BT</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">Blue Thunder</h2>
            <p className="text-xs text-muted-foreground">12 members</p>
          </div>
          <Badge variant="outline" className="badge-skill">
            <Users className="w-3 h-3 mr-1" />
            Team
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
              {!msg.isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {msg.sender[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${msg.isOwn ? "items-end" : ""}`}>
                {!msg.isOwn && (
                  <span className="text-xs font-medium text-muted-foreground mb-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    msg.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-card border-t border-border px-4 py-3 mb-16">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-0"
            />
            <Button size="icon" className="rounded-full bg-primary shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chat</h1>
        <p className="text-muted-foreground">Stay connected with your teams</p>
      </div>

      <div className="space-y-2">
        {chatChannels.map((channel) => (
          <Card
            key={channel.id}
            className="p-4 bg-card cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => setSelectedChat(channel.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {channel.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {channel.name}
                  </h3>
                  {channel.type === "captain" && (
                    <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {channel.lastMessage}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">{channel.time}</span>
                {channel.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground rounded-full px-2 py-0">
                    {channel.unread}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-sm text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
};

export default Chat;
