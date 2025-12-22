# Hướng dẫn Test Frontend - Statistics Report

## 1. CHUẨN BỊ

### Bước 1: Đảm bảo Backend đang chạy
```bash
cd ESP_BE/EduShpere
dotnet run
```
Backend phải chạy tại: `https://localhost:7084`

### Bước 2: Chạy Frontend
```bash
cd ESP_FE
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

### Bước 3: Kiểm tra API Config
Mở file `ESP_FE/src/config/api.config.js` và đảm bảo:
- `BASE_URL` trỏ đúng đến backend (localhost:7084 cho dev)

---

## 2. TEST UI MANUAL

### Test 1: Đăng nhập và điều hướng
1. Mở browser: `http://localhost:5173`
2. Đăng nhập với tài khoản Admin hoặc Teacher
3. Click vào menu "Thống kê" hoặc điều hướng trực tiếp: `http://localhost:5173/admin/statistics`
4. ✅ Kiểm tra page load được và hiển thị Filter Panel bên trái

### Test 2: Filter Panel - Chọn năm học
1. Trong Filter Panel, dropdown "Năm học" phải có danh sách năm học
2. Chọn một năm học (ví dụ: "2024-2025")
3. ✅ Kiểm tra năm học được chọn đúng

### Test 3: Filter Panel - Toggle các options
1. Check/uncheck từng option:
   - ☑️ Bảng điểm theo lớp (khen thưởng)
   - ☑️ Bảng điểm theo học sinh (khen thưởng)
   - ☑️ Biểu đồ xu hướng theo tuần
   - ☑️ Biểu đồ phân bố điểm
   - ☑️ Bao gồm tất cả lớp
   - ☑️ Bao gồm tất cả học sinh
2. ✅ Kiểm tra các checkbox hoạt động đúng

### Test 4: Preview - Click "Xem trước"
1. Chọn năm học
2. Click button "Xem trước"
3. ✅ Kiểm tra:
   - Loading state hiển thị
   - Sau khi load xong, preview area hiển thị data
   - Không có lỗi trong console (F12)

### Test 5: Preview - Metrics Cards
Sau khi click "Xem trước", kiểm tra 4 cards metrics:
1. ✅ Card "Tổng số lớp" - Hiển thị số đúng
2. ✅ Card "Tổng số học sinh" - Hiển thị số đúng
3. ✅ Card "Tổng điểm toàn trường" - Hiển thị số đúng (format có dấu phẩy)
4. ✅ Card "Số hoạt động trong năm" - Hiển thị số đúng

### Test 6: Preview - Charts (nếu đã chọn)
Nếu `includeWeeklyTrendCharts = true`:
1. ✅ Weekly Trend Chart hiển thị
2. ✅ Chart có 3 series: Số hoạt động, Tổng điểm, Học sinh tham gia
3. ✅ Chart có tooltip khi hover

Nếu `includeDistributionCharts = true`:
1. ✅ Class Distribution Chart hiển thị (horizontal bar)
2. ✅ Score Concentration Chart hiển thị (pie chart)
3. ✅ Participation Chart hiển thị (stacked bar)

### Test 7: Preview - Tables (nếu đã chọn)
Nếu `includeClassRewardTable = true`:
1. ✅ Bảng "Bảng điểm theo lớp" hiển thị
2. ✅ Bảng có các cột: Hạng, Lớp, GVCN, Số HS, Tổng điểm, TB/HS, % tổng điểm, Số hoạt động
3. ✅ Top 3 lớp có background màu cam nhạt
4. ✅ Dữ liệu sắp xếp theo điểm giảm dần

Nếu `includeStudentRewardTable = true`:
1. ✅ Bảng "Bảng điểm theo học sinh" hiển thị
2. ✅ Bảng có các cột: Mã HS, Họ tên, Lớp, Tổng điểm, Số hoạt động
3. ✅ Hiển thị tối đa 100 học sinh đầu tiên
4. ✅ Có message "Hiển thị 100/X học sinh đầu tiên" nếu có nhiều hơn 100

