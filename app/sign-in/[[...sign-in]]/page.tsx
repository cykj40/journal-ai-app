import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-custom-gradient">
            <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white/80 backdrop-blur-md shadow-xl",
                        formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                    },
                }}
                afterSignInUrl="/journal"
            />
        </div>
    );
}