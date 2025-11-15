import { useState, useEffect } from "react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Checkbox } from "@/common/components/ui/checkbox"
import { Badge } from "@/common/components/ui/badge"
import { Switch } from "@/common/components/ui/switch"
import { AlertCircle, Trash2, Plus, HelpCircle } from 'lucide-react'

const DEFAULT_CRITERIA = [
  { name: "Kỹ năng làm việc nhóm", isDefault: true },
  { name: "Sáng tạo và đổi mới", isDefault: true },
  { name: "Chất lượng thực hiện", isDefault: true },
]

export function GradingCriteriaSection({ enabled, onEnabledChange, onCriteriaChange, initialCriteria = [] }) {
  // Initialize criteria state from initialCriteria prop
  const initializeCriteria = () => {
    const defaultCriteriaNames = DEFAULT_CRITERIA.map(c => c.name)
    const selectedDefaults = initialCriteria.filter(c => defaultCriteriaNames.includes(c))
    const custom = initialCriteria.filter(c => !defaultCriteriaNames.includes(c))
    
    return {
      criteria: DEFAULT_CRITERIA.map((c) => ({ 
        ...c, 
        isSelected: selectedDefaults.includes(c.name) 
      })),
      customCriteria: custom
    }
  }

  const [criteria, setCriteria] = useState(() => initializeCriteria().criteria)
  const [customCriteria, setCustomCriteria] = useState(() => initializeCriteria().customCriteria)
  const [newCriterionName, setNewCriterionName] = useState("")
  const [error, setError] = useState("")

  // Sync with initialCriteria when it changes (e.g., when loading from BE)
  useEffect(() => {
    if (initialCriteria && initialCriteria.length > 0 && enabled) {
      const defaultCriteriaNames = DEFAULT_CRITERIA.map(c => c.name)
      const selectedDefaults = initialCriteria.filter(c => defaultCriteriaNames.includes(c))
      const custom = initialCriteria.filter(c => !defaultCriteriaNames.includes(c))
      
      setCriteria(DEFAULT_CRITERIA.map((c) => ({ 
        ...c, 
        isSelected: selectedDefaults.includes(c.name) 
      })))
      setCustomCriteria(custom)
    } else if (!enabled) {
      // When disabled, clear everything and notify parent
      setCriteria(DEFAULT_CRITERIA.map((c) => ({ ...c, isSelected: false })))
      setCustomCriteria([])
      setError("")
      onCriteriaChange([])
    }
  }, [enabled, initialCriteria?.length]) // Sync when enabled or initialCriteria changes

  const selectedCount = criteria.filter((c) => c.isSelected).length + customCriteria.length

  const handleToggleCriteria = (index) => {
    const updated = [...criteria]
    updated[index].isSelected = !updated[index].isSelected
    setCriteria(updated)
    
    // Notify parent with all selected criteria
    const allSelected = [
      ...updated.filter(c => c.isSelected).map(c => c.name),
      ...customCriteria
    ]
    onCriteriaChange(allSelected)
    setError("")
  }

  const handleAddCustom = () => {
    if (!newCriterionName.trim()) {
      setError("Vui lòng nhập tên tiêu chí")
      return
    }

    // Check duplicate
    const isDuplicate =
      criteria.some((c) => c.name.toLowerCase() === newCriterionName.toLowerCase()) ||
      customCriteria.some((c) => c.toLowerCase() === newCriterionName.toLowerCase())

    if (isDuplicate) {
      setError("Tiêu chí này đã tồn tại")
      return
    }

    const updated = [...customCriteria, newCriterionName]
    setCustomCriteria(updated)
    setNewCriterionName("")
    setError("")
    
    // Notify parent with all selected criteria
    const allSelected = [
      ...criteria.filter(c => c.isSelected).map(c => c.name),
      ...updated
    ]
    onCriteriaChange(allSelected)
  }

  const handleRemoveCustom = (index) => {
    const updated = customCriteria.filter((_, i) => i !== index)
    setCustomCriteria(updated)
    
    // Notify parent with all selected criteria
    const allSelected = [
      ...criteria.filter(c => c.isSelected).map(c => c.name),
      ...updated
    ]
    onCriteriaChange(allSelected)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddCustom()
    }
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span>Cài đặt chấm điểm</span>
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" title="Chọn các tiêu chí để đánh giá tác phẩm tham dự" />
            </CardTitle>
            <CardDescription>Cấu hình các tiêu chí để chấm điểm cho hoạt động này</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="grading-toggle" className="cursor-pointer text-sm font-medium">
              Bật chấm điểm
            </Label>
            <Switch 
              id="grading-toggle" 
              checked={enabled} 
              onCheckedChange={(newEnabled) => {
                onEnabledChange(newEnabled)
                // If disabling, clear criteria immediately
                if (!newEnabled) {
                  setCriteria(DEFAULT_CRITERIA.map((c) => ({ ...c, isSelected: false })))
                  setCustomCriteria([])
                  setError("")
                  onCriteriaChange([])
                }
              }}
              className={enabled ? "!bg-blue-500 focus-visible:!ring-blue-500" : "bg-gray-200"}
            />
          </div>
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-6">
          {/* Default Criteria */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Tiêu chí mặc định</Label>
              <Badge variant="secondary" className="!bg-blue-500 !text-white hover:!bg-blue-600">
                {criteria.filter((c) => c.isSelected).length} đã chọn
              </Badge>
            </div>
            <div className="space-y-2 bg-blue-50 rounded-lg p-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center space-x-3 hover:bg-white/50 p-2 rounded transition-colors">
                  <Checkbox
                    id={`default-${index}`}
                    checked={criterion.isSelected}
                    onChange={() => handleToggleCriteria(index)}
                    className="border-blue-300"
                  />
                  <Label htmlFor={`default-${index}`} className="flex-1 cursor-pointer font-medium text-gray-700">
                    {criterion.name}
                  </Label>
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 text-xs">
                    Mặc định
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Custom Criteria */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tiêu chí tùy chỉnh</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tên tiêu chí mới"
                value={newCriterionName}
                onChange={(e) => setNewCriterionName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-blue-200 focus:border-blue-400"
              />
              <Button
                type="button"
                onClick={handleAddCustom}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {customCriteria.length > 0 && (
              <div className="space-y-2 bg-blue-50 rounded-lg p-4">
                {customCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-3 hover:bg-white/50 p-2 rounded transition-colors">
                    <div className="w-5 h-5 rounded border-2 border-blue-300 bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                    <span className="flex-1 font-medium text-gray-700">{criterion}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveCustom(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {customCriteria.length === 0 && (
              <p className="text-sm text-gray-500 italic">Chưa thêm tiêu chí tùy chỉnh nào</p>
            )}
          </div>

          {/* Validation Message */}
          {enabled && selectedCount === 0 && (
            <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Vui lòng chọn hoặc thêm ít nhất 1 tiêu chí chấm điểm</span>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tổng tiêu chí:</span> {selectedCount} tiêu chí được chọn (
              {criteria.filter((c) => c.isSelected).length} mặc định, {customCriteria.length} tùy chỉnh)
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

