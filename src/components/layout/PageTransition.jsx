import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const ROUTES = ["/", "/movimientos", "/metas", "/herramientas"];

export default function PageTransition() {
  const location = useLocation();
  const currIdx = ROUTES.indexOf(location.pathname);
  const [snap, setSnap] = useState({ idx: currIdx, dir: 1 });

  if (snap.idx !== currIdx) {
    setSnap({ idx: currIdx, dir: currIdx >= snap.idx ? 1 : -1 });
  }

  return (
    <AnimatePresence mode="wait" initial={false} custom={snap.dir}>
      <motion.div
        key={location.pathname}
        custom={snap.dir}
        initial={(d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0.6 })}
        animate={{ x: 0, opacity: 1 }}
        exit={(d) => ({ x: d > 0 ? "-40%" : "40%", opacity: 0 })}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ willChange: "transform" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
