// Thin wrapper kept for AnimatePresence route slide after drag completes
import { useRef } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const ROUTES = ['/', '/movimientos', '/metas', '/herramientas']

export default function PageTransition() {
  const location = useLocation()
  const prevIdx  = useRef(ROUTES.indexOf(location.pathname))
  const currIdx  = ROUTES.indexOf(location.pathname)

  const dir = currIdx >= prevIdx.current ? 1 : -1
  prevIdx.current = currIdx

  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={location.pathname}
        custom={dir}
        initial={(d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0.6 })}
        animate={{ x: 0, opacity: 1 }}
        exit={(d)   => ({ x: d > 0 ? '-40%'  : '40%',  opacity: 0   })}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ willChange: 'transform' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
