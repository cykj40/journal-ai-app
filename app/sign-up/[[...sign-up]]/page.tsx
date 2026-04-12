import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-custom-gradient">
            <AuthForm
                mode="sign-up"
                showGoogleAuth={Boolean(
                    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
                )}
            />
        </div>
    );
}
