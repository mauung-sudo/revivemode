// Default pixel avatar from the design (orange disc, heart head, pixel body).
// Scales from the 32px desktop version.
export default function Avatar({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full bg-[#ffae1b]"
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/ui/avatar-body.png"
        alt=""
        className="absolute object-cover object-bottom"
        style={{ left: 8 * s, top: 11.7 * s, width: 16 * s, height: 16.6 * s }}
      />
      <img
        src="/assets/ui/avatar-head.png"
        alt=""
        className="absolute object-contain"
        style={{ left: 9.14 * s, top: 4 * s, width: 13.7 * s, height: 13.7 * s }}
      />
    </span>
  )
}
