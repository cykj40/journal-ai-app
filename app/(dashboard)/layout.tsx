import { UserButton } from "@clerk/nextjs";
import BottomNav from "@/components/BottomNav";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Centered mobile container */}
      <div
        className="relative mx-auto min-h-screen flex flex-col"
        style={{ maxWidth: '430px' }}
      >
        {/* Sticky top header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b border-sage-light/50"
          style={{ backgroundColor: 'rgba(245,242,236,0.92)', backdropFilter: 'blur(8px)' }}
        >
          <span
            className="text-forest text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Health Journal AI
          </span>
          <UserButton />
        </header>

        {/* Page content — padded above tab bar + safe area */}
        <div
          className="flex-1"
          style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default DashBoardLayout;
