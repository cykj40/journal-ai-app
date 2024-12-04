import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/sign-in"
            forceRedirectUrl="/new-user"
            signInForceRedirectUrl="/new-user"
        />
    )
}
