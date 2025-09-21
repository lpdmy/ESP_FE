export default function Feature({ icon, label, bg }) {
  return (
    <div className="text-center">
      <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
  )
}
