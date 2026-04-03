import { redirect } from "next/navigation"

export default function RootPage() {
  // Default redirect to host dashboard
  // When auth is implemented, this will redirect based on user role
  redirect("/dashboard")
}
