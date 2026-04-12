import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const href = session ? "/journal" : "/sign-in";

  return (
    <div className="min-h-screen bg-parchment overflow-x-hidden scroll-smooth">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 max-w-[1200px] mx-auto">
        <span
          className="text-forest text-sm font-semibold tracking-widest uppercase"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Health Journal AI
        </span>
        <div className="flex items-center gap-6 md:gap-8">
          {["Features", "About"].map((item) => (
            <span
              key={item}
              className="text-forest-muted text-xs tracking-widest uppercase cursor-pointer hover:text-forest transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {item}
            </span>
          ))}
          <Link href={href}>
            <span
              className="text-forest-muted text-xs tracking-widest uppercase cursor-pointer hover:text-forest transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {session ? "Open journal" : "Sign in"}
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row min-h-[calc(100vh-80px)] max-w-[1200px] mx-auto">
        {/* Text side */}
        <div className="flex flex-col justify-center px-6 md:px-10 py-12 sm:py-0 sm:w-[55%] order-2 sm:order-1">
          <div className="max-w-[480px]">
            <h1
              className="text-[36px] sm:text-[48px] md:text-[56px] leading-tight font-semibold text-forest mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Health Journal AI
            </h1>
            <p
              className="text-forest-muted text-base md:text-lg leading-relaxed mb-10 font-light"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Your health journal for an active life. Track wellness, understand
              patterns, and stay in tune with your body through every adventure.
            </p>
            <Link href={href}>
              <button
                className="bg-sage hover:bg-opacity-90 text-white text-sm font-medium px-8 py-4 rounded-full transition-all duration-200 min-h-[44px]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Start tracking
              </button>
            </Link>
          </div>
        </div>

        {/* Image side — bleeds to right edge */}
        <div className="relative sm:w-[45%] h-64 sm:h-auto order-1 sm:order-2 overflow-hidden sm:overflow-visible">
          <Image
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80"
            alt="Hiker on mountain trail"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 640px) 100vw, 45vw"
          />
        </div>
      </div>
    </div>
  );
}
