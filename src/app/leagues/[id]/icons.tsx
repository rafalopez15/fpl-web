// Stroke icons from the mockups. Decorative: the controls around them carry the labels.
type IconProps = { size?: number; className?: string };

function Icon({
  size = 20,
  className,
  strokeWidth = 2,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

export const ChevronDown = (p: IconProps) => (
  <Icon {...p} className="chevron">
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const ShareIcon = (p: IconProps) => (
  <Icon size={16} {...p}>
    <path d="M12 3v12" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Icon>
);

export const ArrowUp = (p: IconProps) => (
  <Icon size={14} strokeWidth={2.5} {...p}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </Icon>
);

export const ArrowDown = (p: IconProps) => (
  <Icon size={14} strokeWidth={2.5} {...p}>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </Icon>
);
