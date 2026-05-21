import { RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import UpdatePrompt from "../ui/UpdatePrompt";

const PULL_THRESHOLD = 72;
const PULL_MAX = 100;

export default function Layout() {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const mainRef = useRef(null);

  function onTouchStart(e) {
    if (mainRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function onTouchMove(e) {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0 && mainRef.current?.scrollTop === 0) {
      setPullY(Math.min(dy * 0.45, PULL_MAX));
    }
  }

  function onTouchEnd() {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(0);
      touchStartY.current = null;
      setTimeout(() => window.location.reload(), 600);
    } else {
      setPullY(0);
      touchStartY.current = null;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center text-primary overflow-hidden transition-[height] duration-150"
        style={{ height: refreshing ? 36 : pullY > 0 ? pullY * 0.38 : 0 }}
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin" : ""}
          style={{
            opacity: Math.min(pullY / PULL_THRESHOLD, 1),
            transform: `rotate(${refreshing ? 0 : pullY * 3}deg)`,
            transition: "transform 0.05s linear",
          }}
        />
      </div>

      <main
        ref={mainRef}
        className="flex-1 w-full max-w-3xl mx-auto px-4 py-6"
        style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <PageTransition />
      </main>

      <BottomNav />
      <UpdatePrompt />
    </div>
  );
}
