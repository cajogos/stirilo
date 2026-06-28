import { LoadingState } from "@/components/ui/states";

export default function DashboardLoading()
{
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <LoadingState />
    </div>
  );
}
