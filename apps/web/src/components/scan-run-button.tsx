"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

// Submit button that reflects the form's pending state while a scan runs.
export function ScanRunButton()
{
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Scanning…" : "Run scan"}
    </Button>
  );
}
