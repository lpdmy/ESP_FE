import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Input } from "@/common/components/ui/input";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
} from "@/common/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/common/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { useToast } from "@/common/hooks/useToast";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "@/features/activities/services/activity.service";
import { activityMatchService } from "@/services/activityMatch.service";
import { activityParticipantService } from "@/features/activities/services/activityParticipant.service";
import { submissionService } from "@/features/activities/services/submission.service";
import { ROUTES } from "@/common/constants/routes";
import { LoadingCard } from "@/common/components/ui/loading";
import { ClassGroupService } from "@/services/classgroup.service";
import { jwtDecode } from "jwt-decode";
import { useSearchApi } from "@/common/hooks/useSearchApi";
import { useSubmissionApi } from "@/features/landing/submission/hooks/useSubmissionApi";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { BracketTree } from "@/features/admin/components/ActivityManagement/BracketTree";
import { formatDateFromAPI } from "@/common/utils/dateUtils";
import { uploadFile } from "@/common/utils/upload";

// Tournament Bracket Viewer - Sử dụng BracketTree từ admin
const TournamentBracketViewer = memo(
  ({
    rounds,
    formatClassName,
    onMatchClick,
    fullScreen = false,
    onMaximize,
  }) => {
    if (!rounds || rounds.length === 0) return null;

    // Transform rounds data sang format matches array cho BracketTree
    const allMatches = useMemo(() => {
      const matches = [];
      rounds.forEach((round) => {
        round.matches?.forEach((match) => {
          matches.push({
            ...match,
            round: round.roundNumber,
            roundName: round.roundName || `Vòng ${round.roundNumber}`,
            // Format class names với grade
            classGroup1Name:
              formatClassName(match.classGroup1Name, match.classGroup1Id) ||
              "Chờ kết quả",
            classGroup2Name:
              formatClassName(match.classGroup2Name, match.classGroup2Id) ||
              "Chờ kết quả",
          });
        });
      });
      return matches;
    }, [rounds, formatClassName]);

    // Tạo official object giống format từ API
    const officialBracket = useMemo(() => {
      return {
        rounds: rounds.map((round) => ({
          roundNumber: round.roundNumber,
          roundName: round.roundName || `Vòng ${round.roundNumber}`,
          matches:
            round.matches?.map((match) => ({
              ...match,
              classGroup1Name:
                formatClassName(match.classGroup1Name, match.classGroup1Id) ||
                "Chờ kết quả",
              classGroup2Name:
                formatClassName(match.classGroup2Name, match.classGroup2Id) ||
                "Chờ kết quả",
            })) || [],
        })),
      };
    }, [rounds, formatClassName]);

    if (allMatches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm">Chưa có lịch thi đấu.</p>
        </div>
      );
    }

    const containerHeight = fullScreen ? "h-full" : "h-[700px]";

    // Khi fullScreen, dùng native scroll, không dùng zoom/pan
    if (fullScreen) {
      return (
        <div className={`w-full h-full overflow-auto bg-slate-50`} style={{ scrollBehavior: "smooth" }}>
          <div className="min-w-full min-h-full flex items-center justify-center p-8 md:p-12 lg:p-20">
            <BracketTree
              matches={allMatches}
              official={officialBracket}
              onMatchClick={onMatchClick}
              getClassNameById={formatClassName}
            />
          </div>
        </div>
      );
    }

    // Khi không fullScreen, dùng native scroll với thanh cuộn ngang và dọc
    return (
      <div
        className={`relative border border-slate-200 rounded-lg overflow-auto bg-slate-50/50 ${containerHeight}`}
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Toolbar chỉ có nút phóng to */}
        {onMaximize && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white shadow-md border border-slate-200"
              onClick={onMaximize}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Bracket với native scroll */}
        <div className="min-w-full min-h-full flex items-center justify-center p-8 md:p-12 lg:p-20">
          <BracketTree
            matches={allMatches}
            official={officialBracket}
            onMatchClick={onMatchClick}
            getClassNameById={formatClassName}
          />
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.rounds === next.rounds &&
    prev.formatClassName === next.formatClassName &&
    prev.fullScreen === next.fullScreen &&
    prev.onMaximize === next.onMaximize
);

// Placeholder image as data URI to avoid 404 errors
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EẢnh hoạt động%3C/text%3E%3C/svg%3E";
const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='40' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E?%3C/text%3E%3C/svg%3E";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  Award,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
  Trophy,
  MoreHorizontal,
  Info,
  GripVertical,
  Search,
  X,
  Upload,
  File,
  ChevronDown,
  Plus,
  Minus,
  Maximize2,
  RotateCcw,
  Infinity,
} from "lucide-react";

