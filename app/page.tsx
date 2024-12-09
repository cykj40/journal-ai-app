import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const href = userId ? "/journal" : "/sign-in";

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-purple-200 via-purple-100 to-white flex justify-center items-center">
      <div className="w-full max-w-[800px] mx-auto px-4">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-indigo-900 tracking-tight leading-tight text-center">
          Turning reflections into revelations.
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-8 text-purple-800 font-light max-w-3xl mx-auto leading-relaxed font-mono">
          Every thought you pen down holds the power to spark new ideas and uncover hidden truths.
          Journaling isn&apos;t just about recording life; it&apos;s about transforming the way you see it.
        </p>
        <div className="text-center">
          <Link href={href}>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg text-xl">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
