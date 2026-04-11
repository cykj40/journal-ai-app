import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
    { name: "Current Month", href: "/journal" },
    { name: "Analytics", href: "/analytics" },
    { name: "Past Entries", href: "/archive" },
    { name: "History", href: "/history" },
];

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-screen h-screen relative bg-custom-gradient dark:bg-none dark:bg-zinc-950">
            <aside className="absolute left-0 top-0 h-full w-[200px] border-r border-black/10 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/80 backdrop-blur-sm">
                <div className="px-4 my-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        Health Journal AI
                    </span>
                </div>
                <div>
                    <ul className="px-4">
                        {links.map((link) => (
                            <li key={link.name} className="text-xl my-4">
                                <Link
                                    href={link.href}
                                    className="text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <div className="ml-[200px] h-full w-[calc(100vw-200px)]">
                <header className="h-[60px] border-b border-black/10 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/80 backdrop-blur-sm">
                    <nav className="px-4 h-full">
                        <div className="flex items-center justify-end h-full gap-2">
                            <ThemeToggle />
                            <UserButton />
                        </div>
                    </nav>
                </header>
                <div className="h-[calc(100vh-60px)]">{children}</div>
            </div>
        </div>
    )
}

export default DashBoardLayout;
