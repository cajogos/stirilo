// A dependency-free inline SVG line chart. Self-contained (no external scripts
// or fonts) so it is safe under the app's strict CSP. Renders nothing useful
// for fewer than two points.
export function Sparkline({
  values,
  width = 480,
  height = 80,
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
})
{
  if (values.length < 2)
  {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough data points yet.
      </p>
    );
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) =>
    {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img"
      style={{ width: "100%", height }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
