type ArrowIconProps = {
  className?: string;
  direction?: "left" | "right";
};

const PATHS = {
  right: "M9 6l6 6-6 6",
  left: "M15 6l-6 6 6 6",
} as const;

export function ArrowIcon({
  className = "w-4 h-4",
  direction = "right",
}: ArrowIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[direction]} />
    </svg>
  );
}
