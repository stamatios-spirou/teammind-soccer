interface PositionBarProps {
  positions: {
    gk: { filled: number; max: number };
    def: { filled: number; max: number };
    mid: { filled: number; max: number };
    fwd: { filled: number; max: number };
  };
  userPreferredPosition?: string;
}

const positionLabels = {
  gk: "GK",
  def: "DEF",
  mid: "MID",
  fwd: "FWD",
};

const positionMap: Record<string, string> = {
  goalkeeper: "gk",
  defender: "def",
  midfielder: "mid",
  forward: "fwd",
};

export const PositionBar = ({ positions, userPreferredPosition }: PositionBarProps) => {
  const mappedUserPosition = userPreferredPosition ? positionMap[userPreferredPosition] : null;

  return (
    <div className="flex items-center gap-2">
      {(Object.keys(positions) as Array<keyof typeof positions>).map((pos) => {
        const { filled, max } = positions[pos];
        const isOpen = filled < max;
        const isUserPreferred = mappedUserPosition === pos;
        
        // Gold glow only for user's preferred position when it's open
        const isGold = isUserPreferred && isOpen;
        // Gray when full
        const isGray = !isOpen;
        
        return (
          <div
            key={pos}
            className={`
              flex items-center justify-center w-10 h-7 rounded-md text-xs font-bold uppercase
              transition-all duration-200
              ${isGold ? "bg-gold-position text-black shadow-glow-gold animate-pulse-glow" : ""}
              ${isGray && !isGold ? "bg-muted-foreground/30 text-muted-foreground" : ""}
              ${!isGold && !isGray ? "border border-primary/40 bg-transparent text-primary/80" : ""}
            `}
          >
            {positionLabels[pos]}
          </div>
        );
      })}
    </div>
  );
};