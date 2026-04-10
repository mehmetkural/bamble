import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-full bg-[#f7f9fb] text-[#2c3437]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-headline text-xl font-bold tracking-tight">bamble</span>
        <Link
          href="/map"
          className="text-sm font-medium bg-[#2c3437] text-white px-4 py-2 rounded-full hover:bg-[#3d4a4e] transition-colors"
        >
          Open Map
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#e8edf0] text-[#5a7a85] text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          People nearby are online now
        </div>

        <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
          Find your people,
          <br />
          <span className="text-[#7ab8c8]">anonymously.</span>
        </h1>

        <p className="text-lg text-[#5a7a85] max-w-xl mx-auto mb-10 leading-relaxed">
          Drop a pin on the map, share what you're working on, and connect with
          people nearby who get it — without giving up who you are.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/map"
            className="bg-[#2c3437] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#3d4a4e] transition-colors text-sm"
          >
            Drop your first pin
          </Link>
          <a
            href="#how"
            className="bg-white border border-[#e8edf0] text-[#2c3437] px-8 py-3.5 rounded-full font-medium hover:bg-[#f0f4f6] transition-colors text-sm"
          >
            See how it works
          </a>
        </div>

        {/* Map preview mockup */}
        <div className="mt-16 relative mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e8edf0] overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            {/* Fake map bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f8] via-[#d4ecf4] to-[#c8e6f0] opacity-60" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(122,184,200,0.15) 0%, transparent 50%),
                                radial-gradient(circle at 70% 60%, rgba(122,184,200,0.12) 0%, transparent 45%)`,
            }} />

            {/* Grid lines to simulate map */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5a7a85" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Fake pins */}
            <Pin x="30%" y="35%" label="Building a startup" color="#7ab8c8" />
            <Pin x="55%" y="50%" label="Looking for a cofounder" color="#f4a261" />
            <Pin x="72%" y="30%" label="Learning Rust" color="#95c77d" />
            <Pin x="20%" y="62%" label="Remote work tips?" color="#c084fc" />
            <Pin x="65%" y="68%" label="Coffee & code ☕" color="#fb923c" active />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#7ab8c8] text-center mb-4">
          How it works
        </p>
        <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center mb-16 tracking-tight">
          Three steps to a real connection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step
            number="01"
            title="Drop a pin"
            description="Double-click anywhere on the map to place a pin. Share what you're working on, looking for, or thinking about."
          />
          <Step
            number="02"
            title="Chat anonymously"
            description="Tap any pin to start a conversation — no names, no profiles. Just ideas and people who care about the same things."
          />
          <Step
            number="03"
            title="Reveal when ready"
            description="When both of you feel it, mutually reveal your identities. Join or create a group and keep building together."
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#2c3437] text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7ab8c8] text-center mb-4">
            Why Bamble
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center mb-16 tracking-tight">
            Built around privacy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature
              icon="📍"
              title="Location-first"
              description="Discover people within your neighbourhood, city, or campus — not the whole internet."
            />
            <Feature
              icon="🎭"
              title="Anonymous by default"
              description="No username, no photo required. Your idea speaks before your identity does."
            />
            <Feature
              icon="🤝"
              title="Mutual reveal"
              description="Identity is only shared when both parties agree. You're always in control."
            />
            <Feature
              icon="👥"
              title="Groups"
              description="Turn great conversations into a group. Shared interest, shared space, shared momentum."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-headline text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
          Someone nearby is waiting.
        </h2>
        <p className="text-[#5a7a85] text-lg mb-10 max-w-md mx-auto">
          They just dropped a pin. Open the map and say hello — anonymously.
        </p>
        <Link
          href="/map"
          className="inline-block bg-[#2c3437] text-white px-10 py-4 rounded-full font-medium hover:bg-[#3d4a4e] transition-colors text-sm"
        >
          Open Bamble Map
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8edf0] px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5a7a85]">
        <span className="font-headline font-bold text-base text-[#2c3437]">bamble</span>
        <span>© {new Date().getFullYear()} Bamble. Find your people.</span>
      </footer>
    </div>
  );
}

function Pin({
  x,
  y,
  label,
  color,
  active,
}: {
  x: string;
  y: string;
  label: string;
  color: string;
  active?: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
    >
      {active && (
        <div
          className="text-[10px] font-medium bg-white shadow-md px-2 py-1 rounded-full border whitespace-nowrap mb-1"
          style={{ borderColor: color, color }}
        >
          {label}
        </div>
      )}
      <div
        className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-[#e8edf0] rounded-2xl p-8">
      <div className="font-headline text-4xl font-bold text-[#e8edf0] mb-4">
        {number}
      </div>
      <h3 className="font-headline text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-[#5a7a85] leading-relaxed">{description}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="text-2xl mb-4">{icon}</div>
      <h3 className="font-headline font-bold mb-2 text-sm">{title}</h3>
      <p className="text-xs text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}
