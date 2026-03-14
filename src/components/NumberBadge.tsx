interface Props {
  value: number;
  isSelected?: boolean;
  onSelect?: (value: number) => void;
}

export default function NumberBadge({ value, isSelected = false, onSelect }: Props) {
  const isInteractive = onSelect !== undefined;

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (isSelected) {
      // Keep selected styles — just reinforce them on hover
      el.style.boxShadow = "0 0 18px color-mix(in srgb, var(--accent) 50%, transparent)";
    } else {
      el.style.borderColor = "var(--border-glow)";
      el.style.color = "var(--accent)";
      el.style.boxShadow = "0 0 12px color-mix(in srgb, #9586d2 35%, transparent)";
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (isSelected) {
      el.style.boxShadow = "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)";
    } else {
      el.style.borderColor = "var(--border-default)";
      el.style.color = "var(--text-primary)";
      el.style.boxShadow = "none";
    }
  }

  function handleClick() {
    if (onSelect) onSelect(value);
  }

  const selectedStyle: React.CSSProperties = {
    background: "color-mix(in srgb, var(--accent) 20%, transparent)",
    borderColor: "var(--border-glow)",
    color: "var(--accent)",
    boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)",
  };

  const defaultStyle: React.CSSProperties = {
    background: "var(--bg-input)",
    borderColor: "var(--border-default)",
    color: "var(--text-primary)",
  };

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isSelected : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        group
        relative
        inline-flex items-center justify-center
        rounded-xl
        min-w-[64px] min-h-[64px]
        px-4 py-3
        font-mono font-bold text-2xl
        select-none
        border
        transition-all duration-300
        hover:-translate-y-1
        ${isSelected ? "glow-evalia" : ""}
        ${isInteractive ? "cursor-pointer" : "cursor-default"}
      `}
      style={isSelected ? selectedStyle : defaultStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Checkmark indicator when selected */}
      {isSelected && (
        <span
          className="absolute top-1 right-1.5 font-mono text-[10px] leading-none"
          style={{ color: "var(--accent)" }}
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      {value}
    </div>
  );
}