### Test 8: Export PDF
1. Chọn năm học và các options
2. Click button "PDF"
3. ✅ File download với tên: `bao-cao-thong-ke-{năm-học}.html`
4. ✅ Mở file và kiểm tra nội dung đúng

### Test 9: Export Excel
1. Chọn năm học và các options
2. Click button "Excel"
3. ✅ File download với tên: `bao-cao-thong-ke-{năm-học}.xlsx`
4. ✅ Mở file trong Excel và kiểm tra:
   - Sheet 1: "Tổng quan"
   - Sheet 2: "Điểm theo lớp"
   - Sheet 3: "Điểm theo học sinh"
   - Sheet 4: "Xu hướng theo tuần"

### Test 10: Error Handling
1. Chọn năm học không tồn tại (nếu có trong dropdown)
2. Click "Xem trước"
3. ✅ Hiển thị error message
4. ✅ Không crash app

---

## 3. TEST VỚI BROWSER DEVTOOLS

### Mở DevTools (F12)

### Tab Network:
1. Click "Xem trước"
2. ✅ Kiểm tra request:
   - Method: POST
   - URL: `/api/statistics/academic-year-report`
   - Headers có Authorization: Bearer token
   - Request body đúng format
3. ✅ Kiểm tra response:
   - Status: 200
   - Response body có đầy đủ data

### Tab Console:
1. ✅ Không có lỗi JavaScript
2. ✅ Không có warning về missing dependencies

### Tab Application/Storage:
1. ✅ Token được lưu trong localStorage
2. ✅ Token hợp lệ và chưa hết hạn

---

## 4. TEST RESPONSIVE DESIGN

### Desktop (> 1024px):
- ✅ Filter Panel bên trái (1/4 width)
- ✅ Preview bên phải (3/4 width)
- ✅ Charts hiển thị đầy đủ

### Tablet (768px - 1024px):
- ✅ Layout có thể stack hoặc điều chỉnh
- ✅ Charts vẫn hiển thị được

### Mobile (< 768px):
- ✅ Filter Panel và Preview stack vertically
- ✅ Tables có horizontal scroll
- ✅ Charts responsive

---

## 5. TEST PERFORMANCE

### Kiểm tra thời gian load:
1. Mở DevTools → Tab Network
2. Click "Xem trước"
3. ✅ Request hoàn thành trong < 3 giây (tùy dữ liệu)
4. ✅ Charts render trong < 1 giây sau khi có data

### Kiểm tra memory:
1. Mở DevTools → Tab Memory
2. Click "Xem trước" nhiều lần
3. ✅ Không có memory leak
4. ✅ Memory không tăng liên tục

---

## 6. CHECKLIST TEST

- [ ] Page load được
- [ ] Filter Panel hiển thị đúng
- [ ] Dropdown năm học có dữ liệu
- [ ] Checkboxes hoạt động
- [ ] Button "Xem trước" hoạt động
- [ ] Loading state hiển thị
- [ ] Metrics cards hiển thị đúng
- [ ] Charts hiển thị (nếu được chọn)
- [ ] Tables hiển thị (nếu được chọn)
- [ ] Export PDF hoạt động
- [ ] Export Excel hoạt động
- [ ] Error handling hoạt động
- [ ] Responsive design hoạt động
- [ ] Không có lỗi console
- [ ] Performance tốt

---

## 7. DEBUGGING

### Nếu page không load:
1. Kiểm tra console có lỗi không
2. Kiểm tra network request có thành công không
3. Kiểm tra token có hợp lệ không

### Nếu data không hiển thị:
1. Kiểm tra response từ API có đúng format không
2. Kiểm tra `reportData` state có được set không
3. Kiểm tra `requestConfig` có đúng không

### Nếu charts không hiển thị:
1. Kiểm tra `includeWeeklyTrendCharts` hoặc `includeDistributionCharts` có true không
2. Kiểm tra data trong `weeklyTrends` hoặc `scoreDistribution` có đầy đủ không
3. Kiểm tra ECharts library có load được không

### Nếu export không hoạt động:
1. Kiểm tra API endpoint có đúng không
2. Kiểm tra response có phải blob không
3. Kiểm tra browser có block download không

