'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'

export default function AuthUserButton() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayName = session?.user.name || session?.user.email || 'Account'

  const handleSignOut = async () => {
    try {
      setIsSubmitting(true)
      await signOut()
      router.push('/sign-in')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="inline-flex min-h-[44px] items-center gap-3 rounded-full border border-sage-light/70 bg-white px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-sage-light/20 disabled:cursor-not-allowed disabled:opacity-70"
      style={{ fontFamily: 'var(--font-dm-sans)' }}
      aria-label="Sign out"
      title={displayName}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light/60 text-xs font-semibold uppercase text-sage">
        {displayName.charAt(0)}
      </span>
      <span>{isSubmitting ? 'Signing out...' : 'Sign out'}</span>
    </button>
  )
}
