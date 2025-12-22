// StatisticsPdfReport.jsx
// Layout in PDF A4, HTML print (Puppeteer/Playwright).
// Ưu tiên dữ liệu + biểu đồ, dùng HTML semantic + table-based, không phân tích dài dòng.

import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const PRIMARY_COLOR = "#2563EB"; // Brand primary

const TEXT_STYLE = {
  fontFamily: "'Inter','Roboto','Helvetica Neue',Arial,'Noto Sans',sans-serif",
  fontSize: 11,
  color: "#111827",
};

const AXIS_TEXT_STYLE = {
  ...TEXT_STYLE,
  fontSize: 10,
  color: "#4B5563",
};

export function StatisticsPdfReport({
  dashboardStats,
  activityOverview, // hiện chưa dùng nhưng giữ để không thay đổi API
  academicYearLabel,
  generatedAt,
  reportConfig = {},
  chartImages = {},
}) {
  const schoolName = reportConfig.schoolName || "EduSphere Platform";
  const logoUrl = reportConfig.logoUrl || "";

  // ReportConfig với giá trị mặc định để layout phản ứng theo cấu hình
  const showCharts = reportConfig.showCharts !== false;
  const chartColorScheme = reportConfig.chartColorScheme || "default";
  const includeAllClasses =
    reportConfig.includeAllClasses !== false; // nếu false có thể ẩn cả section
  const includeTopStudents =
    reportConfig.includeTopStudents ?? reportConfig.showTopStudents ?? true;
  const includeNotes =
    reportConfig.includeNotes ?? reportConfig.showNotes ?? true;
  const chartHeight = reportConfig.chartHeight || 230;
  const pageOrientation = reportConfig.pageOrientation || "portrait";

  const isLandscape = pageOrientation === "landscape";

  const totalUsers = dashboardStats?.userCounts?.totalUsers ?? 0;
  const totalStudents = dashboardStats?.userCounts?.students ?? 0;
  const totalTeachers = dashboardStats?.userCounts?.teachers ?? 0;
  const totalClasses = dashboardStats?.systemCounts?.totalClasses ?? 0;
  const totalActivities = dashboardStats?.activityCounts?.totalActivities ?? 0;
  const totalPoints = dashboardStats?.totalPointsAwarded ?? 0;

  // Danh sách hiệu suất lớp: ưu tiên field chuyên dụng nếu backend có, fallback về topActiveClasses
  const classPerformance =
    dashboardStats?.classPerformance ||
    dashboardStats?.topActiveClasses ||
    [];

  const topStudents = dashboardStats?.topActiveStudents?.slice(0, 10) ?? [];

  // Tính các tỷ lệ phục vụ Executive Summary / Insights
  const totalClassPoints = classPerformance.reduce(
    (sum, cls) => sum + (cls.totalPointsAwarded || 0),
    0
  );

  const top20Count =
    classPerformance.length > 0
      ? Math.max(1, Math.round(classPerformance.length * 0.2))
      : 0;

  const top20Points = classPerformance
    .slice(0, top20Count)
    .reduce((sum, cls) => sum + (cls.totalPointsAwarded || 0), 0);

  const top20Share =
    totalClassPoints > 0 ? (top20Points / totalClassPoints) * 100 : 0;

  const avgPointsPerActivity =
    totalActivities > 0 ? totalPoints / totalActivities : 0;

  const avgActivitiesPerClass =
    totalClasses > 0 ? totalActivities / totalClasses : 0;

  const classesWithEventsZeroPoints = classPerformance.filter(
    (cls) =>
      (cls.activityCount || 0) > 0 && (cls.totalPointsAwarded || 0) === 0
  ).length;

  // Màu sắc cho biểu đồ theo chartColorScheme
  const vibrantPalette = [
    "#2563EB",
    "#16A34A",
    "#F97316",
    "#0EA5E9",
    "#A855F7",
    "#DC2626",
  ];
  const monoPalette = ["#4B5563", "#9CA3AF", "#111827"];

  const getSeriesColor = (index = 0) => {
    if (chartColorScheme === "vibrant") {
      return vibrantPalette[index % vibrantPalette.length];
    }
    if (chartColorScheme === "mono") {
      return monoPalette[index % monoPalette.length];
    }
    return PRIMARY_COLOR;
  };

  // Biểu đồ: Hoạt động theo thời gian
  const activityTimelineOption =
    dashboardStats?.activityTimeline?.length > 0
      ? {
          textStyle: TEXT_STYLE,
          tooltip: { trigger: "axis", textStyle: AXIS_TEXT_STYLE },
          grid: { left: 40, right: 20, top: 30, bottom: 40 },
          xAxis: {
            type: "category",
            data: dashboardStats.activityTimeline.map((i) => i.monthYear),
            axisLabel: AXIS_TEXT_STYLE,
          },
          yAxis: {
            type: "value",
            axisLabel: AXIS_TEXT_STYLE,
          },
          series: [
            {
              name: "Số sự kiện",
              type: "line",
              smooth: true,
              data: dashboardStats.activityTimeline.map((i) => i.activityCount),
              itemStyle: { color: getSeriesColor(0) },
              areaStyle: {
                color: PRIMARY_COLOR + "1A",
              },
            },
          ],
        }
      : null;

  // Biểu đồ: Điểm theo năm học
  const pointsByYearOption =
    dashboardStats?.pointsByAcademicYear?.length > 0
      ? {
          textStyle: TEXT_STYLE,
          tooltip: {
            trigger: "axis",
            textStyle: AXIS_TEXT_STYLE,
            formatter: (params) => {
              const p = params[0];
              return `${p.name}: ${p.value.toLocaleString("vi-VN")} điểm`;
            },
          },
          grid: { left: 40, right: 20, top: 30, bottom: 60 },
          xAxis: {
            type: "category",
            data: dashboardStats.pointsByAcademicYear.map(
              (i) => i.academicYearName
            ),
            axisLabel: {
              ...AXIS_TEXT_STYLE,
              rotate: 45,
            },
          },
          yAxis: {
            type: "value",
            axisLabel: AXIS_TEXT_STYLE,
          },
          series: [
            {
              type: "bar",
              data: dashboardStats.pointsByAcademicYear.map(
                (i) => i.totalPoints
              ),
              itemStyle: {
                color: getSeriesColor(1),
              },
            },
          ],
        }
      : null;

  // Biểu đồ: Phân bố điểm theo lớp (horizontal bar)
  const classScoreOption =
    classPerformance.length > 0
      ? {
          textStyle: TEXT_STYLE,
          tooltip: {
            trigger: "axis",
            textStyle: AXIS_TEXT_STYLE,
            formatter: (params) => {
              const p = params[0];
              return `${p.name}: ${p.value.toLocaleString("vi-VN")} điểm`;
            },
          },
          grid: { left: 80, right: 20, top: 10, bottom: 40 },
          xAxis: {
            type: "value",
            axisLabel: AXIS_TEXT_STYLE,
          },
          yAxis: {
            type: "category",
            inverse: true,
            data: classPerformance.map((c) => c.classGroupName),
            axisLabel: {
              ...AXIS_TEXT_STYLE,
              fontSize: 9,
            },
          },
          series: [
            {
              type: "bar",
              data: classPerformance.map((c, idx) => ({
                value: c.totalPointsAwarded || 0,
                itemStyle: { color: getSeriesColor(idx) },
              })),
            },
          ],
        }
      : null;

  return (
    <main
      className="mx-auto bg-white text-slate-900"
      // Kích thước A4 theo orientation, font print-safe cho tiếng Việt.
      style={{
        width: isLandscape ? "297mm" : "210mm",
        minHeight: isLandscape ? "210mm" : "297mm",
        fontFamily:
          "'Inter', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
        fontSize: "11px",
        lineHeight: 1.5,
      }}
    >
      {/* Trang 1 – Cover: tối giản, business-like */}
      <section className="print-page-break px-10 pt-16 pb-12">
        <header className="mb-12">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                {/* Logo & tên trường dùng table để canh hàng, tránh flex hack khi in */}
                <td className="align-top pr-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="ESP Logo"
                      style={{
                        width: "40mm",
                        height: "12mm",
                        objectFit: "contain",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "40mm",
                        height: "12mm",
                        border: "1px solid #e5e7eb",
                        display: "block",
                        textAlign: "center",
                        fontSize: "9px",
                        lineHeight: "12mm",
                        color: "#6b7280",
                      }}
                    >
                      LOGO
                    </div>
                  )}
                </td>
                <td className="align-top text-right text-[10px] text-slate-600">
                  <div className="font-semibold">{schoolName}</div>
                  <div>Generated by EduSphere Platform</div>
                  {generatedAt && <div>Ngày xuất: {generatedAt}</div>}
                </td>
              </tr>
            </tbody>
          </table>
        </header>

        <section className="mt-16">
          <h1 className="text-3xl font-semibold text-center">
            Báo cáo thống kê hệ thống
          </h1>
          <p className="mt-3 text-center text-sm text-slate-700">
            Năm học {academicYearLabel || "Tất cả năm học"}
          </p>
        </section>

        <section className="mt-20">
          <table className="w-full text-[11px] border border-slate-200 border-collapse">
            <tbody>
              <tr>
                <th className="w-1/3 px-3 py-2 text-left font-medium bg-slate-100 border-b border-slate-200">
                  Đơn vị
                </th>
                <td className="px-3 py-2 border-b border-slate-200">
                  {schoolName}
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 text-left font-medium bg-slate-100 border-b border-slate-200">
                  Năm học
                </th>
                <td className="px-3 py-2 border-b border-slate-200">
                  {academicYearLabel || "Tất cả năm học"}
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 text-left font-medium bg-slate-100">
                  Phạm vi
                </th>
                <td className="px-3 py-2">
                  Hoạt động, người dùng và điểm thưởng trên hệ thống ESP
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>

      {/* Mục lục: liên kết anchor đơn giản đến từng section */}
      <section className="print-page-break px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">Mục lục</h2>
          <p className="mt-2 text-[11px] text-slate-700">
            Nhấp vào từng mục trong file PDF để chuyển nhanh đến phần tương ứng.
          </p>
        </header>

        <nav>
          <ol className="list-decimal list-inside text-[11px] text-slate-800 space-y-1">
            <li>
              <a href="#kpi" className="text-blue-700">
                KPI
              </a>
            </li>
            <li>
              <a href="#charts" className="text-blue-700">
                Charts
              </a>
            </li>
            <li>
              <a href="#classes" className="text-blue-700">
                Class list
              </a>
            </li>
            <li>
              <a href="#students" className="text-blue-700">
                Top students
              </a>
            </li>
            <li>
              <a href="#notes" className="text-blue-700">
                Notes
              </a>
            </li>
          </ol>
        </nav>
      </section>

      {/* KPI chi tiết */}
      <section id="kpi" className="print-page-break px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">2. Key Metrics (KPI)</h2>
          <p className="mt-2 text-[11px] text-slate-700">
            Các chỉ số dưới đây phản ánh quy mô triển khai và mức độ tham gia
            trên hệ thống.
          </p>
        </header>

        <table className="w-full text-[11px] border border-slate-200 border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="w-[35mm] px-3 py-2 text-left font-medium border-b border-slate-200">
                KPI
              </th>
              <th className="w-[30mm] px-3 py-2 text-right font-medium border-b border-slate-200">
                Giá trị
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 border-b border-slate-200">
                Tổng người dùng
              </td>
              <td className="px-3 py-2 text-right font-semibold border-b border-slate-200">
                {totalUsers.toLocaleString("vi-VN")}
              </td>
              <td className="px-3 py-2 border-b border-slate-200">
                Học sinh: {totalStudents.toLocaleString("vi-VN")} – Giáo viên:{" "}
                {totalTeachers.toLocaleString("vi-VN")}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 border-b border-slate-200">
                Tổng lớp học
              </td>
              <td className="px-3 py-2 text-right font-semibold border-b border-slate-200">
                {totalClasses.toLocaleString("vi-VN")}
              </td>
              <td className="px-3 py-2 border-b border-slate-200">
                Số lớp đang hoạt động trong hệ thống
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 border-b border-slate-200">
                Tổng sự kiện
              </td>
              <td className="px-3 py-2 text-right font-semibold border-b border-slate-200">
                {totalActivities.toLocaleString("vi-VN")}
              </td>
              <td className="px-3 py-2 border-b border-slate-200">
                Bao gồm sự kiện đã kết thúc và đang diễn ra
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                Tổng điểm đã trao
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {totalPoints.toLocaleString("vi-VN")}
              </td>
              <td className="px-3 py-2">
                Điểm thưởng tích lũy từ các hoạt động
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Charts – Activity over time + Points by year + Class score distribution */}
      <section
        id="charts"
        className="print-page-break px-10 pt-12 pb-12"
      >
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            3. Biểu đồ thống kê
          </h2>
        </header>

        {showCharts && activityTimelineOption && (
          <figure className="mb-6">
            <div style={{ width: "100%", height: `${chartHeight}px` }}>
              <ReactECharts
                option={activityTimelineOption}
                style={{ width: "100%", height: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
            <figcaption className="mt-1 text-[10px] text-slate-700">
              Hoạt động theo thời gian – số sự kiện theo từng mốc tháng/năm.
            </figcaption>
          </figure>
        )}

        {showCharts && pointsByYearOption && (
          <figure className="mb-6">
            <div style={{ width: "100%", height: `${chartHeight}px` }}>
              <ReactECharts
                option={pointsByYearOption}
                style={{ width: "100%", height: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
            <figcaption className="mt-1 text-[10px] text-slate-700">
              Tổng điểm thưởng theo năm học – chỉ hiển thị các năm có dữ liệu.
            </figcaption>
          </figure>
        )}

        {showCharts && classScoreOption && (
          <figure>
            <div style={{ width: "100%", height: `${chartHeight + 30}px` }}>
              <ReactECharts
                option={classScoreOption}
                style={{ width: "100%", height: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
            <figcaption className="mt-1 text-[10px] text-slate-700">
              Phân bố tổng điểm theo lớp – sắp xếp giảm dần theo tổng điểm.
            </figcaption>
          </figure>
        )}
      </section>

      {/* Class Performance – danh sách tất cả lớp, cho phép ngắt trang tự do */}
      <section id="classes" className="print-page-break px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            4. Class Performance – toàn bộ lớp
          </h2>
          <p className="mt-2 text-[11px] text-slate-700">
            Bảng xếp hạng các lớp có mức độ tham gia hoạt động và điểm thưởng
            cao nhất.
          </p>
        </header>

        {includeAllClasses && classPerformance.length > 0 && (
          <table className="w-full text-[11px] border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="w-[10mm] px-3 py-2 text-left font-medium border-b border-slate-200">
                  #
                </th>
                <th className="w-[30mm] px-3 py-2 text-left font-medium border-b border-slate-200">
                  Lớp
                </th>
                <th className="w-[25mm] px-3 py-2 text-right font-medium border-b border-slate-200">
                  Số sự kiện
                </th>
                <th className="w-[30mm] px-3 py-2 text-right font-medium border-b border-slate-200">
                  Người tham gia
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200">
                  Tổng điểm
                </th>
              </tr>
            </thead>
            <tbody>
              {classPerformance.map((cls, index) => (
                <tr
                  key={cls.classGroupId ?? index}
                  // Highlight nhóm top ~20% lớp bằng màu nền nhẹ để nhấn mạnh nhưng vẫn print-safe
                  className={
                    index < top20Count
                      ? "bg-slate-100"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50"
                  }
                >
                  <td className="px-3 py-2 border-b border-slate-200">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-200">
                    {cls.classGroupName}
                  </td>
                  <td className="px-3 py-2 text-right border-b border-slate-200">
                    {cls.activityCount ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right border-b border-slate-200">
                    {cls.participantCount ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold border-b border-slate-200">
                    {(cls.totalPointsAwarded ?? 0).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Student Performance – Top 10 */}
      {includeTopStudents && topStudents.length > 0 && (
      <section id="students" className="print-page-break px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            5. Top 10 học sinh tích cực
          </h2>
          <p className="mt-2 text-[11px] text-slate-700">
            Bảng xếp hạng học sinh có tổng điểm thưởng cao nhất trong hệ thống.
          </p>
        </header>

        {topStudents.length > 0 && (
          <table className="w-full text-[11px] border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="w-[10mm] px-3 py-2 text-left font-medium border-b border-slate-200">
                  Hạng
                </th>
                <th className="w-[40mm] px-3 py-2 text-left font-medium border-b border-slate-200">
                  Họ và tên
                </th>
                <th className="w-[30mm] px-3 py-2 text-right font-medium border-b border-slate-200">
                  Số sự kiện
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200">
                  Tổng điểm
                </th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((st, index) => (
                <tr
                  key={st.userId ?? index}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-3 py-2 border-b border-slate-200">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-200">
                    {st.fullName}
                  </td>
                  <td className="px-3 py-2 text-right border-b border-slate-200">
                    {st.activityCount ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold border-b border-slate-200">
                    {(st.totalPointsAwarded ?? 0).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      )}

      {/* Notes – vài ghi chú ngắn, hoàn toàn dựa vào số liệu */}
      {includeNotes && (
      <section id="notes" className="print-page-break px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            6. Nhận xét & định hướng
          </h2>
        </header>

        <section>
          <h3 className="text-sm font-semibold">Ghi chú</h3>
          <ul className="mt-2 list-disc list-inside text-[11px] text-slate-700">
            <li>
              Khoảng {top20Share.toFixed(1)}% tổng điểm đến từ khoảng{" "}
              {top20Count} lớp có điểm cao nhất.
            </li>
            <li>Trung bình mỗi lớp tham gia {avgActivitiesPerClass.toFixed(1)} sự kiện.</li>
            {classesWithEventsZeroPoints > 0 && (
              <li>
                Có {classesWithEventsZeroPoints} lớp có sự kiện nhưng tổng điểm
                đang bằng 0.
              </li>
            )}
          </ul>
        </section>
      </section>
      )}

      {/* Trang 8 – Thông tin báo cáo cuối */}
      <section className="px-10 pt-12 pb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">7. Thông tin báo cáo</h2>
        </header>

        <section>
          <table className="w-full text-[11px] border border-slate-200 border-collapse">
            <tbody>
              <tr>
                <th className="w-[35mm] px-3 py-2 text-left font-medium bg-slate-100 border-b border-slate-200">
                  Hệ thống
                </th>
                <td className="px-3 py-2 border-b border-slate-200">
                  EduSphere Student Participation (ESP)
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 text-left font-medium bg-slate-100 border-b border-slate-200">
                  Đơn vị sử dụng
                </th>
                <td className="px-3 py-2 border-b border-slate-200">
                  {schoolName}
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 text-left font-medium bg-slate-100">
                  Ghi chú
                </th>
                <td className="px-3 py-2">
                  Báo cáo được sinh tự động từ dữ liệu hệ thống tại thời điểm{" "}
                  {generatedAt || "xuất báo cáo"}. Khi in PDF, nên chọn khổ giấy
                  A4, hướng dọc, không scale để giữ đúng bố cục.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}




