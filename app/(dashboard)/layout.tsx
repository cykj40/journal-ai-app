import { UserButton } from "@clerk/nextjs";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Desktop sidebar — fixed left column, hidden below lg */}
      <Sidebar />

      {/* All content shifts right of the sidebar on lg+ */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        {/* Mobile-only sticky top header */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b border-sage-light/50"
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

        {/* Page content */}
        <main className="flex-1 w-full max-w-[430px] mx-auto lg:max-w-none lg:mx-0">
          {/*
            Mobile:  padded bottom for tab bar + safe area  (via CSS var)
            Desktop: no extra bottom padding needed
          */}
          <div className="h-full fab-content-pad lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar — mobile/tablet only, hidden on lg+ */}
      <BottomNav />
    </div>
  )
}

export default DashBoardLayout;
