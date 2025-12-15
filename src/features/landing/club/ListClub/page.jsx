import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Search, Users, Calendar, Plus, Filter } from "lucide-react";
import { useClubApi } from "../hooks/useClubApi";
import { useToast } from "@/common/hooks/useToast";
import { LoadingOverlay } from "@/common/components/ui/loading";
import { useSelector } from "react-redux";
import { LoadingCollection } from "@/common/components/ui/loading";
import MentorInvitationModal from "../Modal/MentorInvitationModal/page";
export default function ClubList() {
  const { getListClub, getClubCategory } = useClubApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(6);
  const [clubs, setClubs] = useState([]);
  const [clubCategory, setClubCategory] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const allCategories = [{ id: 0, name: "Tất cả" }, ...clubCategory];
  const toast = useToast();
  const user = useSelector((state) => state.user.user);
  // Chuẩn hóa role để hỗ trợ cả dạng number và string
  const roleValue = typeof user?.role === "string" ? user.role.toUpperCase() : user?.role;
  const isStudent = roleValue === 4 || roleValue === "STUDENT";
  const isTeacher = roleValue === 2 || roleValue === "TEACHER";
  const handleCategoryClick = (name) => {
    setSelectedCategory(name);
  };
  const handleGetListClub = async () => {
    try {
      setIsLoading(true);
      const response = await getListClub(pageNumber, pageSize, searchTerm);
      const data = response.data.data;
      const total = response.data.totalCount || 0;
      setClubs(data);
      setTotalCount(total);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách CLB:", error);
      toast.showError("Lỗi khi tải CLUB. Thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetClubCategory = async () => {
    try {
      const response = await getClubCategory();
      const data = response.data;
      setClubCategory(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại câu lạc bộ:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await handleGetClubCategory();
      await handleGetListClub();
    };
    fetchData();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  });
  useEffect(() => {
    handleGetListClub();
  }, [pageNumber]);
  useEffect(() => {
    let result = clubs;

    if (selectedCategory !== "Tất cả") {
      result = result.filter((club) => club.categoryName === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter(
        (club) =>
          club.name.toLowerCase().includes(keyword) ||
          club.description?.toLowerCase().includes(keyword)
      );
    }

    setFilteredClubs(result);
  }, [searchTerm, selectedCategory, clubs]);
  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <LoadingOverlay isLoading={isInitLoading} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Câu lạc bộ
              </h1>
              <p className="text-gray-600 text-lg">
                Khám phá và tham gia các câu lạc bộ phù hợp với sở thích của bạn
              </p>
            </div>
            {isStudent && (
              <a href="/club/create-club-creation">
                <Button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo CLB mới
                </Button>
              </a>
            )}
            {isTeacher && (
                <Button className="btn-primary flex items-center gap-2"
                onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Lời mời cố vấn
                </Button>
            )}
            <MentorInvitationModal 
             isOpen={isModalOpen}
             onClose={() => setIsModalOpen(false)}
             
             />
          </div>

        </div>
        {/* Search and Filter */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm CLB...."
                  className="pl-10"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {allCategories.map((clubCategory) => (
                <Badge
                  key={clubCategory.id}
                  onClick={() => handleCategoryClick(clubCategory.name)}
                  variant={
                    selectedCategory === clubCategory.name
                      ? "default"
                      : "secondary"
                  }
                  className={`cursor-pointer transition hover:bg-orange-100 hover:text-orange-800 ${
                    selectedCategory === clubCategory.name
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {clubCategory.name}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[420px]">
          {isLoading ? (
            <LoadingCollection isLoading={isLoading} />
          ) : filteredClubs.length > 0 ? (
            filteredClubs.map((item) => (
              <Card
                key={item.id}
                className="hover-lift card-shine overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={item.avatarUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="btn-primary">
                      {item.categoryName}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    {item.name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.shortDescription}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{item.members?.length || 0} thành viên</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/club/${item.id}`} className="flex-1">
                      <Button className="btn-primary !w-full" variant="outline">
                        Xem chi tiết
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Không tìm thấy CLB nào phù hợp
            </div>
          )}
        </div>
        {totalCount > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
              <Button
                key={i}
                variant={pageNumber === i + 1 ? "default" : "outline"}
                className={
                  pageNumber === i + 1
                    ? "bg-orange-500 text-white"
                    : "bg-transparent hover:bg-orange-50"
                }
                onClick={() => setPageNumber(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
