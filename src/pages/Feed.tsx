import { useState, useEffect } from "react";
import { Heart, MessageCircle, Trophy, Plus, X, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  match_tag: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMatchTag, setNewPostMatchTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();

    // Subscribe to real-time updates
    const postsChannel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => loadPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes and comments counts
      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            user ? supabase.from('post_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle() : { data: null }
          ]);

          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            user_has_liked: !!userLikeResult.data
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error: any) {
      toast({ title: "Error loading posts", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPostContent.trim(),
        match_tag: newPostMatchTag.trim() || null
      });

      if (error) throw error;

      setNewPostContent("");
      setNewPostMatchTag("");
      setCreateDialogOpen(false);
      toast({ title: "Post created!" });
    } catch (error: any) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string, hasLiked: boolean) => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    try {
      if (hasLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: data }));
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      if (!comments[postId]) {
        await loadComments(postId);
      }
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: postId,
        user_id: user.id,
        content: newComment[postId].trim()
      });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: "" }));
      await loadComments(postId);
    } catch (error: any) {
      toast({ title: "Error posting comment", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pt-6 px-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Feed</h1>
          <p className="text-muted-foreground">Community updates & highlights</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-muted border-border min-h-[120px]"
              />
              <Input
                placeholder="Match tag (e.g., Lubetkin Field • 5pm)"
                value={newPostMatchTag}
                onChange={(e) => setNewPostMatchTag(e.target.value)}
                className="bg-muted border-border"
              />
              <Button
                onClick={handleCreatePost}
                disabled={submitting || !newPostContent.trim()}
                className="w-full bg-primary text-primary-foreground"
              >
                {submitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to share!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card rounded-xl p-4 border border-border">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {(post.profiles?.full_name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{post.profiles?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <p className="text-foreground mb-3">{post.content}</p>

              {/* Media */}
              {post.media_url && (
                <div className="rounded-lg overflow-hidden mb-3">
                  <img src={post.media_url} alt="Post media" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Match Tag */}
              {post.match_tag && (
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">{post.match_tag}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-2 border-t border-border">
                <button
                  onClick={() => handleToggleLike(post.id, post.user_has_liked)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.user_has_liked ? "text-red-500" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.user_has_liked ? "fill-current" : ""}`} />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button
                  onClick={() => handleToggleComments(post.id)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments_count}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments === post.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-xs">
                          {(comment.profiles?.full_name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-2">
                        <p className="text-xs font-semibold text-foreground">{comment.profiles?.full_name || "User"}</p>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ""}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="bg-muted border-border"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitComment(post.id)}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                      className="bg-primary text-primary-foreground shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;