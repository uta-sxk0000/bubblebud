import { AuthRoutePage } from "@/components/customer-pages";

export const metadata = {
  title: "Register",
  description: "Create your BubbleBud account.",
};

export default function Page() {
  return <AuthRoutePage mode="Register" />;
}
