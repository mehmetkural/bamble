import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-full bg-[#f8fafb] text-[#191c1d]">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00464d] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          </div>
          <span className="font-headline text-xl font-black text-cyan-900 tracking-tight">Bamble</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/radio" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#3f4949] px-4 py-2 rounded-full hover:bg-[#eceeef] transition-colors">
            <span className="material-symbols-outlined text-base">radio</span>
            Radio
          </Link>
          <Link href="/groups" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#3f4949] px-4 py-2 rounded-full hover:bg-[#eceeef] transition-colors">
            <span className="material-symbols-outlined text-base">group</span>
            Communities
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 text-sm font-semibold bg-[#00464d] text-white px-5 py-2.5 rounded-full hover:bg-[#006069] transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-base">map</span>
            Open Map
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#bec8c9]/40 text-[#3f4949] text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          People nearby are active right now
        </div>

        <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-6 text-[#191c1d]">
          Find your people,
          <br />
          <span className="text-[#00464d]">anonymously.</span>
        </h1>

        <p className="text-lg text-[#3f4949] max-w-xl mx-auto mb-10 leading-relaxed">
          Drop a pin on the map, share what you're working on, and connect with
          people nearby who get it — without giving up who you are.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/map"
            className="flex items-center gap-2 bg-[#00464d] text-white px-7 py-3.5 rounded-full font-semibold hover:bg-[#006069] transition-colors text-sm shadow-lg shadow-[#00464d]/20"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            Drop your first pin
          </Link>
          <Link
            href="/groups"
            className="flex items-center gap-2 bg-white border border-[#bec8c9]/50 text-[#191c1d] px-7 py-3.5 rounded-full font-semibold hover:bg-[#eceeef] transition-colors text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-base">diversity_3</span>
            Browse Communities
          </Link>
          <Link
            href="/radio"
            className="flex items-center gap-2 bg-white border border-[#bec8c9]/50 text-[#191c1d] px-7 py-3.5 rounded-full font-semibold hover:bg-[#eceeef] transition-colors text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-base">radio</span>
            Explore Radio
          </Link>
        </div>

        {/* Map mockup */}
        <div className="mt-14 relative mx-auto max-w-4xl">
          <div className="bg-white rounded-3xl shadow-2xl shadow-[#191c1d]/8 border border-[#e1e3e4] overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            {/* Map bg gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4ecf4] via-[#e8f4f8] to-[#f0f8fb]" />
            {/* Subtle grid */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3f4949" strokeWidth="0.6"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Pins */}
            <Pin x="28%" y="38%" label="Building a startup 🚀" color="#00464d" />
            <Pin x="54%" y="52%" label="Looking for a cofounder" color="#4c56af" />
            <Pin x="70%" y="28%" label="Learning Rust 🦀" color="#006069" />
            <Pin x="18%" y="65%" label="Remote work tips?" color="#810037" />
            <Pin x="63%" y="70%" label="Coffee & code ☕" color="#00464d" active />

            {/* Floating category pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
              {["All Activity", "Project", "Coffee", "Study"].map((c, i) => (
                <span key={c} className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm ${i === 0 ? "bg-[#00464d] text-white" : "bg-white/85 backdrop-blur text-[#3f4949]"}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards (Map / Radio / Communities) ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            href="/map"
            icon="map"
            label="Map"
            title="Drop a pin anywhere"
            description="Double-click the map, share what you're up to, and let nearby people find you anonymously."
            accent="#00464d"
          />
          <FeatureCard
            href="/groups"
            icon="diversity_3"
            label="Communities"
            title="Find your tribe"
            description="Join or create groups around shared interests. From startup founders to late-night coders."
            accent="#4c56af"
          />
          <FeatureCard
            href="/radio"
            icon="radio"
            label="Radio"
            title="Tune into the city"
            description="Browse a live feed of pins near you. See what's happening without being on the map."
            accent="#810037"
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-[#4c56af] text-center mb-3">
          How it works
        </p>
        <h2 className="font-headline text-3xl sm:text-4xl font-black text-center mb-14 tracking-tight">
          Three steps to a real connection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step number="01" icon="add_location_alt" title="Drop a pin" description="Double-click anywhere on the map. Share what you're working on, looking for, or thinking about." />
          <Step number="02" icon="chat_bubble" title="Chat anonymously" description="Tap any pin to start a conversation — no names, no profiles. Just ideas and curiosity." />
          <Step number="03" icon="handshake" title="Reveal when ready" description="Mutually reveal your identities when you're both comfortable. Join or create a group and keep building." />
        </div>
      </section>

      {/* ── Why Bamble ── */}
      <section className="bg-[#191c1d] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7adae7] text-center mb-3">
            Why Bamble
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl font-black text-center mb-14 tracking-tight">
            Built around privacy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <WhyCard icon="location_on" title="Location-first" description="Discover people within your neighbourhood, city, or campus — not the whole internet." />
            <WhyCard icon="mask" title="Anonymous by default" description="No username or photo required. Your idea speaks before your identity does." />
            <WhyCard icon="handshake" title="Mutual reveal" description="Identity is only shared when both parties agree. You're always in control." />
            <WhyCard icon="diversity_3" title="Communities" description="Turn great conversations into a group. Shared interest, shared space, shared momentum." />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-headline text-4xl sm:text-5xl font-black mb-5 tracking-tight">
          Someone nearby is waiting.
        </h2>
        <p className="text-[#3f4949] text-lg mb-10 max-w-md mx-auto leading-relaxed">
          They just dropped a pin. Open the map and say hello — anonymously.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/map" className="flex items-center gap-2 bg-[#00464d] text-white px-9 py-4 rounded-full font-bold text-sm hover:bg-[#006069] transition-colors shadow-xl shadow-[#00464d]/20">
            <span className="material-symbols-outlined text-base">map</span>
            Open Bamble Map
          </Link>
          <Link href="/radio" className="flex items-center gap-2 bg-white border border-[#bec8c9]/50 text-[#191c1d] px-9 py-4 rounded-full font-bold text-sm hover:bg-[#eceeef] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-base">radio</span>
            Try Radio
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e1e3e4] px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6f7979]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00464d] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
            </div>
            <span className="font-headline font-black text-base text-[#191c1d]">Bamble</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/map" className="hover:text-[#191c1d] transition-colors">Map</Link>
            <Link href="/groups" className="hover:text-[#191c1d] transition-colors">Communities</Link>
            <Link href="/radio" className="hover:text-[#191c1d] transition-colors">Radio</Link>
          </div>
          <span>© {new Date().getFullYear()} Bamble. Find your people.</span>
        </div>
      </footer>
    </div>
  );
}

function Pin({ x, y, label, color, active }: { x: string; y: string; label: string; color: string; active?: boolean }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}>
      {active && (
        <div className="text-[10px] font-semibold bg-white shadow-lg px-3 py-1.5 rounded-full border whitespace-nowrap mb-1.5" style={{ borderColor: color + "40", color }}>
          {label}
        </div>
      )}
      <div className="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{ backgroundColor: color }}>
        {active && <span className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}

function FeatureCard({ href, icon, label, title, description, accent }: { href: string; icon: string; label: string; title: string; description: string; accent: string }) {
  return (
    <Link href={href} className="group bg-white border border-[#e1e3e4] rounded-2xl p-7 hover:shadow-lg hover:border-transparent transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
          <span className="material-symbols-outlined" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: accent + "12", color: accent }}>{label}</span>
      </div>
      <div>
        <h3 className="font-headline font-bold text-lg text-[#191c1d] mb-1.5">{title}</h3>
        <p className="text-sm text-[#3f4949] leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: accent }}>
        Explore
        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </Link>
  );
}

function Step({ number, icon, title, description }: { number: string; icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-[#e1e3e4] rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="font-headline text-5xl font-black text-[#e1e3e4]">{number}</span>
        <div className="w-10 h-10 rounded-full bg-[#eceeef] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#3f4949]">{icon}</span>
        </div>
      </div>
      <h3 className="font-headline text-lg font-bold mb-2 text-[#191c1d]">{title}</h3>
      <p className="text-sm text-[#3f4949] leading-relaxed">{description}</p>
    </div>
  );
}

function WhyCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#7adae7]">{icon}</span>
      </div>
      <h3 className="font-headline font-bold mb-2 text-sm text-white">{title}</h3>
      <p className="text-xs text-white/55 leading-relaxed">{description}</p>
    </div>
  );
}
