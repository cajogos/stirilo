import { redirect } from "next/navigation";

// The homepage has no content of its own. Authenticated users land on the
// dashboard; the middleware redirects everyone else to /login.
export default function HomePage(): never
{
  redirect("/dashboard");
}
