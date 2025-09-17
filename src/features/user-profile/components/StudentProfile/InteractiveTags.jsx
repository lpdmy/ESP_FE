import { useState } from "react"
import { Input } from "@/common/components/ui/input"
import { Button } from "@/common/components/ui/button"
import { Plus } from "lucide-react"
import { Label } from "@/common/components/ui/label"

export default function InteractiveTags({ label, initialTags = [], popularTags = [], onChange, iconMap = {} }) {
    const [selectedTags, setSelectedTags] = useState(initialTags)
    const [newTag, setNewTag] = useState("")

    const tagColorsArray = [
        "from-orange-400 to-yellow-400",
        "from-pink-400 to-purple-500",
        "from-green-400 to-teal-400",
        "from-blue-400 to-indigo-500",
        "from-red-400 to-pink-400",
        "from-purple-400 to-pink-500",
        "from-yellow-400 to-red-400",
    ]

    const tagColorMap = {}
    popularTags.forEach((tag, index) => {
        tagColorMap[tag] = tagColorsArray[index % tagColorsArray.length]
    })
    selectedTags.forEach((tag, index) => {
        if (!tagColorMap[tag]) {
            tagColorMap[tag] = tagColorsArray[index % tagColorsArray.length]
        }
    })

    const toggleTag = (tag) => {
        const updated = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag]
        setSelectedTags(updated)
        onChange?.(updated)
    }

    const addCustomTag = () => {
        const tag = newTag.trim()
        if (tag && !selectedTags.includes(tag)) {
            const updated = [...selectedTags, tag]
            setSelectedTags(updated)
            setNewTag("")
            onChange?.(updated)
        }
    }

    return (
        <div className="space-y-2">
            <Label className="font-medium">{label}</Label>

            <div className="flex items-center gap-2 mt-2">
                {/* Popular tags bên trái - chiếm 2/3 */}
                <div className="flex flex-wrap gap-2 basis-2/3">
                    {popularTags.map((tag, index) => {
                        const color = tagColorsArray[index % tagColorsArray.length]
                        const IconComponent = iconMap[tag] || null
                        return (
                            <span
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-md transition-all duration-200
            ${selectedTags.includes(tag)
                                        ? `bg-gradient-to-r ${color} text-white`
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    } flex items-center gap-1`}
                            >
                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                {tag}
                            </span>
                        )
                    })}
                </div>

                {/* Input + Add button bên phải - chiếm 1/3 */}
                <div className="flex items-center gap-1 basis-1/3 justify-end">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Thêm..."
                        className="h-7 w-24 text-xs px-2 py-1 rounded-full shadow-sm focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                    <Button
                        onClick={addCustomTag}
                        size="xl"
                        className="h-7 w-7 p-1 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white flex items-center justify-center"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Selected tags */}
            <div className="mt-5">
                <Label className="font-medium mb-5">Đã chọn:</Label>
                <div className="border border-gray-300 rounded-lg p-2 flex flex-wrap gap-2 bg-gray-50 min-h-[40px]">
                    {selectedTags.length === 0 ? (
                        <span className="text-gray-400 text-sm">Chưa có sở thích nào được chọn</span>
                    ) : (
                        selectedTags.map((tag, index) => {
                            const color = tagColorMap[tag]
                            const IconComponent = iconMap[tag] || null
                            return (
                                <span
                                    key={tag}
                                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-md bg-gradient-to-r ${color}`}
                                >
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    {tag}
                                    <button
                                        onClick={() => toggleTag(tag)}
                                        className="text-white hover:text-gray-200 font-bold transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}