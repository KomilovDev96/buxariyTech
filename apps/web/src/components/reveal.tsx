// CSS keeps the initial server/client markup identical and respects reduced motion.
export function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="reveal-content">{children}</div>;
}
