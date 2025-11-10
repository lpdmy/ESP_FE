import React, { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
} from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";

export default function CompactFilter({ selectedFilters, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckbox = (group, value) => {
    const current = new Set(selectedFilters[group]);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    onFilterChange({ ...selectedFilters, [group]: Array.from(current) });
  };

  const getActiveCount = () => {
    return (
      selectedFilters.category.length +
      selectedFilters.subType.length
    );
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto justify-between gap-2"
      >
        <Filter className="h-4 w-4" />
        <span>Bộ lọc</span>
        {getActiveCount() > 0 && (
          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
            {getActiveCount()}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 mt-2 z-20 w-80 shadow-lg">
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Loại</p>
                <div className="space-y-2">
                  {["Activity", "Event"].map((option) => (
                    <Checkbox
                      key={option}
                      id={`category-${option}`}
                      checked={selectedFilters.category.includes(option)}
                      onChange={() => handleCheckbox("category", option)}
                      label={option}
                      className="text-sm"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Trạng thái</p>
                <div className="space-y-2">
                  {["Đang đăng ký", "Sắp diễn ra", "Đã kết thúc"].map((option) => (
                    <Checkbox
                      key={option}
                      id={`status-${option}`}
                      checked={selectedFilters.subType.includes(option)}
                      onChange={() => handleCheckbox("subType", option)}
                      label={option}
                      className="text-sm"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

