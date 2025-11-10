import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";

export default function ActivityCard({ activity }) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-40 bg-gray-100">
        <img
          src={activity.thumbnail || "/placeholder.svg"}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="gap-2 pt-4 pb-0">
        <Badge variant="secondary" className="w-fit">
          {activity.category}
        </Badge>
        <CardTitle className="text-lg">{activity.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {activity.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-500 flex items-center justify-between">
        <span>{activity.location}</span>
        <span>
          {activity.startDate} - {activity.endDate}
        </span>
      </CardContent>
      <CardFooter className="gap-2 pb-4">
        <Button variant="orange" asChild>
          <Link to={`/activities/${activity.id}`}>Xem chi tiết</Link>
        </Button>
        <Button variant="outline">Đăng ký</Button>
      </CardFooter>
    </Card>
  );
}


