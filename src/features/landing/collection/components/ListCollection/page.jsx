import { useState, useEffect } from "react";
import {
  Search,
  Grid3X3,
  List,
  Plus,
  MoreHorizontal,
  Calendar,
  Folder,
  Edit,
  Trash2,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
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
  DialogFooter,
  useDialog,
} from "@/common/components/ui/dialog"; // chính là dialog custom bạn gửi
import { Label } from "@/common/components/ui/label";
import { useCollectionApi } from "../../hooks/useCollectionApi";
import {
  LoadingOverlay,
  LoadingCollection,
} from "@/common/components/ui/loading";

export default function CollectionsList() {
  const { getCollectionsByUser, createCollection, collectionLoading } =
    useCollectionApi();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [newName, setNewName] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // hook quản lý modal
  const { isOpen, openDialog, closeDialog } = useDialog();

  const filteredCollections = Array.isArray(collections)
    ? collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await getCollectionsByUser(pageNumber, pageSize);
        setCollections(response.data.data || []);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Lỗi khi lấy bộ sưu tập:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetch();
  }, [pageNumber, pageSize]);

  const create = async () => {
  try {
    if (!newName.trim()) return;
    const payload = { name: newName };
    const response = await createCollection(payload);
    console.log("✅ Tạo thành công:", response);
    
    setNewName("");
    closeDialog();
    const updated = await getCollectionsByUser(pageNumber, pageSize);
    setCollections(updated.data.data || []);
    setTotalPages(updated.data.totalPages);
  } catch (err) {
    console.error("❌ Lỗi khi tạo bộ sưu tập:", err);
  }
};

  if (initialLoading) {
    return <LoadingOverlay isLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Bộ sưu tập của tôi
              </h1>
              <p className="text-muted-foreground">
                Quản lý và tổ chức các bộ sưu tập nội dung cá nhân
              </p>
            </div>
            {/* nút mở modal */}
            <Button
              onClick={openDialog}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo bộ sưu tập mới
            </Button>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm bộ sưu tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredCollections.length} trong tổng số{" "}
            {collections.length} bộ sưu tập
          </p>
        </div>

        {collectionLoading ? (
          <div className="relative min-h-[200px] flex items-center justify-center">
            <LoadingCollection isLoading />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                className="hover-lift card-shine group overflow-hidden"
              >
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={collection.coverImage || "/placeholder.svg"}
                      alt={collection.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-white/90 hover:bg-white"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Chia sẻ
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Link to={`/collection/${collection.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-orange-600 transition-colors">
                      {collection.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(collection.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                    <span className="flex items-center">
                      <Folder className="w-3 h-3 mr-1" />
                      {collection.collectionItems?.length || 0} bài đăng
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={collection.coverImage || "/placeholder.svg"}
                      alt={collection.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link to={`/collection/${collection.id}`}>
                          <h3 className="font-semibold text-lg line-clamp-1 hover:text-orange-600 transition-colors">
                            {collection.name}
                          </h3>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Chia sẻ
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Cập nhật:{" "}
                          {new Date(collection.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span className="flex items-center">
                          <Folder className="w-3 h-3 mr-1" />
                          {collection.collectionItems?.length || 0} bài đăng
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!collectionLoading && filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Folder className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy bộ sưu tập
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc tạo bộ sưu tập mới
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Xóa tìm kiếm
            </Button>
          </div>
        )}

        <div className="flex justify-center mt-6 gap-2">
          <Button
            className="text-orange-500 hover:text-orange-600"
            variant="outline"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          >
            Trang trước
          </Button>
          <span className="text-orange-500 text-sm text-muted-foreground px-2 py-2">
            Trang {pageNumber} / {totalPages}
          </span>
          <Button
            className="text-orange-500 hover:text-orange-600"
            variant="outline"
            disabled={pageNumber === totalPages}
            onClick={() =>
              setPageNumber((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Trang sau
          </Button>
        </div>
      </div>

      {/* modal tạo collection */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent onClose={closeDialog} className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo bộ sưu tập mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Tên bộ sưu tập</Label>
              <Input
                id="collection-name"
                placeholder="Nhập tên bộ sưu tập..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={create}
            >
              Tạo bộ sưu tập
            </Button>
            <Button variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
