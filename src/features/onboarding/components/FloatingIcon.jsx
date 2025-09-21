export default function FloatingIcon({ emoji, position, colors, delay = "" }) {
  return (
    <div
      className={`absolute ${position} w-8 h-8 bg-gradient-to-r ${colors} rounded-lg flex items-center justify-center animate-pulse ${delay}`}
    >
      <span className="text-white text-xs font-bold">{emoji}</span>
    </div>
  )
}
