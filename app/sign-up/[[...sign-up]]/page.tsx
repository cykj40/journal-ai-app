import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-custom-gradient">
            <SignUp
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white/80 backdrop-blur-md shadow-xl",
                        formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                    },
                }}
                afterSignUpUrl="/new-user"
            />
        </div>
    );
}
