import { useAuth } from "@/contexts/AuthContext";

export const HeroSection = () => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Player';

  return (
    <div className="relative h-56 overflow-hidden">
      {/* Stadium Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      
      {/* Orange Accent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <h1 className="text-3xl font-black text-foreground leading-tight">
          Ready for your next game,
          <br />
          <span className="text-primary">{userName}?</span>
        </h1>
      </div>
    </div>
  );
};