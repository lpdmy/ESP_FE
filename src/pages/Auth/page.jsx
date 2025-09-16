import AuthForm from "@/features/auth/components/AuthForm"
import AuthLayout from "@/common/components/layout/AuthLayout"

export default function AuthPage() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  )
}