import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  Download,
  Search,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { Progress } from "@/common/components/ui/progress";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { LoadingSubmissions } from "@/common/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { useEffect, useState } from "react";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useNavigate } from "react-router-dom";
import { list } from "postcss";
export default function JurySubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJuryAssign, getJuryAssignNotGrade,getJuryAssignGrade } = useJuryApi();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageNumberNotGrade, setPageNumberNotGrade] = useState(1);
  const [pageSizeNotGrade, setPageSizeNotGrade] = useState(10);
  const [pageSizeGrade, setPageSizeGrade] = useState(10);
  const [pageNumberGrade, setPageNumberGrade] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searhTermNotGrade, setSearhTermNotGrade] = useState("");
  const [searhTerm, setSearchTerm] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [submissionsNotGrade, setSubmissionsNotGrade] = useState([]);
  const [submissionsGrade, setSubmissionsGrade] = useState([]);
  const [totalCount, setTotalCount] = useState(1);
  const [totalCountNotGrade, setTotalCountNotGrade] = useState(1);
  const [totalCountGrade, setTotalCountGrade] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotGrade, setIsLoadingNotGrade] = useState(false);
  const [isLoadingGrade, setIsLoadingGrade] = useState(false);
  const hanldeLoadJurySubmission = async () => {
    setIsLoading(true);
    try {
      const response = await getJuryAssign(id, searhTerm, pageSize, pageNumber);
      setTotalCount(response.data.totalCount);
      setSubmissions(response.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  const hanldeLoadJurySubmissionNotGrade = async () => {
    setIsLoadingNotGrade(true);
    try {
      const response = await getJuryAssignNotGrade(
        id,
        searhTerm,
        pageSizeNotGrade,
        pageNumberNotGrade
      );
      setTotalCountNotGrade(response.data.totalCount);
      setSubmissionsNotGrade(response.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingNotGrade(false);
    }
  };
  const hanldeLoadJurySubmissionGrade = async () => {
    setIsLoadingGrade(true);
    try {
      const response = await  getJuryAssignGrade(
        id,
        searhTerm,
        pageSizeGrade,
        pageNumberGrade
      );
      setTotalCountGrade(response.data.totalCount);
      setSubmissionsGrade(response.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingGrade(false);
    }
  };
  const loadAllJurySubmissionsNotGrade = async () => {
    try {
      const firstResponse = await getJuryAssignNotGrade(
        id,
        searhTerm,
        pageSizeNotGrade,
        1
      );
      const total = firstResponse.data.totalCount;
      const totalPages = Math.ceil(total / pageSizeNotGrade);

      let allData = [...firstResponse.data.data];

      for (let i = 2; i <= totalPages; i++) {
        const response = await getJuryAssignNotGrade(
          id,
          searhTerm,
          pageSizeNotGrade,
          i
        );
        allData = [...allData, ...response.data.data];
      }

      return allData;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const handleNavigateGrade = async () => {
    const allSubmissions = await loadAllJurySubmissionsNotGrade();
    navigate(`/jury/grade/${id}`);
    console.log("📌 Đã bấm và load đủ:", allSubmissions.length);
  };
  function formatToVietnamTime(isoString) {
    if (!isoString) return "Không có dữ liệu";

    const date = new Date(isoString);

    return date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const gradedCount = submissions.filter((s) => s.scoreTemp !== null).length;
  const pendingCount = totalCountNotGrade;
  const progress = (gradedCount / submissions.length) * 100;
  useEffect(() => {
    const delay = setTimeout(() => {
      hanldeLoadJurySubmission();
    }, 1000);

    return () => clearTimeout(delay);
  }, [pageNumber, searhTerm]);

  useEffect(() => {
    const delay = setTimeout(() => {
      hanldeLoadJurySubmissionNotGrade();
    }, 1000);

    return () => clearTimeout(delay);
  }, [pageNumberNotGrade, searhTerm]);

  useEffect(() => {
    const delay = setTimeout(() => {
      hanldeLoadJurySubmissionGrade();
    }, 1000);
    return () => clearTimeout(delay);
  }, [pageNumberGrade ]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại hoạt động
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                Bài nộp được phân công
              </h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng bài nộp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã chấm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {gradedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chưa chấm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {pendingCount}
              </div>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tiến độ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {Math.round(progress)}%
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, lớp..."
                  className="pl-9"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Submissions List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Tất cả ({totalCount})</TabsTrigger>
            <TabsTrigger value="pending">
              Chưa chấm ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="graded">Đã chấm ({gradedCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <LoadingSubmissions isLoading={true} />
            ) : (
              submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 h-10 ">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">
                              {submission.title}
                            </h3>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 object-cover">
                                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                                  <AvatarFallback>
                                    {submission.submission.firstName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {submission.submission.userFullName}
                                </span>
                              </div>

                              <span>•</span>
                              <span>Lớp {submission.class}</span>
                              <span>•</span>
                              <span>
                                {formatToVietnamTime(
                                  submission.submission.createdAt
                                )}
                              </span>
                            </div>

                            <p className="text-muted-foreground line-clamp-2 mb-4">
                              {submission.submission.title}
                            </p>
                          </div>

                          {submission.scoreTemp !== null ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã chấm
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                              <Clock className="h-3 w-3" />
                              Chưa chấm
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{submission.title}</DialogTitle>
                                <DialogDescription>
                                  {submission.student} - Lớp {submission.class}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>

                          {submission.totalScore &&
                          submission.totalScore > 0 ? (
                            <div className="ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem điểm
                              </Button>
                            </div>
                          ) : (
                            <div className="ml-auto">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 gap-2 text-white"
                                onClick={handleNavigateGrade}
                              >
                                <Star className="h-4 w-4" />
                                Chấm điểm
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Prev button */}
              <Button
                variant="outline"
                onClick={() => {
                  setPageNumber(pageNumber - 1);
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                disabled={pageNumber === 1}
              >
                Trước
              </Button>

              {/* Page numbers */}
              {(() => {
                const total = Math.ceil(totalCount / pageSize);
                const pages = [];

                let start = Math.max(1, pageNumber - 2);
                let end = Math.min(total, start + 4);

                // Điều chỉnh nếu end bị thấp hơn số lượng cần hiển thị
                if (end - start < 4) {
                  start = Math.max(1, end - 4);
                }

                // Thêm ...
                if (start > 1) {
                  pages.push(
                    <span key="leftDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                // Render các số trang
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={pageNumber === i ? "default" : "outline"}
                      className={
                        pageNumber === i
                          ? "bg-orange-500 text-white"
                          : "bg-transparent hover:bg-orange-50"
                      }
                      onClick={() => {
                        setPageNumber(i);
                        window.scrollTo({ top: 100, behavior: "smooth" });
                      }}
                    >
                      {i}
                    </Button>
                  );
                }

                // Thêm ...
                if (end < total) {
                  pages.push(
                    <span key="rightDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                return pages;
              })()}

              {/* Next button */}
              <Button
                variant="outline"
                onClick={() => setPageNumber(pageNumber + 1)}
                disabled={pageNumber === Math.ceil(totalCount / pageSize)}
              >
                Tiếp
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {isLoadingNotGrade ? (
              <LoadingSubmissions isLoading={true} />
            ) : (
              submissionsNotGrade.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 h-10">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">
                              {submission.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 object-cover">
                                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                                  <AvatarFallback>
                                    {submission.submission.firstName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {submission.submission.userFullName}
                                </span>
                              </div>
                              <span>•</span>
                              <span>Lớp {submission.class}</span>
                              <span>•</span>
                              <span>
                                {formatToVietnamTime(
                                  submission.submission.createdAt
                                )}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-4">
                              {submission.submission.title}
                            </p>
                          </div>
                          {submission.scoreTemp !== null ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã chấm
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                              <Clock className="h-3 w-3" />
                              Chưa chấm
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{submission.title}</DialogTitle>
                                <DialogDescription>
                                  {submission.student} - Lớp {submission.class}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Mô tả</h4>
                                  <p className="text-muted-foreground">
                                    {submission.description}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Tệp đính kèm
                                  </h4>
                                  {/* Hiển thị file nếu cần */}
                                </div>
                                {submission.status === "graded" && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Điểm số
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <div className="text-3xl font-bold text-orange-600">
                                        {submission.score}
                                      </div>
                                      <div className="text-muted-foreground">
                                        /100
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {submission.totalScore &&
                          submission.totalScore > 0 ? (
                            <Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem điểm
                              </Button>
                            </Link>
                          ) : (
                            <div className="ml-auto">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 gap-2 text-white"
                                onClick={handleNavigateGrade}
                              >
                                <Star className="h-4 w-4" />
                                Chấm điểm
                              </Button>
                            </div>
                          )}

                          {submission.status === "graded" && (
                            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
                              <Star className="h-4 w-4 text-orange-600" />
                              <span className="font-bold text-orange-600">
                                {submission.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Prev button */}
              <Button
                variant="outline"
                onClick={() => {
                  setPageNumberNotGrade(pageNumberNotGrade - 1);
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                disabled={pageNumberNotGrade === 1}
              >
                Trước
              </Button>

              {/* Page numbers */}
              {(() => {
                const total = Math.ceil(totalCountNotGrade / pageSizeNotGrade);
                const pages = [];

                let start = Math.max(1, pageNumberNotGrade - 2);
                let end = Math.min(total, start + 4);

                // Điều chỉnh nếu end bị thấp hơn số lượng cần hiển thị
                if (end - start < 4) {
                  start = Math.max(1, end - 4);
                }

                // Thêm ...
                if (start > 1) {
                  pages.push(
                    <span key="leftDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                // Render các số trang
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={pageNumberNotGrade === i ? "default" : "outline"}
                      className={
                        pageNumberNotGrade === i
                          ? "bg-orange-500 text-white"
                          : "bg-transparent hover:bg-orange-50"
                      }
                      onClick={() => {
                        setPageNumberNotGrade(i);
                        window.scrollTo({ top: 100, behavior: "smooth" });
                      }}
                    >
                      {i}
                    </Button>
                  );
                }

                // Thêm ...
                if (end < total) {
                  pages.push(
                    <span key="rightDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                return pages;
              })()}

              {/* Next button */}
              <Button
                variant="outline"
                onClick={() => setPageNumber(pageNumberNotGrade + 1)}
                disabled={
                  pageNumberNotGrade ===
                  Math.ceil(totalCountNotGrade / pageSizeNotGrade)
                }
              >
                Tiếp
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {isLoadingGrade ? (
              <LoadingSubmissions isLoading={true} />
            ) : (
              submissionsGrade.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 h-10">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">
                              {submission.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 object-cover">
                                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                                  <AvatarFallback>
                                    {submission.submission.firstName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {submission.submission.userFullName}
                                </span>
                              </div>
                              <span>•</span>
                              <span>Lớp {submission.class}</span>
                              <span>•</span>
                              <span>
                                {formatToVietnamTime(
                                  submission.submission.createdAt
                                )}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-4">
                              {submission.submission.title}
                            </p>
                          </div>
                          {submission.scoreTemp !== null ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã chấm
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                              <Clock className="h-3 w-3" />
                              Chưa chấm
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{submission.title}</DialogTitle>
                                <DialogDescription>
                                  {submission.student} - Lớp {submission.class}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Mô tả</h4>
                                  <p className="text-muted-foreground">
                                    {submission.description}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Tệp đính kèm
                                  </h4>
                                  {/* Hiển thị file nếu cần */}
                                </div>
                                {submission.status === "graded" && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Điểm số
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <div className="text-3xl font-bold text-orange-600">
                                        {submission.score}
                                      </div>
                                      <div className="text-muted-foreground">
                                        /100
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {submission.totalScore &&
                          submission.totalScore > 0 ? (
                            <div className="ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                Xem điểm
                              </Button>
                            </div>
                          ) : (
                            <div className="ml-auto">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 gap-2 text-white"
                                onClick={handleNavigateGrade}
                              >
                                <Star className="h-4 w-4" />
                                Chấm điểm
                              </Button>
                            </div>
                          )}

                          {submission.status === "graded" && (
                            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
                              <Star className="h-4 w-4 text-orange-600" />
                              <span className="font-bold text-orange-600">
                                {submission.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Prev button */}
              <Button
                variant="outline"
                onClick={() => {
                  setPageNumberGrade(pageNumberGrade - 1);
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                disabled={pageNumberGrade === 1}
              >
                Trước
              </Button>

              {/* Page numbers */}
              {(() => {
                const total = Math.ceil(totalCountGrade / pageSizeGrade);
                const pages = [];

                let start = Math.max(1, pageNumberGrade - 2);
                let end = Math.min(total, start + 4);

                // Điều chỉnh nếu end bị thấp hơn số lượng cần hiển thị
                if (end - start < 4) {
                  start = Math.max(1, end - 4);
                }

                // Thêm ...
                if (start > 1) {
                  pages.push(
                    <span key="leftDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                // Render các số trang
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={pageNumberGrade === i ? "default" : "outline"}
                      className={
                        pageNumberGrade === i
                          ? "bg-orange-500 text-white"
                          : "bg-transparent hover:bg-orange-50"
                      }
                      onClick={() => {
                        setPageNumberGrade(i);
                        window.scrollTo({ top: 100, behavior: "smooth" });
                      }}
                    >
                      {i}
                    </Button>
                  );
                }

                // Thêm ...
                if (end < total) {
                  pages.push(
                    <span key="rightDots" className="text-gray-500 px-2">
                      ...
                    </span>
                  );
                }

                return pages;
              })()}

              {/* Next button */}
              <Button
                variant="outline"
                onClick={() => setPageNumberGrade(pageNumberGrade + 1)}
                disabled={
                  pageNumberGrade ===
                  Math.ceil(totalCountGrade / pageSizeGrade)
                }
              >
                Tiếp
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
