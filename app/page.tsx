import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = auth();
  const href = userId ? "/journal" : "/new-user";

  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center text-white">
      <div className="w-full max-w-[600px] mx-auto">
        <h1 className="text-4xl font-bold mb-4">Turning reflections into revelations.</h1>
        <p className="text-2xl text-center mb-4">
          Every thought you pen down holds the power to spark new ideas and uncover hidden truths.
          Journaling isn&apos;t just about recording life; it&apos;s about transforming the way you see it.
        </p>
        <div>
          <Link href={href}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Get Started</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
