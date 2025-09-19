export default function IconBox({ icon, colors }) {
  return (
    <div className={`w-16 h-16 bg-gradient-to-br ${colors} rounded-xl flex items-center justify-center`}>
      {icon}
    </div>
  )
}