// FilterSelect component giống ActivitiesList.jsx
function SportFilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={`relative z-10 ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-8 w-44 items-center justify-between rounded-lg border px-3 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
          open
            ? "border-orange-400 ring-2 ring-orange-500"
            : "border-orange-200"
        }`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder || "Chọn môn"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-orange-500 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-orange-100 bg-white shadow-xl overflow-hidden">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                value === option.value
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ViewActivity() {
  const { getSubmissionRank } = useSubmissionApi();
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  const rankings = [
    {
      rank: 1,
      name: "Nguyễn Văn A",
      class: "11A3",
      avatar: "/student1.png",
      score: 95,
      submissions: 5,
      avgScore: 19,
      status: "Hoàn thành",
    },
    {
      rank: 2,
      name: "Trần Thị B",
      class: "11A4",
      avatar: "/student2.png",
      score: 88,
      submissions: 5,
      avgScore: 17.6,
      status: "Hoàn thành",
    },
    {
      rank: 3,
      name: "Lê Văn C",
      class: "12A1",
      avatar: "/student3.png",
      score: 82,
      submissions: 4,
      avgScore: 20.5,
      status: "Hoàn thành",
    },
    {
      rank: 4,
      name: "Phạm Thị D",
      class: "12A2",
      avatar: "/student4.png",
      score: 76,
      submissions: 4,
      avgScore: 19,
      status: "Chưa hoàn thành",
    },
    {
      rank: 5,
      name: "Hoàng Văn E",
      class: "11A5",
      avatar: "/student5.png",
      score: 68,
      submissions: 3,
      avgScore: 22.7,
      status: "Chưa hoàn thành",
    },
    {
      rank: 6,
      name: "Võ Thị F",
      class: "11A3",
      avatar: "/student6.png",
      score: 62,
      submissions: 3,
      avgScore: 20.7,
      status: "Chưa hoàn thành",
    },
  ];

  // Helper function để convert category và subType sang tiếng Việt
  const getCategoryLabel = useCallback((category) => {
    if (category === "Activity") return "Hoạt động";
    if (category === "Event") return "Sự kiện";
    return category;
  }, []);

  const getSubTypeLabel = useCallback((subType) => {
    const labels = {
      SportsFestival: "Hội thao",
      CreativeContest: "Cuộc thi sáng tạo",
      SeminarWorkshop: "Hội thảo",
      Seminar: "Hội thảo",
      Workshop: "Workshop",
      Competition: "Cuộc thi",
      Exhibition: "Triển lãm",
      Performance: "Biểu diễn",
      Other: "Khác",
    };
    return labels[subType] || subType;
  }, []);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationReason, setRegistrationReason] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    memberIds: [],
    leaderId: null,
  });
  const [ranking, setRanking] = useState([]);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState(null);
  const [selectedSportMembers, setSelectedSportMembers] = useState([]);
  const [sportSubmitting, setSportSubmitting] = useState(false);
  const [draggedStudent, setDraggedStudent] = useState(null); // { id, name }
  const [dragOverGroup, setDragOverGroup] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]); // Kết quả tìm kiếm user trong hệ thống
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const { searchUsers } = useSearchApi();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPreview = queryParams.get("isPreview") === "true";

  // Submission states
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Lịch thi đấu / kết quả cho hội thao
  const [selectedScheduleSportId, setSelectedScheduleSportId] = useState(null);
  const [scheduleBracket, setScheduleBracket] = useState(null);
  const [loadingScheduleBracket, setLoadingScheduleBracket] = useState(false);
  const [scheduleBracketError, setScheduleBracketError] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "hierarchy"
  const [isBracketFullScreen, setIsBracketFullScreen] = useState(false);
  const [classGroups, setClassGroups] = useState([]); // Lưu classGroups để lấy grade
  const [loadingClassGroups, setLoadingClassGroups] = useState(false);
  // Sport rosters pagination
  const [sportRosters, setSportRosters] = useState([]);
  const [loadingSportRosters, setLoadingSportRosters] = useState(false);
  const [sportRostersPageNumber, setSportRostersPageNumber] = useState(1);
  const [sportRostersPageSize] = useState(10);
  const [sportRostersTotalCount, setSportRostersTotalCount] = useState(0);
  const [sportRostersTotalPages, setSportRostersTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const normalizedRole =
        decoded?.UserRole ||
        decoded?.role ||
        decoded?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      const userId =
        parseInt(
          decoded?.Id ||
            decoded?.id ||
            decoded?.sub ||
            decoded?.nameid ||
            decoded?.[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ||
            0
        ) || null;
      setCurrentUser({
        id: userId,
        role: normalizedRole,
      });
    } catch (err) {
      // Silent fail - token decode error
    }
  }, []);

  const parseRegistrationSettings = (settings) => {
    if (!settings) return null;
    if (typeof settings === "string") {
      try {
        return JSON.parse(settings);
      } catch (err) {
        return null;
      }
    }
    return settings;
  };
  const handleFetchSubmissionRank = async () => {
    try {
      const response = await getSubmissionRank(params.id);
      setRanking(response.data);
    } catch (err) {}
  };
  // Helper function to get registration type ("individual" or "group")
  const getRegistrationType = (registrationSettings) => {
    const parsed = parseRegistrationSettings(registrationSettings);
    return parsed?.registrationType || "individual"; // Default to individual
  };

  // Helper function to get group settings with defaults
  const getGroupSettings = (registrationSettings) => {
    const parsed = parseRegistrationSettings(registrationSettings);
    const groupReg = parsed?.groupRegistration;
    if (!groupReg) return null;
    return {
      minMembers: groupReg.minMembers ?? 1,
      maxMembers: groupReg.maxMembers ?? null,
      requireLeader: groupReg.requireLeader ?? false,
    };
  };

  // Helper function to get class name (grade + name) - giống AISchedule.jsx
  // Luôn lấy từ classGroups đã load từ API
  const getClassName = useCallback(
    (classGroupId) => {
      if (!classGroupId) return "Chờ kết quả";

      // Tìm classGroup trong classGroups array
      const classGroup = classGroups.find((cg) => {
        const id = typeof cg.id === "number" ? cg.id : parseInt(cg.id);
        const targetId =
          typeof classGroupId === "number"
            ? classGroupId
            : parseInt(classGroupId);
        return id === targetId;
      });

      if (!classGroup) {
        // Nếu không tìm thấy, trả về fallback (sẽ được update khi classGroups load xong)
        return `Lớp ${classGroupId}`;
      }

      // Lấy grade và name từ classGroup
      const grade = classGroup.grade != null ? String(classGroup.grade) : "";
      const name = classGroup.name || "";

      // Format: grade + name (ví dụ: "10A1")
      if (grade && name) {
        return `${grade}${name}`;
      }

      // Nếu không có grade, chỉ trả về name
      if (name) {
        return name;
      }

      // Fallback
      return `Lớp ${classGroupId}`;
    },
    [classGroups]
  );

  // Helper function to format className with grade
  // Backend đã format sẵn ClassGroup1Name và ClassGroup2Name thành "grade + name" (ví dụ: "10A1")
  // Nếu className từ backend đã có format (có số ở đầu), dùng luôn
  // Nếu chưa có, dùng getClassName để format từ classGroups
  const formatClassNameWithGrade = useCallback(
    (className, classGroupId) => {
      // Backend đã format sẵn: nếu className có số ở đầu (ví dụ: "10A1"), dùng luôn
      if (className && /^\d/.test(className)) {
        return className;
      }

      // Nếu className chưa có format và có classGroupId, dùng getClassName để format
      if (classGroupId) {
        const formatted = getClassName(classGroupId);
        // Nếu getClassName trả về format đúng (có số), dùng nó
        if (formatted && /^\d/.test(formatted)) {
          return formatted;
        }
      }

      // Nếu không có className hoặc là fallback, trả về
      if (!className || className === "Chờ kết quả" || className === "Lớp ?") {
        return classGroupId ? getClassName(classGroupId) : "Chờ kết quả";
      }

      // Trả về className gốc
      return className;
    },
    [getClassName]
  );

  const normalizeParticipants = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((participant) => {
      // Format className: Grade + className (ví dụ: "10A1")
      // Kiểm tra xem className đã có Grade ở đầu chưa (tránh duplicate như "1010A1")
      const grade = participant?.grade || participant?.Grade;
      const className = participant?.classGroupName || "Chờ kết quả";

      let formattedClassName = className;
      if (grade && className !== "Chờ kết quả") {
        // Kiểm tra xem className đã bắt đầu bằng Grade chưa
        const gradeStr = String(grade);
        if (!className.startsWith(gradeStr)) {
          formattedClassName = `${grade}${className}`;
        }
      }

      return {
        id: participant?.id,
        userId: participant?.userId,
        fullName:
          participant?.userFullName ||
          participant?.userName ||
          "Người tham gia",
        className: formattedClassName,
        classGroupName: participant?.classGroupName, // Giữ lại để dùng khi cần
        classGroupId: participant?.classGroupId || null, // QUAN TRỌNG: Giữ lại classGroupId
        grade: grade,
        groupCode: participant?.groupCode || null,
        isLeader: participant?.isLeader || false,
        sportId: participant?.sportId || null,
        sportName: participant?.sportName || null,
        registrationMetadata: participant?.registrationMetadata || "",
        avatar: participant?.userAvatarUrl,
        isDeleted: participant?.isDeleted || false, // QUAN TRỌNG: Giữ lại isDeleted
      };
    });
  };

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Handle click outside dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Use setTimeout to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  useEffect(() => {
    handleFetchSubmissionRank();
  }, [params]);
  const fetchActivity = useCallback(async () => {
    if (!params.id) {
      setError("Không tìm thấy hoạt động để hiển thị");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await executeApiCall(
        activityService.getActivityById.bind(activityService),
        [params.id, token],
        { setLoading: () => {}, setError }
      );

      if (!response?.data) {
        setError("Không tìm thấy dữ liệu hoạt động");
        setLoading(false);
        return;
      }

      const activityData = response.data?.data || response.data;
      if (!activityData) {
        setError("Không tìm thấy dữ liệu hoạt động");
        setLoading(false);
        return;
      }
      const nowUTC = new Date();
      // Convert now sang VN time để so sánh
      const nowVN = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

      // Helper để parse date string từ API
      // API trả về date string đã là VN time rồi, parse trực tiếp (không convert thêm)
      const parseDateFromAPI = (dateStr) => {
        if (!dateStr) return null;
        // Parse như local time (VN time) vì API đã trả về VN time
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      };

      // Parse dates từ API (đã là VN time rồi, không cần convert thêm)
      const startDateVN = parseDateFromAPI(activityData.startDate);
      const endDateVN = parseDateFromAPI(activityData.endDate);
      const registerDateVN = parseDateFromAPI(activityData.registerDate);
      const endRegisterDateVN = parseDateFromAPI(activityData.endRegisterDate);

      let status = "Đang đăng ký";
      if (startDateVN && endDateVN) {
        if (nowVN >= startDateVN && nowVN <= endDateVN) {
          status = "Đang diễn ra";
        } else if (nowVN > endDateVN) {
          status = "Đã kết thúc";
        } else if (
          registerDateVN &&
          nowVN >= registerDateVN &&
          nowVN < startDateVN
        ) {
          status = "Sắp tới";
        }
      }

      const getTimelineStatus = (date) => {
        if (!date) return "upcoming";
        // Parse date từ API (đã là VN time rồi, không cần convert thêm)
        const dateVN = parseDateFromAPI(date);
        if (!dateVN) return "upcoming";
        return nowVN >= dateVN ? "completed" : "upcoming";
      };

      const normalizedParticipants = normalizeParticipants(
        activityData?.participants
      );
      const sports = (activityData?.sports || []).map((sport) => ({
        id: sport?.id,
        name: sport?.sportName,
        maxMembers: sport?.maxMembers,
      }));

      // Check if activity is soft-deleted
      if (
        activityData?.isDeleted === true ||
        activityData?.isDeleted === "true"
      ) {
        toastRef.current.showError(
          "Hoạt động này đã bị xóa và không còn khả dụng. Bạn sẽ được chuyển về trang danh sách."
        );
        setTimeout(() => {
          navigate(ROUTES.ACTIVITY.LIST);
        }, 2000);
        setLoading(false);
        return;
      }

      const activityDetail = activityData?.activityDetail || {};

      setActivity({
        id: activityData?.id || 0,
        title: activityData?.title || "",
        description: activityData?.description || "",
        category: activityData?.category === 1 ? "Activity" : "Event",
        subType: activityData?.subType || "",
        thumbnail: activityData?.thumbnailUrl || "",
        startDate: activityData?.startDate
          ? formatDateFromAPI(activityData.startDate, false)
          : "",
        endDate: activityData?.endDate
          ? formatDateFromAPI(activityData.endDate, false)
          : "",
        registerDate: activityData?.registerDate
          ? formatDateFromAPI(activityData.registerDate, false)
          : "",
        endRegisterDate: activityData?.endRegisterDate
          ? formatDateFromAPI(activityData.endRegisterDate, false)
          : "",
        location: activityData?.location || "",
        organizer: activityData?.organizer || "",
        maxParticipants: activityData?.maxParticipants || 0,
        currentParticipants:
          activityData?.numberOfParticipants ||
          normalizedParticipants.length ||
          0,
        status,
        sportsCategories: sports.map((sport) => sport.name).filter(Boolean),
        sports,
        competitionType: activityDetail?.competitionType || "",
        // CreativeContest fields
        theme: activityDetail?.theme || "",
        genre: activityDetail?.genre || "",
        paperSize: activityDetail?.paperSize || "",
        drawingMedium: activityDetail?.drawingMedium || "",
        timeLimit: activityDetail?.timeLimit || "",
        submissionFormat: activityDetail?.submissionFormat || "",
        // Problem/Submission fields
        problemText: activityData?.problemText || null,
        problemFileUrl: activityData?.problemFileUrl || null,
        submissionDeadline: activityData?.submissionDeadline || null,
        isProblemVisible: activityData?.isProblemVisible ?? false,
        rules: activityData?.rules || [],
        timeline: [
          {
            date: activityData?.registerDate
              ? new Date(activityData.registerDate).toISOString().split("T")[0]
              : "",
            title: "Mở đăng ký",
            status: getTimelineStatus(activityData?.registerDate),
          },
          {
            date: activityData?.endRegisterDate
              ? new Date(activityData.endRegisterDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            title: "Đóng đăng ký",
            status: getTimelineStatus(activityData?.endRegisterDate),
          },
          {
            date: activityData?.startDate
              ? new Date(activityData.startDate).toISOString().split("T")[0]
              : "",
            title: "Khai mạc",
            status: getTimelineStatus(activityData?.startDate),
          },
          // Thêm hạn cuối nộp bài nếu có (chỉ cho CreativeContest)
          ...(activityData?.submissionDeadline
            ? [
                {
                  date: activityData.submissionDeadline
                    ? new Date(activityData.submissionDeadline)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  title: "Hạn cuối nộp bài",
                  status: getTimelineStatus(activityData.submissionDeadline),
                },
              ]
            : []),
          {
            date: activityData?.endDate
              ? new Date(activityData.endDate).toISOString().split("T")[0]
              : "",
            title: "Bế mạc & Trao giải",
            status: getTimelineStatus(activityData?.endDate),
          },
        ],
        awards:
          activityData?.awards
            ?.map((a) => ({
              rank: a?.name || a?.rank || "",
              prize: `${a?.starPoints || a?.points || 0} điểm`,
            }))
            .filter(Boolean) || [],
        speakers: activityData?.speakers || [],
        programs: activityData?.programs || activityData?.programItems || [],
        participants: normalizedParticipants,
        onlyTeacherCanRegister: activityData?.onlyTeacherCanRegister || false,
        gradingSettings: activityData?.gradingSettings || null,
        registrationReward: activityData?.registrationReward || null,
        registrationSettings: parseRegistrationSettings(
          activityData?.registrationSettings
        ),
      });
      setLoading(false);
    } catch (err) {
      toastRef.current.showError(
        err?.message || "Không thể tải thông tin hoạt động"
      );
      if (err?.statusCode === 404) {
        navigate(ROUTES.ACTIVITY.LIST);
      }
      setLoading(false);
    }
  }, [navigate, params.id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Load classGroups từ participants (chỉ khi cần, không load tất cả)
  // Backend đã format sẵn ClassGroup1Name và ClassGroup2Name thành "grade + name" trong bracket response
  // Chỉ cần load classGroups khi cần format cho các chỗ khác (participants list, etc.)
  useEffect(() => {
    const loadClassGroups = async () => {
      if (
        !activity ||
        !activity.participants ||
        activity.participants.length === 0
      ) {
        setClassGroups([]);
        setLoadingClassGroups(false);
        return;
      }

      setLoadingClassGroups(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setClassGroups([]);
          setLoadingClassGroups(false);
          return;
        }

        // Lấy danh sách ClassGroupId duy nhất từ participants
        const classGroupIds = new Set();
        activity.participants.forEach((participant) => {
          if (participant.classGroupId && !participant.isDeleted) {
            classGroupIds.add(participant.classGroupId);
          }
        });

        if (classGroupIds.size === 0) {
          setClassGroups([]);
          setLoadingClassGroups(false);
          return;
        }

        // Load từng page (max 100 mỗi page)
        let allClasses = [];
        let pageNumber = 1;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          const response = await ClassGroupService.list(
            { pageNumber, pageSize },
            token
          );
          const pageData = response?.data?.data || response?.data || [];

          if (Array.isArray(pageData) && pageData.length > 0) {
            // Lọc chỉ các lớp cần thiết
            const neededClasses = pageData.filter(
              (c) =>
                !c.isDeleted &&
                classGroupIds.has(
                  typeof c.id === "number" ? c.id : parseInt(c.id)
                )
            );
            allClasses = [...allClasses, ...neededClasses];

            // Nếu đã tìm đủ hoặc số lượng < pageSize thì dừng
            if (
              allClasses.length >= classGroupIds.size ||
              pageData.length < pageSize
            ) {
              hasMore = false;
            } else {
              pageNumber++;
            }
          } else {
            hasMore = false;
          }
        }

        // Sort by grade first, then by name alphabetically
        const sorted = allClasses.sort((a, b) => {
          const gradeA = a.grade ?? 999;
          const gradeB = b.grade ?? 999;
          if (gradeA !== gradeB) {
            return gradeA - gradeB;
          }
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setClassGroups(sorted);
      } catch (error) {
        setClassGroups([]);
      } finally {
        setLoadingClassGroups(false);
      }
    };

    if (activity) {
      loadClassGroups();
    }
  }, [activity]); // Chỉ load khi activity thay đổi

  // Khi load activity xong, nếu là hội thao và có môn thì chọn môn đầu tiên để load lịch
  useEffect(() => {
    if (!activity || !activity.sports || activity.sports.length === 0) return;
    setSelectedScheduleSportId((prev) => {
      if (prev) return prev;
      const first = activity.sports[0];
      return first?.id ? Number(first.id) : null;
    });
  }, [activity]);

  // Handle ESC key và body scroll lock khi full screen modal mở
  useEffect(() => {
    if (isBracketFullScreen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Handle ESC key
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          setIsBracketFullScreen(false);
        }
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isBracketFullScreen]);

  // Load bracket lịch thi đấu cho hội thao
  useEffect(() => {
    const fetchScheduleBracket = async () => {
      if (!activity?.id || !selectedScheduleSportId) {
        setScheduleBracket(null);
        setScheduleBracketError(null);
        return;
      }
      if (activity.subType !== "SportsFestival") {
        setScheduleBracket(null);
        setScheduleBracketError(null);
        return;
      }

      const token = localStorage.getItem("token");
      setLoadingScheduleBracket(true);
      setScheduleBracketError(null);

      try {
        const response = await executeApiCall(
          activityMatchService.getBracket.bind(activityMatchService),
          [activity.id, selectedScheduleSportId, null, token],
          { setLoading: setLoadingScheduleBracket }
        );

        const data = response?.data || response?.data?.data;
        if (data) {
          setScheduleBracket(data);
        } else {
          setScheduleBracket(null);
        }
      } catch (err) {
        const status = err?.statusCode ?? err?.status ?? err?.response?.status;
        if (status === 404) {
          // Chưa có lịch thi đấu cho môn này là bình thường
          setScheduleBracket(null);
        } else {
          setScheduleBracketError(err?.message || "Không thể tải lịch thi đấu");
          setScheduleBracket(null);
        }
      } finally {
        setLoadingScheduleBracket(false);
      }
    };

    fetchScheduleBracket();
  }, [activity?.id, activity?.subType, selectedScheduleSportId]);

  // Load sport rosters với pagination
  useEffect(() => {
    const fetchSportRosters = async () => {
      if (!activity?.id || activity?.subType !== "SportsFestival") {
        setSportRosters([]);
        setSportRostersTotalCount(0);
        setSportRostersTotalPages(0);
        return;
      }

      const token = localStorage.getItem("token");
      setLoadingSportRosters(true);

      try {
        const response = await executeApiCall(
          activityParticipantService.getSportRosters.bind(
            activityParticipantService
          ),
          [
            {
              activityId: activity.id,
              pageNumber: sportRostersPageNumber,
              pageSize: sportRostersPageSize,
            },
            token,
          ],
          { setLoading: setLoadingSportRosters }
        );

        // Response structure: { statusCode, message, data: { data: [...], totalCount, pageNumber, pageSize, totalPages } }
        const paginationData = response?.data;
        if (paginationData) {
          setSportRosters(paginationData.data || []);
          setSportRostersTotalCount(paginationData.totalCount || 0);
          setSportRostersTotalPages(paginationData.totalPages || 0);
        } else {
          setSportRosters([]);
          setSportRostersTotalCount(0);
          setSportRostersTotalPages(0);
        }
      } catch (err) {
        setSportRosters([]);
        setSportRostersTotalCount(0);
        setSportRostersTotalPages(0);
      } finally {
        setLoadingSportRosters(false);
      }
    };

    fetchSportRosters();
  }, [
    activity?.id,
    activity?.subType,
    sportRostersPageNumber,
    sportRostersPageSize,
  ]);

  // Check submission status when activity is loaded
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!activity?.id || !currentUser?.id || isPreview) return;

      // Chỉ check cho CreativeContest có SubmissionDeadline
      if (
        activity.subType !== "CreativeContest" ||
        !activity.submissionDeadline
      )
        return;

      const token = localStorage.getItem("token");
      if (!token) return;

      setIsCheckingSubmission(true);
      try {
        const response = await executeApiCall(
          submissionService.getSubmissionStatus.bind(submissionService),
          [activity.id, token],
          { setError: () => {} }
        );

        const statusData = response?.data?.data || response?.data;
        if (statusData) {
          setSubmissionStatus(statusData);
        }
      } catch (err) {
        // Không hiển thị error nếu không có quyền hoặc chưa đăng ký
      } finally {
        setIsCheckingSubmission(false);
      }
    };

    checkSubmissionStatus();
  }, [
    activity?.id,
    activity?.subType,
    activity?.submissionDeadline,
    currentUser?.id,
    isPreview,
  ]);

  const ensureClassData = useCallback(async () => {
    if (isClassLoading) return;
    if (currentClass && classStudents.length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    setIsClassLoading(true);
    try {
      const classResponse = await ClassGroupService.getCurrentClass(token);
      const classData =
        classResponse?.data?.data || classResponse?.data || classResponse;
      if (!classData) {
        toast.error("Không tìm thấy lớp học hiện tại của bạn.");
        return;
      }

      setCurrentClass(classData);
      const classId = classData?.id || classData?.classGroupId;
      if (!classId) return;

      const studentsResponse = await ClassGroupService.getStudents(
        classId,
        token
      );
      const studentsData =
        studentsResponse?.data?.data ||
        studentsResponse?.data ||
        studentsResponse;
      const normalizedStudents =
        (studentsData || []).map((student) => ({
          id: student?.id,
          fullName:
            student?.fullName ||
            `${student?.firstName || ""} ${student?.lastName || ""}`
              .replace(/\s+/g, " ")
              .trim(),
          studentCode: student?.studentCode,
        })) || [];

      setClassStudents(normalizedStudents.filter((student) => student.id));
    } catch (err) {
      toast.error(err?.message || "Không thể tải thông tin lớp học của bạn.");
    } finally {
      setIsClassLoading(false);
    }
  }, [classStudents.length, currentClass, isClassLoading, toast]);

  const handleOpenGroupDialog = () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để đăng ký.");
      return;
    }
    if (!params.id) {
      toast.error("Không tìm thấy thông tin hoạt động.");
      return;
    }
    // Chuyển qua trang đăng ký
    navigate(ROUTES.ACTIVITY.REGISTER_ACTIVITY.replace(":id", params.id));
  };

  // Tìm kiếm user trong hệ thống
  useEffect(() => {
    const searchUsersInSystem = async () => {
      if (!groupSearchQuery || groupSearchQuery.trim().length < 2) {
        setSearchedUsers([]);
        return;
      }

      setIsSearchingUsers(true);
      try {
        const response = await searchUsers(groupSearchQuery, 1, 20);
        const users = response?.data?.data || response?.data || [];
        // Normalize user data
        const normalizedUsers = users.map((user) => ({
          id: user.id || user.userId,
          fullName:
            user.fullName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.name,
          studentCode: user.studentCode || user.studentNumber,
          email: user.email,
          role: user.role,
          className: user.className || user.classGroupName,
          avatarUrl: user.avatarUrl,
        }));
        setSearchedUsers(normalizedUsers);
      } catch (err) {
        setSearchedUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUsersInSystem();
    }, 500); // Debounce 500ms

    return () => clearTimeout(debounceTimer);
  }, [groupSearchQuery, searchUsers]);

  const handleToggleGroupMember = (studentId) => {
    setGroupForm((prev) => {
      const alreadySelected = prev.memberIds.includes(studentId);

      // Không cho phép xóa người đăng ký (currentUser) khỏi nhóm
      if (alreadySelected && studentId === currentUser?.id) {
        toast.error(
          "Bạn không thể xóa chính mình khỏi nhóm. Bạn phải là thành viên của nhóm."
        );
        return prev;
      }

      let updatedMembers = alreadySelected
        ? prev.memberIds.filter((id) => id !== studentId)
        : [...prev.memberIds, studentId];

      const maxMembers = groupSettings?.maxMembers;
      if (
        !alreadySelected &&
        maxMembers &&
        updatedMembers.length > maxMembers
      ) {
        toast.error(`Nhóm chỉ được phép tối đa ${maxMembers} thành viên.`);
        return prev;
      }

      // Đảm bảo currentUser luôn là thành viên
      if (!updatedMembers.includes(currentUser?.id) && currentUser?.id) {
        updatedMembers = [
          currentUser.id,
          ...updatedMembers.filter((id) => id !== currentUser.id),
        ];
      }

      // Nếu leader bị xóa hoặc không có leader, đặt currentUser làm leader mặc định
      const nextLeader = updatedMembers.includes(prev.leaderId)
        ? prev.leaderId
        : currentUser?.id && updatedMembers.includes(currentUser.id)
        ? currentUser.id
        : updatedMembers[0] || null;

      return {
        ...prev,
        memberIds: updatedMembers,
        leaderId: nextLeader,
      };
    });
  };

  const handleGroupLeaderChange = (value) => {
    setGroupForm((prev) => ({
      ...prev,
      leaderId: Number(value),
    }));
  };

  // Drag and Drop handlers for group registration
  const handleDragStart = (e, student) => {
    setDraggedStudent({ id: student.id, name: student.fullName });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", student.id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroup(true);
  };

  const handleDragLeave = () => {
    setDragOverGroup(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverGroup(false);

    if (!draggedStudent) return;

    const studentId = draggedStudent.id;
    if (!groupForm.memberIds.includes(studentId)) {
      handleToggleGroupMember(studentId);
    }
    setDraggedStudent(null);
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
    setDragOverGroup(false);
  };

  const handleSubmitGroupRegistration = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      return;
    }
    const minMembers = groupSettings?.minMembers ?? 1;
    if (groupForm.memberIds.length < minMembers) {
      toast.error(`Nhóm cần ít nhất ${minMembers} thành viên.`);
      return;
    }
    if (!groupForm.leaderId) {
      toast.error("Vui lòng chọn nhóm trưởng.");
      return;
    }
    const classId = currentClass?.id || currentClass?.classGroupId;
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp để đăng ký.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập.");
      return;
    }

    setGroupSubmitting(true);
    try {
      await activityParticipantService.registerGroup(
        {
          activityId: Number(params.id),
          leaderId: groupForm.leaderId,
          memberIds: groupForm.memberIds,
          classGroupId: classId,
          groupName: groupForm.groupName?.trim() || undefined,
          requestedByUserId: currentUser.id,
        },
        token
      );
      toast.showSuccess("Đăng ký nhóm thành công!");
      setIsGroupDialogOpen(false);
      setGroupForm({ groupName: "", memberIds: [], leaderId: null });
      fetchActivity();
    } catch (err) {
      toast.error(err?.message || "Không thể đăng ký nhóm.");
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleToggleSportMember = (studentId) => {
    setSelectedSportMembers((prev) => {
      const alreadySelected = prev.includes(studentId);
      const currentSport = activity?.sports?.find(
        (sport) => sport.id === Number(selectedSportId)
      );
      const maxMembers = currentSport?.maxMembers;

      if (!alreadySelected) {
        if (maxMembers && prev.length + 1 > maxMembers) {
          toast.error(`Mỗi môn chỉ được tối đa ${maxMembers} thành viên.`);
          return prev;
        }
        return [...prev, studentId];
      }

      return prev.filter((id) => id !== studentId);
    });
  };

  const handleSubmitSportRegistration = async () => {
    if (!selectedSportId) {
      toast.error("Vui lòng chọn môn thi đấu.");
      return;
    }
    if (!selectedSportMembers.length) {
      toast.error("Vui lòng chọn ít nhất một học sinh.");
      return;
    }
    await ensureClassData();
    const classId = currentClass?.id || currentClass?.classGroupId;
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp để đăng ký.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập.");
      return;
    }

    setSportSubmitting(true);
    try {
      await activityParticipantService.registerSport(
        {
          activityId: Number(params.id),
          sportId: Number(selectedSportId),
          classGroupId: classId,
          memberIds: selectedSportMembers,
          requestedByUserId: currentUser?.id,
        },
        token
      );
      toast.showSuccess("Đăng ký hội thao thành công!");
      setSelectedSportMembers([]);
      fetchActivity();
    } catch (err) {
      toast.error(err?.message || "Không thể đăng ký môn thi đấu.");
    } finally {
      setSportSubmitting(false);
    }
  };

  useEffect(() => {
    setSelectedSportMembers([]);
  }, [selectedSportId]);

  const userSimpleParticipation = useMemo(() => {
    if (!activity?.participants || !currentUser?.id) return null;
    return activity.participants.find(
      (participant) =>
        participant.userId === currentUser.id &&
        !participant.groupCode &&
        !participant.sportId &&
        !participant.isDeleted
    );
  }, [activity?.participants, currentUser?.id]);

  const userGroupParticipation = useMemo(() => {
    if (!activity?.participants || !currentUser?.id) return null;
    return activity.participants.find(
      (participant) =>
        participant.userId === currentUser.id &&
        participant.groupCode &&
        !participant.sportId &&
        !participant.isDeleted
    );
  }, [activity?.participants, currentUser?.id]);

  const userSportParticipation = useMemo(() => {
    if (!activity?.participants || !currentUser?.id) return [];
    return activity.participants.filter(
      (participant) =>
        participant.userId === currentUser.id &&
        participant.sportId &&
        !participant.isDeleted
    );
  }, [activity?.participants, currentUser?.id]);

  useEffect(() => {
    setIsRegistered(
      Boolean(
        userSimpleParticipation ||
          userGroupParticipation ||
          userSportParticipation.length > 0
      )
    );
  }, [userSimpleParticipation, userGroupParticipation, userSportParticipation]);

  const handleAction = (action) => {
    if (isPreview) {
      toast.showWarning(
        "Bạn đang ở chế độ xem trước, không thể thực hiện hành động này."
      );
      return;
    }
    action();
  };

  const handleRegister = async () => {
    handleAction(async () => {
      // Không yêu cầu lý do cho đăng ký đơn
      if (!registrationReason.trim()) {
        setRegistrationReason("Tham gia hoạt động");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      setIsRegistering(true);
      try {
        if (!currentUser?.id) {
          toast.error(
            "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại."
          );
          return;
        }
        const response = await executeApiCall(
          activityParticipantService.registerForActivity.bind(
            activityParticipantService
          ),
          [{ activityId: parseInt(params.id), userId: currentUser.id }, token],
          { setError }
        );

        if (response?.data) {
          setIsRegistered(true);
          setRegistrationReason("");
          toast.showSuccess(
            "Đăng ký thành công! Yêu cầu đăng ký của bạn đang chờ phê duyệt."
          );
          fetchActivity();
        }
      } catch (err) {
        toast.error(err?.message || "Có lỗi xảy ra khi đăng ký");
      } finally {
        setIsRegistering(false);
      }
    });
  };

  const handleCancelRegister = async () => {
    handleAction(async () => {
      if (!activity?.id) {
        toast.error("Không tìm thấy thông tin hoạt động");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      setIsCancelling(true);
      try {
        await executeApiCall(
          activityParticipantService.cancelRegistration.bind(
            activityParticipantService
          ),
          [activity.id, token],
          { setError }
        );

        setIsRegistered(false);
        toast.showSuccess("Đã hủy đăng ký tham gia hoạt động.");
        fetchActivity();
      } catch (err) {
        toast.error(err?.message || "Có lỗi xảy ra khi hủy đăng ký");
      } finally {
        setIsCancelling(false);
      }
    });
  };

  // Helper để parse date string từ API
  // API trả về date string đã là VN time (không phải UTC)
  // Ví dụ: "2025-12-15T00:00:00" → parse như local time (VN time)
  const parseDateFromAPI = useCallback((dateStr) => {
    if (!dateStr) return null;

    // API trả về date string không có timezone, nhưng đã là VN time rồi
    // Parse như local time (không thêm 'Z' vì không phải UTC)
    // Ví dụ: "2025-12-15T00:00:00" → parse như local timezone (VN)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }, []);

  // Kiểm tra có thể đăng ký hay không (trong thời hạn đăng ký)
  // Logic: now (VN time) >= registerDate (VN time) && now (VN time) <= endRegisterDate (VN time)
  // API trả về date string đã là VN time rồi, không cần convert thêm
  const isRegistrationOpen = useMemo(() => {
    if (!activity?.endRegisterDate) {
      return true; // Nếu không có end date, cho phép đăng ký
    }

    const nowUTC = new Date();
    const nowVN = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // Convert now sang VN time

    // API trả về date string đã là VN time rồi, parse trực tiếp (không convert thêm)
    const registerDateVN = activity?.registerDate
      ? parseDateFromAPI(activity.registerDate)
      : null;
    const endRegisterDateVN = parseDateFromAPI(activity.endRegisterDate);

    if (!endRegisterDateVN) {
      return true;
    }

    // Nếu có registerDate, phải >= registerDate (so sánh trong VN time)
    if (registerDateVN && nowVN < registerDateVN) {
      return false;
    }

    // Phải <= endRegisterDate (so sánh trong VN time)
    const isOpen = nowVN <= endRegisterDateVN;
    return isOpen;
  }, [activity?.registerDate, activity?.endRegisterDate, parseDateFromAPI]);

  // Kiểm tra có thể hủy đăng ký không (trước thời hạn đăng ký)
  // Logic: now (VN time) <= endRegisterDate (VN time) - có thể hủy trước khi hết hạn đăng ký
  // API trả về date string đã là VN time rồi, không cần convert thêm
  const canCancelRegistration = useMemo(() => {
    if (!activity?.endRegisterDate || !isRegistered) {
      return false;
    }
    const nowUTC = new Date();
    const nowVN = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // Convert now sang VN time

    // API trả về date string đã là VN time rồi, parse trực tiếp (không convert thêm)
    const endRegisterDateVN = parseDateFromAPI(activity.endRegisterDate);
    if (!endRegisterDateVN) return false;

    // Có thể hủy nếu hiện tại <= endRegisterDate (so sánh trong VN time)
    const canCancel = nowVN <= endRegisterDateVN;
    return canCancel;
  }, [activity?.endRegisterDate, isRegistered, parseDateFromAPI]);

  const handleShare = () => {
    handleAction(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.showSuccess("Đã sao chép link hoạt động vào clipboard.");
    });
  };

  const handleMessage = () => {
    handleAction(() => {
      toast.showInfo("Tính năng gửi tin nhắn sẽ được mở sớm.");
    });
  };

  const renderSimpleRegistration = () => {
    if (isRegistered) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã đăng ký tham gia</span>
          </div>
          {canCancelRegistration && (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              disabled={isPreview || isCancelling}
              onClick={handleCancelRegister}
            >
              {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          )}
          {!canCancelRegistration && (
            <p className="text-sm text-gray-500 text-center">
              Đã hết thời hạn hủy đăng ký
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {!isRegistrationOpen && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Đã hết thời hạn đăng ký
            </p>
          </div>
        )}
        {!canRegister && isRegistrationOpen && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" ||
              currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full btn-primary"
              disabled={isPreview || !canRegister}
            >
              Đăng ký tham gia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đăng ký tham gia hoạt động</DialogTitle>
              <DialogDescription>
                Vui lòng cho biết lý do bạn muốn tham gia hoạt động này
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do tham gia</Label>
                <Textarea
                  id="reason"
                  placeholder="Ví dụ: Tôi muốn rèn luyện sức khỏe và giao lưu với bạn bè..."
                  value={registrationReason}
                  onChange={(e) => setRegistrationReason(e.target.value)}
                  rows={4}
                  disabled={isPreview}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={isRegistering}>
                Hủy
              </Button>
              <Button
                onClick={handleRegister}
                className="btn-primary"
                disabled={isPreview || isRegistering || !canRegister}
              >
                {isRegistering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderGroupRegistration = () => {
    const minMembers = groupSettings?.minMembers ?? 1;
    const maxMembers = groupSettings?.maxMembers;

    if (userGroupParticipation) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã đăng ký tham gia theo nhóm</span>
          </div>
          {canCancelRegistration && (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              disabled={isPreview || isCancelling}
              onClick={handleCancelRegister}
            >
              {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          )}
          {!canCancelRegistration && (
            <p className="text-sm text-gray-500 text-center">
              Đã hết thời hạn hủy đăng ký
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {!isRegistrationOpen && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Đã hết thời hạn đăng ký
            </p>
          </div>
        )}
        {!canRegister && isRegistrationOpen && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" ||
              currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}
        <Button
          className="w-full btn-primary"
          disabled={isPreview || !canRegister}
          onClick={handleOpenGroupDialog}
        >
          Đăng ký theo nhóm
        </Button>
        <p className="text-sm text-gray-600 text-center">
          Nhóm tối thiểu {minMembers}
          {maxMembers ? ` - tối đa ${maxMembers}` : ""} thành viên, cần chỉ định
          nhóm trưởng.
        </p>
      </div>
    );
  };

  const renderCreativeContestRegistration = () => {
    const minMembers = groupSettings?.minMembers ?? 1;
    const maxMembers = groupSettings?.maxMembers;

    if (
      userGroupParticipation ||
      (minMembers === 1 && userSimpleParticipation)
    ) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã đăng ký tham gia</span>
          </div>
          {canCancelRegistration && (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              disabled={isPreview || isCancelling}
              onClick={handleCancelRegister}
            >
              {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          )}
          {!canCancelRegistration && (
            <p className="text-sm text-gray-500 text-center">
              Đã hết thời hạn hủy đăng ký
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {!isRegistrationOpen && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Đã hết thời hạn đăng ký
            </p>
          </div>
        )}
        {!canRegister && isRegistrationOpen && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" ||
              currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}

        {/* Thông báo về số thành viên tối thiểu */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            Sự kiện này yêu cầu tối thiểu {minMembers} thành viên
            {maxMembers ? ` và tối đa ${maxMembers} thành viên` : ""} mỗi nhóm.
          </p>
        </div>

        {/* Option 1: Đăng ký đơn (chỉ khi minMembers = 1) */}
        {minMembers === 1 && (
          <div className="space-y-2">
            <Button
              className="w-full btn-primary"
              disabled={
                isPreview || !canRegister || isRegistered || isRegistering
              }
              onClick={handleRegister}
            >
              {isRegistering ? "Đang đăng ký..." : "Đăng ký cá nhân"}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Đăng ký cho bản thân
            </p>
          </div>
        )}

        {/* Option 2: Đăng ký nhóm */}
        <div className="space-y-2">
          <Button
            className="w-full btn-primary border-2 border-orange-500 bg-white text-orange-600 hover:bg-orange-50"
            disabled={isPreview || !canRegister}
            onClick={handleOpenGroupDialog}
          >
            Đăng ký theo nhóm
          </Button>
          <p className="text-xs text-gray-500 text-center">
            {minMembers === 1
              ? `Tạo nhóm từ ${minMembers}${
                  maxMembers ? ` đến ${maxMembers}` : "+"
                } thành viên`
              : `Nhóm tối thiểu ${minMembers}${
                  maxMembers ? ` - tối đa ${maxMembers}` : ""
                } thành viên`}
          </p>
        </div>
      </div>
    );
  };

  const renderSportRegistration = () => {
    const currentSport = activity?.sports?.find(
      (sport) => sport.id === Number(selectedSportId)
    );
    const hasSportRegistration = userSportParticipation.length > 0;

    if (hasSportRegistration) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã đăng ký tham gia hội thao</span>
          </div>
          {canCancelRegistration && (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              disabled={isPreview || isCancelling}
              onClick={handleCancelRegister}
            >
              {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          )}
          {!canCancelRegistration && (
            <p className="text-sm text-gray-500 text-center">
              Đã hết thời hạn hủy đăng ký
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {!isRegistrationOpen && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Đã hết thời hạn đăng ký
            </p>
          </div>
        )}
        {!canRegister && isRegistrationOpen && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" ||
              currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}
        {currentUser?.role?.toLowerCase() === "teacher" && (
          <div className="space-y-2">
            <Label>Chọn môn thi đấu</Label>
            <SimpleSelect
              value={selectedSportId}
              onValueChange={(v) => setSelectedSportId(Number(v))}
              placeholder="Chọn môn thi đấu"
              options={activity.sports.map((s) => ({
                value: String(s.id),
                label: s.name,
              }))}
            />
            {currentSport?.maxMembers && (
              <p className="text-xs text-gray-500">
                Mỗi môn tối đa {currentSport.maxMembers} thành viên.
              </p>
            )}
          </div>
        )}
        {currentUser?.role?.toLowerCase() === "teacher" && (
          <div className="space-y-2">
            <Label>Chọn học sinh của lớp</Label>

            <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
              {isClassLoading ? (
                <p className="text-sm text-gray-500">
                  Đang tải danh sách lớp...
                </p>
              ) : classStudents.length ? (
                classStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedSportMembers.includes(student.id)}
                      onCheckedChange={() =>
                        handleToggleSportMember(student.id)
                      }
                      disabled={sportSubmitting || !canRegister}
                    />
                    <span className="font-medium">{student.fullName}</span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  Chưa có danh sách lớp.{" "}
                  <button
                    className="text-orange-600 underline"
                    onClick={ensureClassData}
                  >
                    Tải lại
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <Button
          className="w-full btn-primary"
          onClick={handleSubmitSportRegistration}
          disabled={
            isPreview ||
            sportSubmitting ||
            !selectedSportId ||
            selectedSportMembers.length === 0 ||
            isClassLoading ||
            !canRegister
          }
        >
          {sportSubmitting ? "Đang đăng ký..." : "Đăng ký môn thi đấu"}
        </Button>
      </div>
    );
  };

  // Check if can submit (for CreativeContest with submission)
  const canSubmit = useMemo(() => {
    if (!activity || !submissionStatus) return false;
    if (activity.subType !== "CreativeContest") return false;
    if (!activity.submissionDeadline) return false;

    const now = new Date();
    const startDate = activity.startDate ? new Date(activity.startDate) : null;
    const deadline = activity.submissionDeadline
      ? new Date(activity.submissionDeadline)
      : null;

    if (!startDate || !deadline) return false;
    if (now < startDate) return false;
    if (now > deadline) return false;

    return submissionStatus.canSubmit === true;
  }, [activity, submissionStatus]);

  const handleOpenSubmissionDialog = () => {
    if (isPreview) {
      toast.showWarning(
        "Bạn đang ở chế độ xem trước, không thể thực hiện hành động này."
      );
      return;
    }
    setIsSubmissionDialogOpen(true);
  };

  const handleSubmitSubmission = async () => {
    if (!submissionFile) {
      toast.error("Vui lòng chọn file để nộp bài");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    if (!activity?.id) {
      toast.error("Không tìm thấy thông tin hoạt động");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload file first
      const fileUrl = await uploadFile(submissionFile);

      if (!fileUrl) {
        toast.error("Upload file thất bại. Vui lòng thử lại.");
        return;
      }

      // Create submission
      const response = await executeApiCall(
        submissionService.createSubmission.bind(submissionService),
        [activity.id, { fileUrl, title: submissionFile.name }, token],
        { setError }
      );

      if (response?.data?.data || response?.data) {
        toast.showSuccess("Nộp bài thành công!");
        setIsSubmissionDialogOpen(false);
        setSubmissionFile(null);
        // Refresh submission status
        const statusResponse = await executeApiCall(
          submissionService.getSubmissionStatus.bind(submissionService),
          [activity.id, token],
          { setError: () => {} }
        );
        const statusData = statusResponse?.data?.data || statusResponse?.data;
        if (statusData) {
          setSubmissionStatus(statusData);
        }
      }
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmitButton = () => {
    if (!isCreativeContest || !activity.submissionDeadline) return null;
    if (!isRegistered) return null; // Chỉ hiển thị nếu đã đăng ký

    const now = new Date();
    const startDate = activity.startDate ? new Date(activity.startDate) : null;
    const deadline = activity.submissionDeadline
      ? new Date(activity.submissionDeadline)
      : null;

    // Chưa đến thời gian mở đề
    if (startDate && now < startDate) return null;

    // Đã quá hạn
    if (deadline && now > deadline) {
      if (submissionStatus?.hasSubmission) {
        return (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Đã nộp bài vào{" "}
              {submissionStatus.submissionDate
                ? new Date(submissionStatus.submissionDate).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "thời điểm trước đó"}
            </p>
          </div>
        );
      }
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Đã quá hạn nộp bài</p>
        </div>
      );
    }

    // Có thể nộp bài
    if (canSubmit) {
      return (
        <Button
          className="w-full btn-primary"
          onClick={handleOpenSubmissionDialog}
          disabled={isPreview || isCheckingSubmission}
        >
          <Upload className="w-4 h-4 mr-2" />
          Nộp bài
        </Button>
      );
    }

    // Đã nộp bài rồi
    if (submissionStatus?.hasSubmission) {
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            Đã nộp bài vào{" "}
            {submissionStatus.submissionDate
              ? new Date(submissionStatus.submissionDate).toLocaleDateString(
                  "vi-VN",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "thời điểm trước đó"}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderRegisteredStatus = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Đã đăng ký tham gia</span>
      </div>

      {/* Nút Nộp bài (nếu có) */}
      {renderSubmitButton()}

      {canCancelRegistration && (
        <Button
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
          onClick={handleCancelRegister}
          disabled={isPreview || isCancelling}
        >
          {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
        </Button>
      )}
      {!canCancelRegistration && (
        <p className="text-sm text-gray-500 text-center">
          Đã hết thời hạn hủy đăng ký
        </p>
      )}
    </div>
  );

  const renderRegistrationActions = () => {
    if (isSportsFestival) {
      return renderSportRegistration();
    }
    if (isCreativeContest) {
      const registrationType = getRegistrationType(activity?.registrationSettings);
      // Nếu registrationType = "group", chỉ hiển thị đăng ký nhóm
      if (registrationType === "group") {
        return isRegistered ? renderRegisteredStatus() : renderGroupRegistration();
      }
      // Nếu registrationType = "individual", chỉ hiển thị đăng ký cá nhân
      return isRegistered ? renderRegisteredStatus() : renderSimpleRegistration();
    }
    // Hội thảo và các hoạt động khác: hiển thị đăng ký cá nhân
    return isRegistered ? renderRegisteredStatus() : renderSimpleRegistration();
  };

  // Use participants from activity data or empty array
  const participants = activity?.participants || [];
  const isCreativeContest = activity?.subType === "CreativeContest";
  const isSportsFestival = activity?.subType === "SportsFestival";
  const groupSettings = getGroupSettings(activity?.registrationSettings);
  const participantProgress =
    activity && activity.maxParticipants
      ? Math.min(
          (activity.currentParticipants / activity.maxParticipants) * 100,
          100
        )
      : 0;

  // Kiểm tra quyền đăng ký: 
  // - Giáo viên: được đăng ký hội thao và hội thảo
  // - Học sinh: được đăng ký các hoạt động ngoài hội thao (bao gồm hội thảo)
  // Và kiểm tra xem còn trong thời hạn đăng ký không
  const isSeminarWorkshop = activity?.subType === "SeminarWorkshop" || activity?.subType === "Seminar";
  const canRegister = useMemo(() => {
    // Kiểm tra thời hạn đăng ký trước
    if (!isRegistrationOpen) {
      return false;
    }

    if (!currentUser?.role || !activity) return true; // Default allow if no role info
    const userRole = currentUser.role.toLowerCase();
    const isTeacher = userRole === "teacher" || userRole === "admin";
    const isStudent = userRole === "student";

    if (isTeacher) {
      // Giáo viên được đăng ký hội thao và hội thảo
      return isSportsFestival || isSeminarWorkshop;
    }
    if (isStudent) {
      // Học sinh được đăng ký các hoạt động ngoài hội thao (bao gồm hội thảo)
      return !isSportsFestival;
    }
    return true; // Default allow for other roles
  }, [currentUser?.role, activity, isSportsFestival, isSeminarWorkshop, isRegistrationOpen]);

  const groupRegistrations = useMemo(() => {
    if (!activity?.participants) return [];
    const map = new Map();
    activity.participants
      .filter((participant) => participant.groupCode)
      .forEach((participant) => {
        const key = participant.groupCode;
        if (!map.has(key)) {
          // Sử dụng registrationMetadata (tên nhóm) thay vì groupCode
          const groupName =
            participant.registrationMetadata || `Nhóm ${map.size + 1}`;
          map.set(key, {
            code: key,
            name: groupName,
            members: [],
          });
        }
        // Format className với Grade cho member
        // Kiểm tra xem className đã có Grade ở đầu chưa (tránh duplicate như "1010A1")
        const grade = participant.grade || participant.Grade;
        const className =
          participant.classGroupName || participant.className || "Chờ kết quả";

        let formattedClassName = className;
        if (grade && className !== "Chờ kết quả") {
          // Kiểm tra xem className đã bắt đầu bằng Grade chưa
          const gradeStr = String(grade);
          if (!className.startsWith(gradeStr)) {
            formattedClassName = `${grade}${className}`;
          }
        }

        map.get(key).members.push({
          ...participant,
          className: formattedClassName,
        });
      });

    return Array.from(map.values()).map((group, index) => ({
      ...group,
      name: group.name || `Nhóm ${index + 1}`,
    }));
  }, [activity]);

  const sportRegistrations = useMemo(() => {
    if (!activity?.participants) return [];
    const map = new Map();
    activity.participants
      .filter((participant) => participant.sportId)
      .forEach((participant) => {
        const sportId = participant.sportId;
        if (!map.has(sportId)) {
          const sportMeta = activity?.sports?.find(
            (sport) => sport.id === sportId
          );
          map.set(sportId, {
            sportId,
            sportName:
              participant.sportName || sportMeta?.name || "Môn thi đấu",
            classes: new Map(),
          });
        }
        const entry = map.get(sportId);

        // Format className với Grade (giống normalizeParticipants)
        const grade = participant?.grade || participant?.Grade;
        const className =
          participant.className || participant.classGroupName || "Chờ kết quả";

        let formattedClassName = className;
        if (grade && className !== "Chờ kết quả") {
          const gradeStr = String(grade);
          if (!className.startsWith(gradeStr)) {
            formattedClassName = `${grade}${className}`;
          }
        }

        if (!entry.classes.has(formattedClassName)) {
          entry.classes.set(formattedClassName, []);
        }
        entry.classes.get(formattedClassName).push(participant);
      });

    return Array.from(map.values()).map((entry) => ({
      sportId: entry.sportId,
      sportName: entry.sportName,
      rosters: Array.from(entry.classes.entries()).map(
        ([className, members]) => ({
          className,
          members,
        })
      ),
    }));
  }, [activity]);

  // Lấy danh sách các lớp đã đăng ký tham gia hội thao (unique classNames)
  // Logic giống AISchedule: lấy tất cả participants có classGroupId, không cần sportId
  const registeredClassesForSportsFestival = useMemo(() => {
    if (!isSportsFestival || !activity?.participants) {
      return [];
    }

    // Nếu classGroups đã load xong, format trực tiếp từ classGroups (giống AISchedule)
    if (classGroups && classGroups.length > 0) {
      return classGroups
        .map((cg) => {
          const grade = cg.grade != null ? String(cg.grade) : "";
          const name = cg.name || "";
          return grade && name ? `${grade}${name}` : name || `Lớp ${cg.id}`;
        })
        .sort();
    }

    // Nếu classGroups chưa load, lấy từ participants data (fallback)
    const classGroupIds = new Set();
    activity.participants.forEach((participant) => {
      if (participant.classGroupId && !participant.isDeleted) {
        classGroupIds.add(participant.classGroupId);
      }
    });

    if (classGroupIds.size === 0) {
      return [];
    }

    // Format từ participant data
    const classSet = new Set();
    activity.participants.forEach((participant) => {
      if (participant.classGroupId && !participant.isDeleted) {
        const grade = participant?.grade || participant?.Grade;
        const className = participant.className || participant.classGroupName;
        if (className && className !== "Chờ kết quả") {
          // Kiểm tra xem đã có số ở đầu chưa (đã format)
          if (/^\d/.test(className)) {
            classSet.add(className);
          } else if (grade) {
            classSet.add(`${grade}${className}`);
          } else {
            classSet.add(className);
          }
        }
      }
    });

    return Array.from(classSet).sort();
  }, [
    isSportsFestival,
    activity?.participants,
    classGroups,
    loadingClassGroups,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <LoadingCard isLoading={true} text="Đang tải thông tin hoạt động..." />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              {error || "Không tìm thấy hoạt động"}
            </p>
            <Button onClick={() => navigate("/activities")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {isPreview && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-800">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              Bạn đang ở chế độ xem trước. Các hành động sẽ không được thực
              hiện.
            </span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cover Image */}
        <div className="relative mb-10 rounded-xl overflow-hidden">
          <img
            src={activity.thumbnail || PLACEHOLDER_IMAGE}
            alt={activity.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              if (e.target.src !== PLACEHOLDER_IMAGE) {
                e.target.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-orange-500">
                {getCategoryLabel(activity.category)}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/20 text-white border-white/30"
              >
                {getSubTypeLabel(activity.subType)}
              </Badge>
              {activity.onlyTeacherCanRegister && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/20 text-white border-white/30"
                >
                  Chỉ giáo viên
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {activity.title}
            </h1>
            <p className="text-lg opacity-90 leading-relaxed">
              {activity.organizer}
            </p>
          </div>
          <div className="absolute top-6 right-6 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={handleShare}
              disabled={isPreview}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <div ref={dropdownRef} className="relative z-50">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                disabled={isPreview}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-orange-100 bg-white shadow-xl overflow-hidden z-[9999]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropdownOpen(false);
                      handleAction(() => {
                        toast.showInfo("Tính năng báo cáo sẽ được mở sớm.");
                      });
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-orange-50 text-gray-700"
                  >
                    Báo cáo
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropdownOpen(false);
                      handleShare();
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-orange-50 text-gray-700"
                  >
                    Chia sẻ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Activity Info */}
          <div className="lg:col-span-3">
            <div className="top-6 space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    <CardTitle>Thông tin hoạt động</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thời gian</p>
                        <p className="font-semibold text-sm">
                          {activity.startDate} - {activity.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Địa điểm</p>
                        <p className="font-semibold text-sm">
                          {activity.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isSportsFestival ? (
                          <>
                            <p className="text-sm text-gray-600 mb-1">
                              Lớp đã đăng ký
                            </p>
                            {registeredClassesForSportsFestival.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {registeredClassesForSportsFestival.map(
                                  (className, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      {className}
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">
                                Chưa có lớp nào đăng ký
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              Người tham gia
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">
                                {activity.currentParticipants}/
                              </p>
                              {activity.maxParticipants &&
                              activity.maxParticipants > 0 ? (
                                <p className="font-semibold text-sm">
                                  {activity.maxParticipants}
                                </p>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                                >
                                  <Users className="w-3 h-3" />
                                  <span className="font-semibold">
                                    Không giới hạn
                                  </span>
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Đăng ký đến</p>
                        <p className="font-semibold text-sm">
                          {activity.endRegisterDate}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Phân loại
                    </h4>
                    <Badge className="bg-orange-100 text-orange-800">
                      {getCategoryLabel(activity.category)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Card */}
              <Card className="glass sticky top-6 !bg-white">
                <CardContent className="p-6 space-y-4">
                  {isSportsFestival ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {registeredClassesForSportsFestival.length} lớp
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Lớp đã đăng ký tham gia
                      </p>
                      {registeredClassesForSportsFestival.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto">
                          {registeredClassesForSportsFestival.map(
                            (className, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                              >
                                {className}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Chưa có lớp nào đăng ký
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1 flex items-center justify-center gap-1">
                        <span>{activity.currentParticipants}/</span>
                        {activity.maxParticipants &&
                        activity.maxParticipants > 0 ? (
                          <span>{activity.maxParticipants}</span>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-2xl px-2 py-1 flex items-center gap-1"
                          >
                            <Infinity className="w-5 h-5" />
                            <span className="font-semibold">
                              Không giới hạn
                            </span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Người tham gia</p>
                      {activity.maxParticipants &&
                      activity.maxParticipants > 0 ? (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${participantProgress}%`,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div className="bg-green-500 h-2 rounded-full w-full" />
                        </div>
                      )}
                    </div>
                  )}

                  {renderRegistrationActions()}

                  {/* Dialog đăng ký nhóm - dùng chung cho cả renderGroupRegistration và renderCreativeContestRegistration */}
                  <Dialog
                    open={isGroupDialogOpen}
                    onOpenChange={(open) => setIsGroupDialogOpen(open)}
                  >
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tạo nhóm tham gia</DialogTitle>
                        <DialogDescription>
                          Kéo thả hoặc click để thêm thành viên vào nhóm. Có thể
                          tìm kiếm trong lớp hoặc toàn hệ thống. Nhóm trưởng sẽ
                          đại diện nhận thông báo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="groupName">Tên nhóm (tuỳ chọn)</Label>
                          <Input
                            id="groupName"
                            placeholder="Nhập tên nhóm"
                            value={groupForm.groupName}
                            onChange={(e) =>
                              setGroupForm((prev) => ({
                                ...prev,
                                groupName: e.target.value,
                              }))
                            }
                            disabled={groupSubmitting}
                          />
                        </div>

                        {/* Layout 2 cột: Nhóm bên trái, Danh sách lớp bên phải */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Cột trái: Thành viên đã chọn */}
                          <div className="space-y-2">
                            <Label>
                              Thành viên nhóm ({groupForm.memberIds.length}
                              {groupSettings?.maxMembers
                                ? `/${groupSettings.maxMembers}`
                                : ""}
                              )
                            </Label>
                            <div
                              className={`border-2 rounded-lg p-3 min-h-[400px] max-h-[500px] overflow-y-auto transition-colors ${
                                dragOverGroup
                                  ? "border-orange-400 bg-orange-50"
                                  : "border-gray-200"
                              }`}
                              onDragOver={
                                canRegister ? handleDragOver : undefined
                              }
                              onDragLeave={
                                canRegister ? handleDragLeave : undefined
                              }
                              onDrop={canRegister ? handleDrop : undefined}
                            >
                              {groupForm.memberIds.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-gray-400">
                                  <Users className="w-12 h-12 mb-2 opacity-50" />
                                  <p className="text-sm">
                                    Kéo thả học sinh vào đây để thêm vào nhóm
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {groupForm.memberIds.map((memberId) => {
                                    // Tìm trong classStudents trước, nếu không có thì tìm trong searchedUsers
                                    let member = classStudents.find(
                                      (s) => s.id === memberId
                                    );
                                    if (!member) {
                                      member = searchedUsers.find(
                                        (s) => s.id === memberId
                                      );
                                    }
                                    const isLeader =
                                      groupForm.leaderId === memberId;
                                    return (
                                      <div
                                        key={memberId}
                                        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-gray-900 truncate">
                                              {member?.fullName ||
                                                `Thành viên #${memberId}`}
                                            </span>
                                            {isLeader && (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                Trưởng nhóm
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {member?.studentCode && (
                                              <span className="text-xs text-gray-500">
                                                Mã: {member.studentCode}
                                              </span>
                                            )}
                                            {member?.className && (
                                              <span className="text-xs text-gray-500">
                                                • Lớp: {member.className}
                                              </span>
                                            )}
                                            {member?.email && (
                                              <span className="text-xs text-gray-500">
                                                • {member.email}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                          onClick={() =>
                                            handleToggleGroupMember(memberId)
                                          }
                                          disabled={
                                            groupSubmitting ||
                                            memberId === currentUser?.id
                                          }
                                          title={
                                            memberId === currentUser?.id
                                              ? "Bạn không thể xóa chính mình khỏi nhóm"
                                              : "Xóa khỏi nhóm"
                                          }
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            {groupForm.memberIds.length > 0 && (
                              <div className="space-y-2">
                                <Label>Nhóm trưởng</Label>
                                <Select
                                  value={
                                    groupForm.leaderId
                                      ? String(groupForm.leaderId)
                                      : ""
                                  }
                                  onValueChange={handleGroupLeaderChange}
                                  disabled={groupSubmitting}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhóm trưởng" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {groupForm.memberIds.map((memberId) => {
                                      // Tìm trong classStudents trước, nếu không có thì tìm trong searchedUsers
                                      let member = classStudents.find(
                                        (s) => s.id === memberId
                                      );
                                      if (!member) {
                                        member = searchedUsers.find(
                                          (s) => s.id === memberId
                                        );
                                      }
                                      return (
                                        <SelectItem
                                          key={memberId}
                                          value={String(memberId)}
                                        >
                                          {member?.fullName ||
                                            `Thành viên #${memberId}`}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          {/* Cột phải: Danh sách lớp / Tìm kiếm user */}
                          <div className="space-y-2">
                            <Label>
                              {groupSearchQuery &&
                              groupSearchQuery.trim().length >= 2
                                ? "Tìm kiếm trong hệ thống"
                                : "Danh sách lớp"}
                            </Label>
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Tìm kiếm học sinh trong lớp hoặc hệ thống..."
                                value={groupSearchQuery}
                                onChange={(e) =>
                                  setGroupSearchQuery(e.target.value)
                                }
                                className="pl-9"
                                disabled={groupSubmitting}
                              />
                              {groupSearchQuery && (
                                <button
                                  onClick={() => {
                                    setGroupSearchQuery("");
                                    setSearchedUsers([]);
                                  }}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="border rounded-lg p-3 max-h-[500px] overflow-y-auto">
                              {/* Hiển thị kết quả tìm kiếm trong hệ thống nếu có query >= 2 ký tự */}
                              {groupSearchQuery &&
                              groupSearchQuery.trim().length >= 2 ? (
                                isSearchingUsers ? (
                                  <div className="text-center py-8">
                                    <p className="text-sm text-gray-500">
                                      Đang tìm kiếm...
                                    </p>
                                  </div>
                                ) : searchedUsers.length === 0 ? (
                                  <div className="text-center py-8">
                                    <p className="text-sm text-gray-500">
                                      Không tìm thấy người dùng nào.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {searchedUsers
                                      .filter(
                                        (user) =>
                                          !groupForm.memberIds.includes(user.id)
                                      )
                                      .map((user) => (
                                        <div
                                          key={user.id}
                                          draggable={
                                            canRegister && !groupSubmitting
                                          }
                                          onDragStart={
                                            canRegister && !groupSubmitting
                                              ? (e) => handleDragStart(e, user)
                                              : undefined
                                          }
                                          onDragEnd={
                                            canRegister
                                              ? handleDragEnd
                                              : undefined
                                          }
                                          onClick={
                                            canRegister && !groupSubmitting
                                              ? () =>
                                                  handleToggleGroupMember(
                                                    user.id
                                                  )
                                              : undefined
                                          }
                                          className={`flex items-center gap-3 p-3 transition-colors rounded-lg border ${
                                            canRegister && !groupSubmitting
                                              ? "hover:bg-orange-50 hover:border-orange-200 cursor-move bg-white"
                                              : "opacity-60 cursor-not-allowed bg-gray-50"
                                          }`}
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {user.fullName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                              {user.studentCode && (
                                                <span className="text-xs text-gray-500">
                                                  Mã: {user.studentCode}
                                                </span>
                                              )}
                                              {user.className && (
                                                <span className="text-xs text-gray-500">
                                                  • Lớp: {user.className}
                                                </span>
                                              )}
                                              {user.email && (
                                                <span className="text-xs text-gray-500">
                                                  • {user.email}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )
                              ) : /* Hiển thị danh sách lớp khi không có query hoặc query < 2 ký tự */
                              isClassLoading ? (
                                <div className="text-center py-8">
                                  <p className="text-sm text-gray-500">
                                    Đang tải danh sách lớp...
                                  </p>
                                </div>
                              ) : classStudents.length === 0 ? (
                                <div className="text-center py-8">
                                  <p className="text-sm text-gray-500">
                                    Chưa có danh sách lớp.
                                  </p>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={ensureClassData}
                                    className="mt-2"
                                  >
                                    Tải lại
                                  </Button>
                                </div>
                              ) : (
                                (() => {
                                  const filteredStudents = classStudents.filter(
                                    (student) =>
                                      !groupSearchQuery ||
                                      student.fullName
                                        ?.toLowerCase()
                                        .includes(
                                          groupSearchQuery.toLowerCase()
                                        ) ||
                                      student.studentCode
                                        ?.toLowerCase()
                                        .includes(
                                          groupSearchQuery.toLowerCase()
                                        )
                                  );
                                  const availableStudents =
                                    filteredStudents.filter(
                                      (s) => !groupForm.memberIds.includes(s.id)
                                    );

                                  if (availableStudents.length === 0) {
                                    return (
                                      <div className="text-center py-8">
                                        <p className="text-sm text-gray-500">
                                          {groupSearchQuery
                                            ? "Không tìm thấy học sinh phù hợp trong lớp."
                                            : "Tất cả học sinh đã được thêm vào nhóm."}
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="space-y-2">
                                      {availableStudents.map((student) => (
                                        <div
                                          key={student.id}
                                          draggable={
                                            canRegister && !groupSubmitting
                                          }
                                          onDragStart={
                                            canRegister && !groupSubmitting
                                              ? (e) =>
                                                  handleDragStart(e, student)
                                              : undefined
                                          }
                                          onDragEnd={
                                            canRegister
                                              ? handleDragEnd
                                              : undefined
                                          }
                                          onClick={
                                            canRegister && !groupSubmitting
                                              ? () =>
                                                  handleToggleGroupMember(
                                                    student.id
                                                  )
                                              : undefined
                                          }
                                          className={`flex items-center gap-3 p-3 transition-colors rounded-lg border ${
                                            canRegister && !groupSubmitting
                                              ? "hover:bg-orange-50 hover:border-orange-200 cursor-move bg-white"
                                              : "opacity-60 cursor-not-allowed bg-gray-50"
                                          }`}
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {student.fullName}
                                            </p>
                                            {student.studentCode && (
                                              <p className="text-xs text-gray-500">
                                                Mã: {student.studentCode}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsGroupDialogOpen(false)}
                          disabled={groupSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button
                          className="btn-primary"
                          onClick={handleSubmitGroupRegistration}
                          disabled={groupSubmitting || !canRegister}
                        >
                          {groupSubmitting ? "Đang gửi..." : "Xác nhận đăng ký"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Dialog Nộp bài */}
                  <Dialog
                    open={isSubmissionDialogOpen}
                    onOpenChange={setIsSubmissionDialogOpen}
                  >
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Nộp bài</DialogTitle>
                        <DialogDescription>
                          Chọn file bài nộp của bạn. File sẽ được lưu và gửi đến
                          ban giám khảo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>
                            File bài nộp <span className="text-red-500">*</span>
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              id="submission-file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validate file size (10MB max)
                                  const maxSize = 10 * 1024 * 1024;
                                  if (file.size > maxSize) {
                                    toast.error(
                                      "File không được vượt quá 10MB"
                                    );
                                    return;
                                  }
                                  setSubmissionFile(file);
                                }
                              }}
                            />
                            <label
                              htmlFor="submission-file"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {submissionFile
                                  ? submissionFile.name
                                  : "Chọn file để nộp bài"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Hỗ trợ: PDF, DOC, DOCX, JPG, PNG, ZIP, RAR (tối
                                đa 10MB)
                              </span>
                            </label>
                          </div>
                          {submissionFile && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <File className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {submissionFile.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  (
                                  {(submissionFile.size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                  MB)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSubmissionFile(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {activity.submissionDeadline && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Hạn cuối nộp bài:{" "}
                              {new Date(
                                activity.submissionDeadline
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsSubmissionDialogOpen(false);
                            setSubmissionFile(null);
                          }}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button
                          className="btn-primary"
                          onClick={handleSubmitSubmission}
                          disabled={isSubmitting || !submissionFile}
                        >
                          {isSubmitting ? "Đang nộp..." : "Xác nhận nộp bài"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={handleShare}
                      disabled={isPreview}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleAction(() => {
                          toast.showInfo("Tính năng yêu thích sẽ được mở sớm.");
                        });
                      }}
                      disabled={isPreview}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center Content - Tabs */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="participants">Người tham gia</TabsTrigger>
                <TabsTrigger value="timeline">Lịch trình</TabsTrigger>
                <TabsTrigger value="awards">Giải thưởng</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="glass hover-lift !bg-white/100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Giới thiệu</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700  leading-relaxed text-base">
                      {activity.description}
                    </p>
                  </CardContent>
                </Card>

                {/* SportsFestival: Môn thi đấu */}
                {isSportsFestival && activity.sportsCategories.length > 0 && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">Môn thi đấu</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        {activity.sportsCategories.map((sport, index) => {
                          const sportConfig = activity.sports?.find(
                            (s) => s.name === sport
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100"
                            >
                              <div className="flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900">
                                  {sport}
                                </span>
                              </div>
                              {sportConfig?.maxMembers && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-white"
                                >
                                  Tối đa {sportConfig.maxMembers}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {activity.competitionType && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Hình thức thi đấu:
                            </span>
                            <Badge className="bg-blue-100 text-blue-700">
                              {activity.competitionType === "Individual"
                                ? "Cá nhân"
                                : activity.competitionType === "Team"
                                ? "Đồng đội"
                                : activity.competitionType === "Mixed"
                                ? "Kết hợp"
                                : activity.competitionType}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* CreativeContest: Thông tin cuộc thi */}
                {isCreativeContest && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">
                        Thông tin cuộc thi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {activity.theme && (
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-semibold text-gray-700">
                              Chủ đề
                            </span>
                          </div>
                          <p className="text-base font-medium text-gray-900">
                            {activity.theme}
                          </p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        {activity.genre && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">
                              Loại hình sáng tạo
                            </p>
                            <p className="font-medium text-gray-900">
                              {activity.genre}
                            </p>
                          </div>
                        )}
                        {activity.paperSize && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">
                              Kích thước / Độ dài
                            </p>
                            <p className="font-medium text-gray-900">
                              {activity.paperSize}
                            </p>
                          </div>
                        )}
                        {activity.drawingMedium && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">
                              Chất liệu / Thể loại
                            </p>
                            <p className="font-medium text-gray-900">
                              {activity.drawingMedium}
                            </p>
                          </div>
                        )}
                        {activity.timeLimit && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">
                              Thời gian làm bài
                            </p>
                            <p className="font-medium text-gray-900">
                              {activity.timeLimit}
                            </p>
                          </div>
                        )}
                      </div>
                      {activity.submissionFormat && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Format nộp bài
                          </p>
                          <p className="font-medium text-gray-900">
                            {activity.submissionFormat}
                          </p>
                        </div>
                      )}
                      {/* Hiển thị loại đăng ký và cài đặt nhóm nếu có */}
                      {activity.registrationSettings && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Hình thức đăng ký
                          </p>
                          <div className="p-3 bg-blue-50 rounded-lg mb-3">
                            <p className="font-semibold text-blue-700">
                              {getRegistrationType(activity.registrationSettings) === "group" 
                                ? "Đăng ký theo nhóm" 
                                : "Đăng ký cá nhân"}
                            </p>
                          </div>
                          {getRegistrationType(activity.registrationSettings) === "group" && 
                           activity.registrationSettings?.groupRegistration && (
                            <div className="grid md:grid-cols-3 gap-3">
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Số thành viên tối thiểu
                                </p>
                                <p className="font-semibold text-orange-700">
                                  {activity.registrationSettings.groupRegistration
                                    .minMembers || 1}{" "}
                                  người
                                </p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Số thành viên tối đa
                                </p>
                                <p className="font-semibold text-orange-700">
                                  {activity.registrationSettings.groupRegistration
                                    .maxMembers
                                    ? `${activity.registrationSettings.groupRegistration.maxMembers} người`
                                    : "Không giới hạn"}
                                </p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Yêu cầu nhóm trưởng
                                </p>
                                <p className="font-semibold text-orange-700">
                                  {activity.registrationSettings.groupRegistration
                                    .requireLeader
                                    ? "Có"
                                    : "Không"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* CreativeContest: Đề bài - Chỉ hiển thị sau StartDate */}
                {isCreativeContest && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        Đề bài
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {!activity.isProblemVisible ? (
                        // Chưa đến thời gian mở đề
                        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                          <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                          <p className="text-base font-semibold text-yellow-800 mb-2">
                            Chưa tới thời gian mở đề
                          </p>
                          <p className="text-sm text-yellow-700">
                            Đề thi sẽ được mở vào{" "}
                            <span className="font-semibold">
                              {activity.startDate
                                ? new Date(
                                    activity.startDate
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "thời điểm bắt đầu hoạt động"}
                            </span>
                            . Bạn vui lòng quay lại sau.
                          </p>
                        </div>
                      ) : (
                        // Đã đến thời gian mở đề - hiển thị đầy đủ
                        <>
                          {activity.problemText && (
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  Nội dung đề bài
                                </span>
                              </div>
                              <div className="prose max-w-none">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                  {activity.problemText}
                                </p>
                              </div>
                            </div>
                          )}

                          {activity.problemFileUrl && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Upload className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  File đề bài
                                </span>
                              </div>
                              <a
                                href={activity.problemFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                              >
                                <span>Tải file đề bài</span>
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {activity.submissionDeadline && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-semibold text-red-800">
                                  Hạn cuối nộp bài
                                </span>
                              </div>
                              <p className="text-base font-semibold text-red-900">
                                {new Date(
                                  activity.submissionDeadline
                                ).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          )}

                          {!activity.problemText &&
                            !activity.problemFileUrl && (
                              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                                Chưa có đề bài cho cuộc thi này.
                              </div>
                            )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* SeminarWorkshop: Diễn giả */}
                {(activity.subType === "SeminarWorkshop" ||
                  activity.subType === "Seminar") &&
                  activity.speakers &&
                  activity.speakers.length > 0 && (
                    <Card className="glass hover-lift !bg-white/100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          Diễn giả
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {activity.speakers.map((speaker, index) => (
                            <div
                              key={index}
                              className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              {speaker.imageUrl || speaker.image ? (
                                <img
                                  src={speaker.imageUrl || speaker.image}
                                  alt={speaker.name}
                                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ${
                                  speaker.imageUrl || speaker.image
                                    ? "hidden"
                                    : ""
                                }`}
                              >
                                <Users className="w-8 h-8 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base text-gray-900">
                                  {speaker.name || "Chưa có tên"}
                                </p>
                                {speaker.title && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {speaker.title}
                                  </p>
                                )}
                                {speaker.bio && (
                                  <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
                                    {speaker.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* SeminarWorkshop: Chương trình */}
                {(activity.subType === "SeminarWorkshop" ||
                  activity.subType === "Seminar") &&
                  activity.programs &&
                  activity.programs.length > 0 && (
                    <Card className="glass hover-lift !bg-white/100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          Chương trình
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {activity.programs
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-600">
                                    {item.time || "Chưa có giờ"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base text-gray-900">
                                    {item.title || "Chưa có tiêu đề"}
                                  </p>
                                  {item.description && (
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                <Card className="glass hover-lift !bg-white/100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Quy định tham gia</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {activity.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">
                            {rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Grading Settings */}
                {activity.gradingSettings &&
                  activity.gradingSettings.criteria &&
                  activity.gradingSettings.criteria.length > 0 && (
                    <Card className="glass hover-lift !bg-white/100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                          Cài đặt chấm điểm
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            Tiêu chí chấm điểm:
                          </p>
                          {activity.gradingSettings.criteria.map(
                            (criterion, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                              >
                                <span className="text-blue-600">•</span>
                                <span className="text-sm text-gray-700">
                                  {criterion}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Registration Settings */}
                {activity.onlyTeacherCanRegister && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Cài đặt đăng ký
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          Chỉ giáo viên chủ nhiệm mới được đăng ký đại diện lớp
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                {isCreativeContest && groupRegistrations.length > 0 && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader>
                      <CardTitle>
                        Danh sách nhóm tham gia ({groupRegistrations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {groupRegistrations.map((group, index) => (
                        <div
                          key={group.code || index}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-base">
                                {group.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {group.members.length} thành viên
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {group.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="font-medium">
                                  {member.fullName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">
                                    {member.className}
                                  </span>
                                  {member.isLeader && (
                                    <Badge className="bg-blue-100 text-blue-700">
                                      Nhóm trưởng
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {isSportsFestival && (
                  <Card className="glass hover-lift !bg-white/100">
                    <CardHeader>
                      <CardTitle>
                        Đội hình từng môn
                        {sportRostersTotalCount > 0 && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({sportRostersTotalCount} môn)
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loadingSportRosters ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            Đang tải đội hình...
                          </p>
                        </div>
                      ) : sportRosters.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            Chưa có đội hình nào.
                          </p>
                        </div>
                      ) : (
                        <>
                          {sportRosters.map((sport) => (
                            <div
                              key={sport.sportId}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <p className="font-semibold text-base">
                                  {sport.sportName}
                                </p>
                                {sport.maxMembers && (
                                  <span className="text-xs text-gray-500">
                                    Giới hạn {sport.maxMembers} người
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {sport.classes.map(
                                  (classRoster, classIndex) => (
                                    <div
                                      key={`${sport.sportId}-${classRoster.classGroupId}-${classIndex}`}
                                      className="bg-gray-50 rounded-lg p-3"
                                    >
                                      <p className="font-medium text-sm mb-2">
                                        Lớp {classRoster.classGroupName}
                                        {classRoster.memberCount > 0 && (
                                          <span className="text-xs text-gray-500 ml-2">
                                            ({classRoster.memberCount} thành
                                            viên)
                                          </span>
                                        )}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {classRoster.members.map((member) => (
                                          <Badge
                                            key={member.id}
                                            variant="outline"
                                            className="bg-white"
                                          >
                                            {member.userFullName}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Pagination Controls */}
                          {sportRostersTotalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-gray-600">
                                Trang {sportRostersPageNumber} /{" "}
                                {sportRostersTotalPages}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSportRostersPageNumber((prev) =>
                                      Math.max(1, prev - 1)
                                    )
                                  }
                                  disabled={
                                    sportRostersPageNumber === 1 ||
                                    loadingSportRosters
                                  }
                                >
                                  <ArrowLeft className="w-4 h-4 mr-1" />
                                  Trước
                                </Button>
                                <div className="flex items-center gap-1">
                                  {Array.from(
                                    {
                                      length: Math.min(
                                        5,
                                        sportRostersTotalPages
                                      ),
                                    },
                                    (_, i) => {
                                      let pageNum;
                                      if (sportRostersTotalPages <= 5) {
                                        pageNum = i + 1;
                                      } else if (sportRostersPageNumber <= 3) {
                                        pageNum = i + 1;
                                      } else if (
                                        sportRostersPageNumber >=
                                        sportRostersTotalPages - 2
                                      ) {
                                        pageNum =
                                          sportRostersTotalPages - 4 + i;
                                      } else {
                                        pageNum =
                                          sportRostersPageNumber - 2 + i;
                                      }
                                      return (
                                        <Button
                                          key={pageNum}
                                          variant={
                                            sportRostersPageNumber === pageNum
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            setSportRostersPageNumber(pageNum)
                                          }
                                          disabled={loadingSportRosters}
                                          className="min-w-[40px]"
                                        >
                                          {pageNum}
                                        </Button>
                                      );
                                    }
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSportRostersPageNumber((prev) =>
                                      Math.min(sportRostersTotalPages, prev + 1)
                                    )
                                  }
                                  disabled={
                                    sportRostersPageNumber >=
                                      sportRostersTotalPages ||
                                    loadingSportRosters
                                  }
                                >
                                  Sau
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="glass hover-lift !bg-white/100">
                  <CardHeader>
                    <CardTitle>
                      Danh sách người tham gia ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={participant.avatar || PLACEHOLDER_AVATAR}
                              />
                              <AvatarFallback>
                                {participant.fullName
                                  ? participant.fullName.charAt(0).toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {participant.fullName}
                              </p>
                              {/* <p className="text-sm text-gray-600">
                                {participant.className || "Chờ kết quả"}
                              </p> */}
                              {participant.groupCode && (
                                <p className="text-xs text-orange-600">
                                  Nhóm:{" "}
                                  {participant.registrationMetadata ||
                                    "Nhóm chưa đặt tên"}
                                </p>
                              )}
                              {participant.sportName && (
                                <p className="text-xs text-blue-600">
                                  Môn: {participant.sportName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="glass hover-lift !bg-white/100">
                  <CardHeader>
                    <CardTitle>Lịch trình hoạt động</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.timeline.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              milestone.status === "completed"
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {milestone.status === "completed" ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-sm text-gray-600">
                              {milestone.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lịch thi đấu & kết quả cho hội thao */}
                {isSportsFestival &&
                  activity.sports &&
                  activity.sports.length > 0 && (
                    <Card className="glass hover-lift !bg-white/100">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle>Lịch thi đấu & kết quả</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-xs text-gray-600">Môn</Label>
                            <SportFilterSelect
                              value={
                                selectedScheduleSportId
                                  ? String(selectedScheduleSportId)
                                  : activity.sports[0]?.id
                                  ? String(activity.sports[0].id)
                                  : ""
                              }
                              onChange={(value) =>
                                setSelectedScheduleSportId(
                                  value ? Number(value) : null
                                )
                              }
                              options={activity.sports.map((sport) => ({
                                value: String(sport.id),
                                label: sport.name,
                              }))}
                              placeholder="Chọn môn"
                            />
                            {!loadingScheduleBracket &&
                              scheduleBracket &&
                              Array.isArray(scheduleBracket.rounds) &&
                              scheduleBracket.rounds.length > 0 && (
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                      viewMode === "list"
                                        ? "bg-orange-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    Danh sách
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setViewMode("hierarchy")}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                      viewMode === "hierarchy"
                                        ? "bg-orange-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    Sơ đồ
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {loadingScheduleBracket && (
                          <p className="text-sm text-gray-500">
                            Đang tải lịch thi đấu...
                          </p>
                        )}
                        {!loadingScheduleBracket && scheduleBracketError && (
                          <p className="text-sm text-red-600">
                            {scheduleBracketError}
                          </p>
                        )}
                        {!loadingScheduleBracket &&
                          !scheduleBracket &&
                          !scheduleBracketError && (
                            <p className="text-sm text-gray-500">
                              Chưa có lịch thi đấu cho môn này. Vui lòng quay
                              lại sau khi ban tổ chức công bố lịch chính thức.
                            </p>
                          )}
                        {!loadingScheduleBracket &&
                          scheduleBracket &&
                          Array.isArray(scheduleBracket.rounds) &&
                          scheduleBracket.rounds.length > 0 && (
                            <>
                              {viewMode === "list" ? (
                                <div className="space-y-4">
                                  {scheduleBracket.rounds.map((round) => (
                                    <div
                                      key={round.roundNumber}
                                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-sm text-gray-800">
                                          {round.roundName ||
                                            `Vòng ${round.roundNumber}`}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                          {round.matches?.length || 0} trận
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {(round.matches || []).map((match) => {
                                          const isCompleted =
                                            match.status === 2;
                                          const isOngoing = match.status === 1;
                                          const hasScores =
                                            match.score1 != null &&
                                            match.score2 != null;
                                          const matchDate = match.matchDate
                                            ? new Date(match.matchDate)
                                            : null;
                                          const now = new Date();
                                          const isUpcoming =
                                            matchDate &&
                                            matchDate > now &&
                                            !isCompleted &&
                                            !isOngoing;

                                          return (
                                            <div
                                              key={match.id}
                                              className="flex flex-col md:flex-row md:items-center gap-2 p-2 bg-white rounded-md border border-gray-200"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs"
                                                    >
                                                      Trận #{match.matchNumber}
                                                    </Badge>
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                      {formatClassNameWithGrade(
                                                        match.classGroup1Name,
                                                        match.classGroup1Id
                                                      )}{" "}
                                                      vs{" "}
                                                      {formatClassNameWithGrade(
                                                        match.classGroup2Name,
                                                        match.classGroup2Id
                                                      )}
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    {match.matchDate &&
                                                      match.startTime && (
                                                        <span className="flex items-center gap-1">
                                                          <Calendar className="w-3 h-3" />
                                                          {new Date(
                                                            match.matchDate
                                                          ).toLocaleDateString(
                                                            "vi-VN",
                                                            {
                                                              day: "2-digit",
                                                              month: "2-digit",
                                                              year: "numeric",
                                                            }
                                                          )}
                                                          {" • "}
                                                          {match.startTime
                                                            ?.toString()
                                                            .slice(0, 5)}
                                                        </span>
                                                      )}
                                                    {match.location && (
                                                      <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {match.location}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="text-sm font-semibold text-gray-800">
                                                  {hasScores ? (
                                                    <>
                                                      {match.score1} -{" "}
                                                      {match.score2}
                                                    </>
                                                  ) : (
                                                    <span className="text-xs text-gray-500">
                                                      Chưa có kết quả
                                                    </span>
                                                  )}
                                                </div>
                                                <Badge
                                                  className={
                                                    isCompleted
                                                      ? "bg-green-100 text-green-700"
                                                      : isOngoing
                                                      ? "bg-blue-100 text-blue-700"
                                                      : isUpcoming
                                                      ? "bg-yellow-100 text-yellow-700"
                                                      : "bg-gray-100 text-gray-600"
                                                  }
                                                >
                                                  {isCompleted
                                                    ? "Đã kết thúc"
                                                    : isOngoing
                                                    ? "Đang diễn ra"
                                                    : isUpcoming
                                                    ? "Sắp diễn ra"
                                                    : "Chờ lịch"}
                                                </Badge>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <TournamentBracketViewer
                                  rounds={scheduleBracket.rounds}
                                  formatClassName={formatClassNameWithGrade}
                                  onMatchClick={(match) => {
                                    // Optional: handle match click
                                  }}
                                  fullScreen={false}
                                  onMaximize={() =>
                                    setIsBracketFullScreen(true)
                                  }
                                />
                              )}
                            </>
                          )}
                      </CardContent>
                    </Card>
                  )}

                {/* Full Screen Bracket Modal - Custom */}
                {isBracketFullScreen && (
                  <div
                    className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setIsBracketFullScreen(false)}
                  >
                    <div
                      className="w-full h-full max-w-[95vw] max-h-[95vh] bg-white flex flex-col rounded-lg border border-gray-200 shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                        <h2 className="text-xl font-bold">Sơ đồ giải đấu</h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsBracketFullScreen(false)}
                          className="h-8 w-8"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      {/* Bracket Content */}
                      <div className="flex-1 overflow-hidden">
                        {scheduleBracket &&
                          scheduleBracket.rounds &&
                          scheduleBracket.rounds.length > 0 && (
                            <TournamentBracketViewer
                              rounds={scheduleBracket.rounds}
                              formatClassName={formatClassNameWithGrade}
                              onMatchClick={(match) => {
                                // Optional: handle match click
                              }}
                              fullScreen={true}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="awards" className="space-y-4">
                <Card className="glass hover-lift !bg-white/100">
                  <CardHeader>
                    <CardTitle>Giải thưởng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.awards.map((award, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-orange-600" />
                            <span className="font-semibold">{award.rank}</span>
                          </div>
                          <span className="text-gray-700">{award.prize}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Organizer & Contact */}
          <div className="lg:col-span-3">
            <div className="top-6 space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Đơn vị tổ chức
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">ĐT</span>
                    </div>
                    <div>
                      <p className="font-semibold">{activity.organizer}</p>
                      <p className="text-sm text-gray-600">FPT School</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {}
              {activity.subType === "CreativeContest" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bảng xếp hạng</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Hạng</TableHead>
                          <TableHead>Học sinh</TableHead>
                          <TableHead className="text-right">Điểm</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {ranking.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className={index < 3 ? "bg-orange-50" : ""}
                          >
                            <TableCell className="font-semibold">
                              #{index + 1}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{item.userFullName}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right font-bold text-orange-600">
                              {item.score.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
