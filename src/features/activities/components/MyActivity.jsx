import { useState, useEffect } from "react";
import Sidebar from "@/features/landing/components/Sidebar";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, ChevronRight, BookOpen, Trophy, Music, Palette, Upload, FileText, Eye, Edit2, X } from "lucide-react";
import { activityService } from "@/features/activities/services/activity.service";
import { submissionService } from "@/features/activities/services/submission.service";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { LoadingCard } from "@/common/components/ui/loading";
import { uploadMultipleFiles } from "@/common/utils/upload";
import { Button } from "@/common/components/ui/button";

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

// Helper function to map API data to component format
// Now using MyActivityResponseDto which includes user participation info
// Status is already determined by backend, so we just use it
const mapActivityToEvent = (activity) => {
  const startDate = activity.startDate ? new Date(activity.startDate) : null;
  const endDate = activity.endDate ? new Date(activity.endDate) : null;
  
  // Determine status based on dates (for display purposes)
  // Backend already filters, but we still need to show correct badge
  const now = new Date();
  let status = "finished";
  if (endDate) {
    if (now <= endDate) {
      status = "ongoing"; // Includes upcoming and currently running
    } else {
      status = "finished";
    }
  } else {
    status = "ongoing"; // No end date means ongoing
  }

  // Map category from subType
  const category = activity.subType || "workshop";
  
  // Get registered date from MyActivityResponseDto (already mapped by backend)
  const registeredDate = activity.registeredAt 
    ? new Date(activity.registeredAt).toISOString().split("T")[0] 
    : null;
  
  // Get points from MyActivityResponseDto (already mapped by backend)
  const yourPoints = activity.starPoints || 0;

  // Format time from startDate
  const time = startDate 
    ? `${startDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${endDate ? endDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}`
    : "";

  // Get tags from rules (now it's array of strings, not objects)
  const tags = activity.rules?.slice(0, 3) || [];

  return {
    id: activity.id,
    title: activity.title || "",
    description: activity.description || "",
    date: startDate ? startDate.toISOString().split("T")[0] : "",
    time: time,
    location: activity.location || "",
    organizer: activity.organizer || "",
    participants: activity.numberOfParticipants || 0,
    maxParticipants: activity.maxParticipants || 0,
    category: category,
    status: status,
    image: activity.thumbnailUrl || "",
    tags: tags,
    registeredDate: registeredDate,
    yourPoints: yourPoints,
  };
};

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [finishedActivities, setFinishedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(50); // Get all activities for now
  
  // Submission states
  const [submission, setSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState([]); // Keep track of existing attachments when editing

  // Fetch activities based on active tab
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
        setError(null);
        
        // Fetch both ongoing and finished activities independently
        // Use Promise.allSettled to handle errors gracefully
        console.log("Fetching activities with params:", { pageNumber, pageSize, status: "ongoing/finished" });
        
        const [ongoingResult, finishedResult] = await Promise.allSettled([
          executeApiCall(
            activityService.getMyActivities.bind(activityService),
            [pageNumber, pageSize, null, "ongoing", token],
            { setLoading: () => {}, setError: () => {} }
          ).catch(err => {
            console.error("Error fetching ongoing activities:", err);
            return null;
          }),
          executeApiCall(
            activityService.getMyActivities.bind(activityService),
            [pageNumber, pageSize, null, "finished", token],
            { setLoading: () => {}, setError: () => {} }
          ).catch(err => {
            console.error("Error fetching finished activities:", err);
            return null;
          })
        ]);

        // Process ongoing activities
        const ongoingResponse = ongoingResult.status === 'fulfilled' ? ongoingResult.value : null;
        console.log("Ongoing Response Full:", JSON.stringify(ongoingResponse, null, 2));
        
        if (ongoingResponse?.data) {
          // Backend returns: { data: { data: [...], totalCount, ... }, message, statusCode }
          const paginationData = ongoingResponse.data;
          console.log("Ongoing Pagination Data:", paginationData);
          console.log("Ongoing Pagination Data.data:", paginationData?.data);
          console.log("Ongoing Total Count:", paginationData?.totalCount);
          
          const activitiesData = Array.isArray(paginationData?.data) ? paginationData.data : [];
          console.log("Ongoing Activities Data (parsed):", activitiesData);
          console.log("Ongoing Activities Data length:", activitiesData.length);
          
          if (activitiesData.length > 0) {
            const mappedActivities = activitiesData.map(mapActivityToEvent);
            console.log("Mapped Ongoing Activities:", mappedActivities);
            setOngoingActivities(mappedActivities);
            console.log("Set ongoingActivities state with", mappedActivities.length, "items");
          } else {
            console.warn("Ongoing activities array is empty");
            setOngoingActivities([]);
          }
        } else {
          console.warn("No ongoing activities data in response", ongoingResponse);
          setOngoingActivities([]);
        }

        // Process finished activities
        const finishedResponse = finishedResult.status === 'fulfilled' ? finishedResult.value : null;
        console.log("Finished Response Full:", JSON.stringify(finishedResponse, null, 2));
        
        if (finishedResponse?.data) {
          // Backend returns: { data: { data: [...], totalCount, ... }, message, statusCode }
          const paginationData = finishedResponse.data;
          console.log("Finished Pagination Data:", paginationData);
          console.log("Finished Pagination Data.data:", paginationData?.data);
          console.log("Finished Total Count:", paginationData?.totalCount);
          
          const activitiesData = Array.isArray(paginationData?.data) ? paginationData.data : [];
          console.log("Finished Activities Data (parsed):", activitiesData);
          console.log("Finished Activities Data length:", activitiesData.length);
          
          if (activitiesData.length > 0) {
            const mappedActivities = activitiesData.map(mapActivityToEvent);
            console.log("Mapped Finished Activities:", mappedActivities);
            setFinishedActivities(mappedActivities);
            console.log("Set finishedActivities state with", mappedActivities.length, "items");
          } else {
            console.warn("Finished activities array is empty");
            setFinishedActivities([]);
          }
        } else {
          console.warn("No finished activities data in response", finishedResponse);
          setFinishedActivities([]);
        }

        // Show error only if both requests failed
        if (ongoingResult.status === 'rejected' && finishedResult.status === 'rejected') {
          setError("Không thể tải danh sách hoạt động");
        } else if (ongoingResult.status === 'rejected' || finishedResult.status === 'rejected') {
          // Partial error - show warning but don't block UI
          console.warn("Một số hoạt động không thể tải được");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err.message || "Không thể tải danh sách hoạt động");
        setLoading(false);
      }
    };

    fetchActivities();
  }, [pageNumber, pageSize]);

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
    setSubmission(null);
    setShowSubmissionForm(false);
    setSelectedFiles([]);
    setSubmissionTitle("");
    
    // Check if this is a CreativeContest and ongoing
    const isCreativeContest = event.category === "CreativeContest";
    const isOngoing = event.status === "ongoing";
    
    if (isCreativeContest && isOngoing) {
      // Fetch user's submission for this activity
      await fetchSubmission(event.id);
    }
  };

  const fetchSubmission = async (activityId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSubmissionLoading(true);
      const response = await executeApiCall(
        submissionService.getMySubmissionByActivityId.bind(submissionService),
        [activityId, token],
        { setLoading: () => {}, setError: () => {} }
      );
      
      if (response?.data) {
        setSubmission(response.data);
        setSubmissionTitle(response.data.title || "");
        setExistingAttachments(response.data.attachments || []);
      } else {
        setSubmission(null);
        setExistingAttachments([]);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      // If 404, user hasn't submitted yet
      if (error.statusCode !== 404) {
        setError("Không thể tải thông tin bài nộp");
      }
      setSubmission(null);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmitSubmission = async () => {
    if (!submissionTitle.trim()) {
      setError("Vui lòng nhập tiêu đề bài nộp");
      return;
    }

    // Check if there are any attachments (new files or existing ones)
    const hasNewFiles = selectedFiles.length > 0;
    const hasExistingFiles = existingAttachments.length > 0;
    
    if (!hasNewFiles && !hasExistingFiles) {
      setError("Vui lòng chọn ít nhất một file");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let attachments = [];
      
      // Add existing attachments that haven't been removed
      if (existingAttachments.length > 0) {
        attachments = [...existingAttachments];
      }
      
      // Upload new files if any and add to attachments
      if (selectedFiles.length > 0) {
        const uploadResults = await uploadMultipleFiles(selectedFiles);
        const newAttachments = uploadResults.map(result => ({
          url: result.url,
          fileName: result.fileName,
          fileType: result.fileType
        }));
        attachments = [...attachments, ...newAttachments];
      }

      if (submission) {
        // Update existing submission
        const updateData = {
          id: submission.id,
          title: submissionTitle,
          attachments: attachments
        };
        
        const response = await executeApiCall(
          submissionService.updateSubmission.bind(submissionService),
          [submission.id, updateData, token],
          { setLoading: () => {}, setError: () => {} }
        );
        
        if (response?.data) {
          setSubmission(response.data);
          setExistingAttachments(response.data.attachments || []);
          setShowSubmissionForm(false);
          setSelectedFiles([]);
          setError(null);
          alert("Cập nhật bài nộp thành công!");
        }
      } else {
        // Create new submission
        const createData = {
          activityId: selectedEvent.id,
          title: submissionTitle,
          attachments: attachments
        };
        
        const response = await executeApiCall(
          submissionService.createSubmission.bind(submissionService),
          [createData, token],
          { setLoading: () => {}, setError: () => {} }
        );
        
        if (response?.data) {
          setSubmission(response.data);
          setExistingAttachments(response.data.attachments || []);
          setShowSubmissionForm(false);
          setSelectedFiles([]);
          setSubmissionTitle("");
          setError(null);
          alert("Nộp bài thành công!");
        }
      }
    } catch (error) {
      console.error("Error submitting submission:", error);
      setError(error.message || "Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  const getStatusBadge = (status) => {
    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <LoadingCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          <div className="lg:col-span-9">
            <div className="mb-6">
              <h1 className="text-3xl font-bold gradient-text mb-2">Sự kiện của tôi</h1>
              <p className="text-gray-600">Theo dõi và quản lý các sự kiện bạn đã tham gia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="glass hover-lift">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Tổng cộng</h3>
                  <p className="text-2xl font-bold gradient-text">{ongoingActivities.length + finishedActivities.length}</p>
                </CardContent>
              </Card>
              <Card className="glass hover-lift">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Đang diễn ra</h3>
                  <p className="text-2xl font-bold gradient-text">{ongoingActivities.length}</p>
                </CardContent>
              </Card>
              <Card className="glass hover-lift">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Đã kết thúc</h3>
                  <p className="text-2xl font-bold gradient-text">{finishedActivities.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="ongoing" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="ongoing">Đang diễn ra ({ongoingActivities.length})</TabsTrigger>
                <TabsTrigger value="finished">Đã kết thúc ({finishedActivities.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="ongoing">
                {ongoingActivities.length === 0 ? (
                  <Card className="glass">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">Bạn chưa tham gia sự kiện nào đang diễn ra</p>
                      <p className="text-sm text-gray-400 mt-1">Hãy khám phá và tham gia những sự kiện thú vị!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ongoingActivities.map((event) => {
                      const IconComponent = categoryIcons[event.category] || BookOpen;
                      return (
                        <Card
                          key={event.id}
                          className="glass hover-lift card-shine cursor-pointer transition-all"
                          onClick={() => handleEventClick(event)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="w-16 h-16 bg-gradient-orange rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-8 h-8 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    {getStatusBadge(event.status)}
                                    <Badge className={categoryColors[event.category] || categoryColors.workshop}>
                                      {event.category === "SeminarWorkshop" || event.category === "workshop"
                                        ? "Workshop"
                                        : event.category === "SportsFestival" || event.category === "Competition" || event.category === "competition"
                                        ? "Cuộc thi"
                                        : event.category === "CreativeContest"
                                        ? "Cuộc thi sáng tạo"
                                        : event.category}
                                    </Badge>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                  {event.description}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span>{formatDate(event.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>{formatTime(event.time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="truncate">{event.location ? event.location.split(" - ")[0] : ""}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-orange-500" />
                                    <span>
                                      {event.participants}/{event.maxParticipants}
                                    </span>
                                  </div>
                                </div>

                                {event.tags && event.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {event.tags.slice(0, 2).map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {event.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{event.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {event.yourPoints > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Điểm thưởng</p>
                                    <p className="text-lg font-bold text-orange-500">+{event.yourPoints}</p>
                                  </div>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* FINISHED EVENTS */}
              <TabsContent value="finished">
                {finishedActivities.length === 0 ? (
                  <Card className="glass">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">Bạn chưa hoàn thành sự kiện nào</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Những sự kiện bạn tham gia sẽ xuất hiện tại đây khi kết thúc
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {finishedActivities.map((event) => {
                      const IconComponent = categoryIcons[event.category] || BookOpen;
                      return (
                        <Card
                          key={event.id}
                          className="glass hover-lift card-shine cursor-pointer transition-all opacity-80 hover:opacity-100"
                          onClick={() => handleEventClick(event)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-8 h-8 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                  </div>
                                  <div className="flex gap-2">
                                    {getStatusBadge(event.status)}
                                    <Badge className={categoryColors[event.category] || categoryColors.workshop}>
                                      {event.category === "SeminarWorkshop" || event.category === "workshop"
                                        ? "Workshop"
                                        : event.category === "SportsFestival" || event.category === "Competition" || event.category === "competition"
                                        ? "Cuộc thi"
                                        : event.category === "CreativeContest"
                                        ? "Cuộc thi sáng tạo"
                                        : event.category}
                                    </Badge>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{event.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{formatDate(event.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>{event.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{event.location.split(" - ")[0]}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>
                                      {event.participants}/{event.maxParticipants}
                                    </span>
                                  </div>
                                </div>


                                {event.tags && event.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {event.tags.slice(0, 2).map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {event.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{event.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Điểm thưởng</p>
                                  <p className="text-lg font-bold text-orange-500">+{event.yourPoints}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onClose={() => setShowDetailsModal(false)}
          showCloseButton={true}
        >
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedEvent.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Ngày</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Thời gian</p>
                      <p className="text-sm text-gray-600">{formatTime(selectedEvent.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Địa điểm</p>
                      <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Người tham gia</p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.participants}/{selectedEvent.maxParticipants}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Tổ chức bởi</p>
                  <p className="text-sm text-gray-600">{selectedEvent.organizer}</p>
                </div>
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Thẻ</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.yourPoints && (
                  <div>
                    <p className="text-sm font-medium mb-2">Điểm của bạn</p>
                    <p className="text-lg font-bold text-orange-500">{selectedEvent.yourPoints} điểm</p>
                  </div>
                )}
                {selectedEvent.registeredDate && (
                  <div>
                    <p className="text-sm font-medium mb-2">Ngày đăng ký</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedEvent.registeredDate)}</p>
                  </div>
                )}

                {/* Submission Section for CreativeContest */}
                {selectedEvent.category === "CreativeContest" && selectedEvent.status === "ongoing" && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Nộp bài dự thi</h3>
                      {submission && !showSubmissionForm && (
                        <Button
                          onClick={() => {
                            setShowSubmissionForm(true);
                            setSubmissionTitle(submission.title || "");
                            setExistingAttachments(submission.attachments || []);
                            setSelectedFiles([]);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Chỉnh sửa
                        </Button>
                      )}
                    </div>

                    {submissionLoading ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Đang tải thông tin bài nộp...</p>
                      </div>
                    ) : submission && !showSubmissionForm ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Tiêu đề bài nộp</p>
                          <p className="text-sm text-gray-600">{submission.title}</p>
                        </div>
                        {submission.attachments && submission.attachments.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">File đã nộp</p>
                            <div className="space-y-2">
                              {submission.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                                >
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex-1"
                                  >
                                    {attachment.fileName || `File ${index + 1}`}
                                  </a>
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Tiêu đề bài nộp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={submissionTitle}
                            onChange={(e) => setSubmissionTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài nộp"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            File bài nộp <span className="text-red-500">*</span>
                          </label>
                          
                          {/* Show existing attachments when editing */}
                          {submission && existingAttachments.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-2">File hiện tại:</p>
                              <div className="space-y-1">
                                {existingAttachments.map((attachment, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm border border-blue-200"
                                  >
                                    <span className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {attachment.fileName || `File ${index + 1}`}
                                      </a>
                                    </span>
                                    <button
                                      onClick={() => {
                                        const newAttachments = existingAttachments.filter((_, i) => i !== index);
                                        setExistingAttachments(newAttachments);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                      title="Xóa file"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                              id="submission-file-input"
                            />
                            <label
                              htmlFor="submission-file-input"
                              className="cursor-pointer flex flex-col items-center justify-center"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                {selectedFiles.length > 0
                                  ? `${selectedFiles.length} file mới đã chọn`
                                  : submission
                                  ? "Chọn thêm file mới (tùy chọn)"
                                  : "Chọn file để nộp bài"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Có thể chọn nhiều file (PDF, Word, Image, Video)
                              </p>
                            </label>
                          </div>
                          {selectedFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-500 mb-1">File mới:</p>
                              {selectedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                >
                                  <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {file.name}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newFiles = selectedFiles.filter((_, i) => i !== index);
                                      setSelectedFiles(newFiles);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            {error}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitSubmission}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                          >
                            {submitting ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {submission ? "Cập nhật bài nộp" : "Nộp bài"}
                              </>
                            )}
                          </Button>
                          {showSubmissionForm && (
                            <Button
                              onClick={() => {
                                setShowSubmissionForm(false);
                                setSelectedFiles([]);
                                setError(null);
                                if (submission) {
                                  setSubmissionTitle(submission.title || "");
                                  setExistingAttachments(submission.attachments || []);
                                } else {
                                  setSubmissionTitle("");
                                  setExistingAttachments([]);
                                }
                              }}
                              variant="outline"
                            >
                              Hủy
                            </Button>
                          )}
                        </div>
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
