import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";

export default function ActivityFilters({ selectedFilters, onFilterChange }) {
  const handleCheckbox = (group, value) => {
    const current = new Set(selectedFilters[group]);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    onFilterChange({ ...selectedFilters, [group]: Array.from(current) });
  };

  const renderGroup = (title, key, options) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <Checkbox
            key={option}
            id={`${key}-${option}`}
            checked={selectedFilters[key].includes(option)}
            onChange={() => handleCheckbox(key, option)}
            label={option}
            className="text-sm"
          />
        ))}
      </div>
    </div>
  );

  return (
    <Card className="sticky top-4 p-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderGroup("Loại", "category", ["Activity", "Event"])}
        {renderGroup("Trạng thái", "subType", ["Đang đăng ký", "Sắp diễn ra", "Đã kết thúc"])}
      </CardContent>
    </Card>
  );
}


