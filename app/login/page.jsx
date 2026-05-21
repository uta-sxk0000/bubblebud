import { AuthRoutePage } from "@/components/customer-pages";

export const metadata = {
  title: "Login",
  description: "Log in to your BubbleBud account.",
};

export default function Page() {
  return <AuthRoutePage mode="Login" />;
}
