type LogoProps = {
  size?: number;
};

export function Logo({ size = 40 }: LogoProps) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <circle cx="13" cy="16" fill="none" r="8.5" stroke="var(--accent)" strokeWidth="1.8" />
      <circle cx="19" cy="16" fill="none" r="8.5" stroke="var(--accent-strong)" strokeWidth="1.8" />
    </svg>
  );
}
