import { Heart, MessageCircle, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
interface Post {
  id: string;
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  matchTag?: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: "1",
    username: "Alex_Striker",
    content: "What a game today! 3 goals and we clinched the win 🔥⚽",
    mediaUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&q=80",
    matchTag: "Lubetkin Field • 5pm",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 24,
    comments: 8,
  },
  {
    id: "2",
    username: "GoalieKing",
    content: "Clean sheet today! Defense was solid 💪",
    matchTag: "Rutgers Field • 3pm",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 18,
    comments: 5,
  },
  {
    id: "3",
    username: "MidFieldMaestro",
    content: "Looking for players for tomorrow's 7v7 at Lubetkin! Drop a comment if you're in",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 32,
    comments: 14,
  },
];

export const SocialFeed = () => {
  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Community Feed</h2>
      
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <div key={post.id} className="bg-card rounded-xl p-4 border border-border">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {post.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{post.username}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-foreground mb-3">{post.content}</p>

            {/* Media */}
            {post.mediaUrl && (
              <div className="rounded-lg overflow-hidden mb-3">
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Match Tag */}
            {post.matchTag && (
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">{post.matchTag}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-2 border-t border-border">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};