import type { SVGProps } from "react";

export interface SamsungS25UltraProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  src?: string;
}

/**
 * Stylised frame for a Samsung Galaxy S25 Ultra: flat titanium sides,
 * slim bezels, squarer corners than the iPhone frame, a single centred
 * punch-hole camera, and a volume rocker + power button on the right edge.
 * Mirrors the API of Iphone16Pro so both can be swapped in live-demo.tsx.
 */
export function SamsungS25Ultra({ width = 202, height = 420, src, ...props }: SamsungS25UltraProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 202 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer titanium body */}
      <rect x="1.5" y="1.5" width="199" height="417" rx="26" ry="26" fill="#3a3a3d" />
      <rect x="3.5" y="3.5" width="195" height="413" rx="24.4" ry="24.4" fill="#111113" />

      {/* Screen (currentColor placeholder, or screenshot image) */}
      <rect x="9" y="9" width="184" height="402" rx="20" ry="20" fill="currentColor" />
      {src && (
        <image
          href={src}
          x="9"
          y="9"
          width="184"
          height="402"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#samsungRoundedCorners)"
        />
      )}

      {/* Side controls */}
      <rect x="0" y="118" width="2.4" height="30" rx="1.2" fill="#232326" />
      <rect x="199.6" y="96" width="2.4" height="20" rx="1.2" fill="#232326" />
      <rect x="199.6" y="122" width="2.4" height="46" rx="1.2" fill="#232326" />

      {/* Faint edge highlight for a metallic feel */}
      <rect x="1.5" y="1.5" width="199" height="417" rx="26" ry="26" stroke="#5b5b5f" strokeWidth="0.6" opacity="0.7" />

      <defs>
        <clipPath id="samsungRoundedCorners">
          <rect x="9" y="9" width="184" height="402" rx="20" ry="20" fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
}
