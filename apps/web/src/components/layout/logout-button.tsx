import { LogOut } from "lucide-react";
import { logout } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton()
{
  return (
    <form action={logout}>
      <Button variant="ghost" size="icon" aria-label="Log out" type="submit">
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}
