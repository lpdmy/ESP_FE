import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  BookOpen,
  Trophy,
  Music,
  Palette,
  Upload,
  FileText,
  Eye,
  Edit2,
  X,
  ArrowLeft,
} from "lucide-react";

import { activityService } from "@/features/activities/services/activity.service";
import { submissionService } from "@/features/activities/services/submission.service";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { LoadingCard } from "@/common/components/ui/loading";
import { uploadMultipleFiles } from "@/common/utils/upload";
import { Button } from "@/common/components/ui/button";
import { ROUTES } from "@/common/constants/routes";
import { useToast } from "@/common/hooks/useToast";

const categoryIcons = {
  workshop: BookOpen,
  competition: Trophy,
  entertainment: Music,
  art: Palette,
  SeminarWorkshop: BookOpen,
  SportsFestival: Trophy,
  CreativeContest: Palette,
  Competition: Trophy,
};

const categoryColors = {
  workshop: "bg-blue-100 text-blue-700 border-blue-200",
  competition: "bg-yellow-100 text-yellow-700 border-yellow-200",
  entertainment: "bg-purple-100 text-purple-700 border-purple-200",
  art: "bg-pink-100 text-pink-700 border-pink-200",
  SeminarWorkshop: "bg-blue-100 text-blue-700 border-blue-200",
  SportsFestival: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CreativeContest: "bg-pink-100 text-pink-700 border-pink-200",
  Competition: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const statusColors = {
  ongoing: "bg-green-100 text-green-700 border-green-200",
  finished: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels = {
  ongoing: "Đang diễn ra",
  finished: "Đã kết thúc",
};


const mapActivityToEvent = (activity) => {
  const startDate = activity.startDate ? new Date(activity.startDate) : null;
  const endDate = activity.endDate ? new Date(activity.endDate) : null;

  const now = new Date();
  let status = "finished";
  if (endDate && now <= endDate) status = "ongoing";

  const category = activity.subType || "workshop";

  return {
    id: activity.id,
    title: activity.title || "",
    description: activity.description || "",
    date: startDate ? startDate.toISOString().split("T")[0] : "",
    time: startDate
      ? `${startDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${
          endDate
            ? endDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""
        }`
      : "",
    location: activity.location || "",
    organizer: activity.organizer || "",
    participants: activity.numberOfParticipants || 0,
    maxParticipants: activity.maxParticipants || 0,
    category,
    status,
    image: activity.thumbnailUrl || "",
    tags: activity.rules?.slice(0, 3) || [],
    startDate,
    endDate,
    registeredDate: activity.registeredAt || null,
    yourPoints: activity.starPoints || 0,
    submissionDeadline:
      activity.submissionDeadline || activity.SubmissionDeadline || null,
    problemText: activity.problemText || activity.ProblemText || "",
    problemFileUrl: activity.problemFileUrl || activity.ProblemFileUrl || "",
  };
};

export default function MyEventsPage() {

  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ongoing");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [finishedActivities, setFinishedActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageNumber] = useState(1);
  const [pageSize] = useState(50);

  // Submission states
  const [submission, setSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionId, setSubmissionId] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem hoạt động của bạn");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [ongoRes, finRes] = await Promise.all([
          executeApiCall(
            activityService.getMyActivities.bind(activityService),
            [pageNumber, pageSize, null, "ongoing", token],
            {}
          ),
          executeApiCall(
            activityService.getMyActivities.bind(activityService),
            [pageNumber, pageSize, null, "finished", token],
            {}
          ),
        ]);

        setOngoingActivities(
          Array.isArray(ongoRes?.data?.data)
            ? ongoingRes.data.data.map(mapActivityToEvent)
            : []
        );
        setFinishedActivities(
          Array.isArray(finRes?.data?.data)
            ? finRes.data.data.map(mapActivityToEvent)
            : []
        );

      } catch (err) {
        setError("Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);
  const fetchSubmission = async (activityId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSubmissionLoading(true);

      const response = await executeApiCall(
        submissionService.getMySubmissionByActivityId.bind(submissionService),
        [activityId, token],
        {}
      );

      if (response?.data) {
        setSubmission(response.data);
        setSubmissionId(response.data.id);
        setSubmissionTitle(response.data.title);
        setExistingAttachments(response.data.attachments || []);
      }
    } catch {
      setSubmission(null);
      setSubmissionId(0);
      setExistingAttachments([]);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);

    setSubmission(null);
    setShowSubmissionForm(false);
    setSelectedFiles([]);
    setSubmissionTitle("");

    if (event.category === "CreativeContest") {
      await fetchSubmission(event.id);
    }
  };
  const handleSubmitSubmission = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.showError("Bạn chưa đăng nhập");

    if (!submissionTitle.trim())
      return toast.showError("Vui lòng nhập tiêu đề bài nộp");

    setSubmitting(true);

    let attachments = [...existingAttachments];

    if (selectedFiles.length > 0) {
      const uploaded = await uploadMultipleFiles(selectedFiles);
      attachments.push(...uploaded);
    }

    const formData = {
      title: submissionTitle,
      attachments: attachments,
    };

    try {
      if (submission) {
        const res = await executeApiCall(
          submissionService.updateSubmission.bind(submissionService),
          [submissionId, formData, token],
          {}
        );
        setSubmission(res.data);
      } else {
        const res = await executeApiCall(
          submissionService.createSubmission.bind(submissionService),
          [
            {
              activityId: selectedEvent.id,
              ...formData,
            },
            token,
          ],
          {}
        );
        setSubmission(res.data);
        setSubmissionId(res.data.id);
      }

      toast.showSuccess("Nộp bài thành công!");
      setShowSubmissionForm(false);

    } catch {
      toast.showError("Không thể nộp bài");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <LoadingCard />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to={ROUTES.ACTIVITY.LIST}>
          <Button
            variant="outline"
            className="mb-4 flex items-center gap-2 border-orange-200 text-orange-600"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
        </Link>

        <h1 className="text-3xl font-bold gradient-text mb-2">
          Sự kiện của tôi
        </h1>
        <p className="text-gray-600 mb-6">
          Theo dõi và quản lý các sự kiện bạn đã tham gia
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="text-center p-4">
            <Calendar className="w-8 h-8 mx-auto text-orange-500" />
            <p className="font-semibold">Tổng cộng</p>
            <p className="text-2xl font-bold gradient-text">
              {ongoingActivities.length + finishedActivities.length}
            </p>
          </CardContent></Card>

          <Card><CardContent className="text-center p-4">
            <Trophy className="w-8 h-8 mx-auto text-green-500" />
            <p className="font-semibold">Đang diễn ra</p>
            <p className="text-2xl font-bold gradient-text">
              {ongoingActivities.length}
            </p>
          </CardContent></Card>

          <Card><CardContent className="text-center p-4">
            <Users className="w-8 h-8 mx-auto text-blue-500" />
            <p className="font-semibold">Đã kết thúc</p>
            <p className="text-2xl font-bold gradient-text">
              {finishedActivities.length}
            </p>
          </CardContent></Card>
        </div>
        <Tabs defaultValue="ongoing" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="ongoing">
              Đang diễn ra ({ongoingActivities.length})
            </TabsTrigger>
            <TabsTrigger value="finished">
              Đã kết thúc ({finishedActivities.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing">
            {ongoingActivities.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-gray-500">
                Không có sự kiện nào đang diễn ra
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {ongoingActivities.map((event) => {
                  const Icon = categoryIcons[event.category] || BookOpen;

                  return (
                    <Card
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="cursor-pointer hover:shadow-lg transition"
                    >
                      <CardContent className="p-6 flex gap-4">

                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Icon className="text-white w-8 h-8" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {event.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* FINISHED =================================================== */}
          <TabsContent value="finished">
            {finishedActivities.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-gray-500">
                Chưa có sự kiện nào kết thúc
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {finishedActivities.map((event) => {
                  const Icon = categoryIcons[event.category] || BookOpen;

                  return (
                    <Card
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="cursor-pointer hover:shadow-lg transition opacity-80 hover:opacity-100"
                    >
                      <CardContent className="p-6 flex gap-4">

                        <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center">
                          <Icon className="text-white w-8 h-8" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {event.description}
                          </p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">

                {/* SUBMISSION SECTION */}
                {selectedEvent.category === "CreativeContest" && (
                  <div className="border-t pt-4">

                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Nộp bài dự thi</h3>

                      {submission && !showSubmissionForm && (
                        <Button
                          onClick={() => setShowSubmissionForm(true)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4" /> Chỉnh sửa
                        </Button>
                      )}
                    </div>

                    {submissionLoading ? (
                      <p className="text-gray-500">Đang tải bài nộp…</p>
                    ) : submission && !showSubmissionForm ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Tiêu đề bài nộp</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/submission/my-submission/detail/${submissionId}`)
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> Xem chi tiết
                          </Button>
                        </div>

                        <p className="text-gray-600">{submission.title}</p>

                        {submission.attachments?.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {submission.attachments.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 bg-gray-50 border rounded"
                              >
                                <FileText className="w-4 h-4" />
                                <a
                                  href={a.url}
                                  target="_blank"
                                  className="text-blue-600 hover:underline flex-1"
                                >
                                  {a.fileName}
                                </a>
                                <Eye className="w-4 h-4 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">

                        {/* TITLE INPUT */}
                        <div>
                          <label className="font-medium text-sm">
                            Tiêu đề bài nộp <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={submissionTitle}
                            onChange={(e) => setSubmissionTitle(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                          />
                        </div>

                        {/* FILE UPLOAD */}
                        <div>
                          <label className="font-medium text-sm">
                            File bài nộp <span className="text-red-500">*</span>
                          </label>

                          <div className="border-2 border-dashed rounded p-4 mt-1">
                            <input
                              id="upload"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                setSelectedFiles(Array.from(e.target.files))
                              }
                            />
                            <label htmlFor="upload" className="cursor-pointer">
                              <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                              <p className="text-gray-600 text-center">
                                Chọn file để tải lên
                              </p>
                            </label>
                          </div>

                          {selectedFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {selectedFiles.map((f, i) => (
                                <p key={i} className="text-sm text-gray-700">
                                  {f.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleSubmitSubmission}
                          className="bg-orange-500 hover:bg-orange-600"
                          disabled={submitting}
                        >
                          {submitting ? "Đang xử lý…" : "Nộp bài"}
                        </Button>

                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}

        </DialogContent>
      </Dialog>

    </>
  );
}

