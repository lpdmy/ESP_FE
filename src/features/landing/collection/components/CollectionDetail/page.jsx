import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Heart,
  Share2,
  Trash2,
  Calendar,
  Tag,
  ImageIcon,
  Video,
  FileText,
  MoreHorizontal,
  ArrowLeft,
  Edit,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

const mockCollections = {
  "1": {
    id: "1",
    name: "Lập trình Frontend",
    description:
      "Tổng hợp tài liệu và bài viết về React, Vue, Angular và các công nghệ frontend hiện đại",
    isPublic: true,
    tags: ["React", "JavaScript", "CSS", "Frontend"],
    dateCreated: "2024-01-01",
    dateUpdated: "2024-01-15",
  },
};

const mockCollectionItems = [
  {
    id: "1",
    title: "Hướng dẫn học React từ cơ bản đến nâng cao",
    description: "Bài viết chi tiết về cách học React hiệu quả cho người mới bắt đầu",
    type: "article",
    thumbnail: "/react-tutorial.jpg",
    tags: ["React", "JavaScript", "Frontend"],
    dateSaved: "2024-01-15",
    author: "Nguyễn Văn A",
  },
  {
    id: "2",
    title: "Video: Cách tối ưu hóa performance React",
    description: "Video hướng dẫn các kỹ thuật tối ưu hóa hiệu suất ứng dụng React",
    type: "video",
    thumbnail: "/react-performance.jpg",
    tags: ["React", "Performance", "Optimization"],
    dateSaved: "2024-01-14",
    author: "Trần Thị B",
  },
];

export default function CollectionDetail() {
  const params = useParams();
  const collectionId = params.id;
  const collection = mockCollections[collectionId];

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bộ sưu tập</h1>
          <Link to="/collections">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "article": return <FileText className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "tag": return <Tag className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "article": return "bg-blue-100 text-blue-800";
      case "video": return "bg-red-100 text-red-800";
      case "image": return "bg-green-100 text-green-800";
      case "tag": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredItems = mockCollectionItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <Link to="/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm nội dung mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Tiêu đề</Label>
                  <Input placeholder="Nhập tiêu đề..." />
                  <Label>URL</Label>
                  <Input placeholder="https://..." />
                  <Label>Mô tả</Label>
                  <Textarea placeholder="Mô tả ngắn..." />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có nội dung phù hợp.</p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="p-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-48 object-cover rounded-t-md" />
                <Badge className={`absolute top-2 left-2 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                  <span className="ml-1">{item.type}</span>
                </Badge>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                <img src={item.thumbnail} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-4">
                    <span><Calendar className="w-3 h-3 inline-block mr-1" /> {new Date(item.dateSaved).toLocaleDateString("vi-VN")}</span>
                    <span>{item.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
