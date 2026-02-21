export function Header() {
  return (
    <header className="w-full px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2 font-mono text-xs tracking-wider">
        <span className="text-accent font-medium">ascii</span>
        <span className="text-muted/30">.</span>
        <span className="text-muted/60">render</span>
      </div>
      <div className="font-mono text-[10px] text-muted/40 tracking-[0.3em] uppercase">
        v1.0
      </div>
    </header>
  );
}
