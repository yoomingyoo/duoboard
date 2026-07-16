export function ChevronIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="chevron"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
