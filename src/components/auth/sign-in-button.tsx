import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
        Login
      </Button>
    </Link>
  );
}
