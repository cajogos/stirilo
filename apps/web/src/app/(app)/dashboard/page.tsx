import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

const SUMMARY_CARDS = [
  "Tracked directories",
  "Detected Git repositories",
  "Dirty Git repositories",
  "Sensitive file markers",
  "Large files found",
  "Last scan status",
];

export default function DashboardPage()
{
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your local environment. Populated once scanning lands.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUMMARY_CARDS.map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardDescription>{title}</CardDescription>
              <CardTitle className="text-2xl">&mdash;</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <EmptyState
        title="No scans yet"
        description="Add a scan target and run a scan to populate the dashboard."
      />
    </div>
  );
}
