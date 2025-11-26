import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-screen-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
