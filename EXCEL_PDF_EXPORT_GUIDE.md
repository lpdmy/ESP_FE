# 📊 Hướng Dẫn Export Excel & PDF - Statistics Dashboard

## 📋 Mục Lục
1. [Excel Export Setup](#excel-export-setup)
2. [PDF Export Setup](#pdf-export-setup)
3. [Chart Types & Usage](#chart-types--usage)
4. [Data Validation (Dropdown)](#data-validation-dropdown)
5. [Checklist](#checklist)

---

## 📈 Excel Export Setup

### 1. Layout & Style

#### Font
- **Font chính**: Inter hoặc Calibri
- **Size**: 11-12pt cho body, 13-14pt cho header

#### Header Styling
```
- Background: #1e40af (Dark Blue) hoặc #6d28d9 (Dark Purple)
- Text Color: White (#FFFFFF)
- Font Weight: Bold
- Alignment: Center
- Border: Thin border all sides
```

**Cách làm:**
1. Chọn header row (row 1)
2. Right-click > Format Cells
3. Fill tab: Chọn màu #1e40af hoặc #6d28d9
4. Font tab: Chọn màu trắng, Bold
5. Alignment tab: Center horizontal

#### Body Styling
```
- Border: Thin border (#d1d5db)
- Zebra rows: Alternate row color
  - Even rows: #f9fafb (Light gray)
  - Odd rows: White
- Font: Inter/Calibri, 11pt
```

**Cách làm Zebra Rows:**
1. Chọn data range (không bao gồm header)
2. Home > Conditional Formatting > New Rule
3. Chọn "Use a formula to determine which cells to format"
4. Formula: `=MOD(ROW(),2)=0`
5. Format: Fill color #f9fafb
6. OK

#### Freeze Header
```
View > Freeze Panes > Freeze Top Row
```

#### Auto-fit Column Width
```
- Double-click right border of column header
- Hoặc: Select columns > Home > Format > AutoFit Column Width
```

---

## 📊 Chart Types & Usage

### Column Chart - So sánh số lượng theo nhóm

**Khi nào dùng:**
- So sánh số lượng giữa các nhóm
- Ví dụ: Top lớp tích cực, Top học sinh, Số sự kiện theo năm học

**Cách tạo:**
1. Chọn data range (bao gồm header)
2. Insert > Charts > Column Chart > Clustered Column
3. Format chart:
   - **Colors**: Blue (#3b82f6), Purple (#8b5cf6), Teal (#14b8a6), Gray (#6b7280)
   - **Title**: Rõ ràng, mô tả nội dung
   - **Data Labels**: Show values on bars
   - **Legend**: Right side
   - **Gridlines**: Light gray, horizontal only

**Example Data Structure:**
```
| Tên lớp        | Số sự kiện | Số người tham gia |
|----------------|------------|-------------------|
| Lớp 10A1       | 15         | 120               |
| Lớp 10A2       | 12         | 98                |
```

### Pie / Donut Chart - Tỷ lệ phần trăm

**Khi nào dùng:**
- Hiển thị tỷ lệ phần trăm
- Ví dụ: Phân loại sự kiện theo loại, Tỷ lệ trạng thái sự kiện

**Cách tạo:**
1. Chọn data range (Category + Value columns)
2. Insert > Charts > Pie Chart > 2-D Pie hoặc Donut Chart
3. Format chart:
   - **Colors**: Blue, Purple, Teal, Gray (không dùng màu gắt)
   - **Title**: Rõ ràng
   - **Data Labels**: Show percentage + category name
   - **Legend**: Right side
   - **Explode**: Có thể tách slice đầu tiên để highlight

**Example Data Structure:**
```
| Loại sự kiện      | Số lượng | Tỷ lệ (%) |
|-------------------|----------|-----------|
| CreativeContest   | 25       | 35.7%     |
| Sport             | 20       | 28.6%     |
| Seminar           | 15       | 21.4%     |
| Workshop          | 10       | 14.3%     |
```

### Line Chart - Xu hướng theo thời gian

**Khi nào dùng:**
- Hiển thị xu hướng thay đổi theo thời gian
- Ví dụ: Hoạt động theo tháng, Timeline sự kiện

**Cách tạo:**
1. Chọn data range (Time + Value columns)
2. Insert > Charts > Line Chart > Line with Markers
3. Format chart:
   - **Colors**: Blue (#3b82f6) cho line chính
   - **Title**: Rõ ràng
   - **Data Labels**: Show values on points (optional)
   - **Legend**: Right side
   - **Gridlines**: Light gray, both horizontal and vertical
   - **Line Width**: 2-3pt để nét rõ

**Example Data Structure:**
```
| Tháng/Năm  | Số sự kiện | Số người tham gia |
|------------|------------|-------------------|
| 01/2024    | 5          | 45                |
| 02/2024    | 8          | 67                |
| 03/2024    | 12         | 98                |
```

### Chart Color Palette (Ưu tiên)
```
Primary:   #3b82f6 (Blue)
Secondary: #8b5cf6 (Purple)
Tertiary:  #14b8a6 (Teal)
Neutral:   #6b7280 (Gray)
```

**Cách set màu:**
1. Right-click chart > Format Chart Area
2. Chọn data series
3. Fill & Line > Fill > Solid fill
4. Chọn màu từ palette trên

---

## 🔽 Data Validation (Dropdown)

### Yêu cầu Dropdown

#### 1. Tạo Dropdown với giá trị mặc định

**Bước 1: Tạo Named Range**
1. Chọn range chứa danh sách giá trị (ví dụ: A2:A10)
2. Formulas > Define Name
3. Name: `AcademicYearList` (hoặc tên phù hợp)
4. Refers to: Chọn range
5. OK

**Bước 2: Tạo Dropdown Cell**
1. Chọn cell cần dropdown (ví dụ: B1)
2. Data > Data Validation
3. Settings tab:
   - Allow: List
   - Source: `=AcademicYearList` hoặc nhập trực tiếp: `"-- Please select --", "2023-2024", "2024-2025"`
4. Input Message tab (optional):
   - Title: "Chọn năm học"
   - Input message: "Vui lòng chọn một năm học từ danh sách"
5. Error Alert tab:
   - Style: Warning
   - Title: "Chưa chọn giá trị"
   - Error message: "Vui lòng chọn một giá trị từ danh sách. Không được để trống."
6. OK

**Bước 3: Set giá trị mặc định**
1. Chọn cell dropdown (B1)
2. Nhập: `-- Please select --`
3. Hoặc dùng formula: `=IF(B1="", "-- Please select --", B1)`

#### 2. Xử lý lỗi khi chưa chọn (IFERROR/IF Logic)

**Ví dụ với công thức:**
```excel
=IFERROR(
  IF(B1="-- Please select --", 
     "Vui lòng chọn năm học", 
     VLOOKUP(B1, DataRange, 2, FALSE)
  ),
  "Lỗi: Vui lòng chọn giá trị hợp lệ"
)
```

**Ví dụ với SUMIF:**
```excel
=IF(B1="-- Please select --", 
   "Vui lòng chọn năm học", 
   SUMIF(DataRange, B1, SumRange)
)
```

**Ví dụ với Chart Data:**
```excel
// Trong sheet Chart Data
=IF(ValidationCell="-- Please select --", 
   "", 
   INDEX(DataRange, MATCH(ValidationCell, LookupRange, 0))
)
```

#### 3. Checklist Dropdown

- [ ] Dropdown có giá trị mặc định: "-- Please select --"
- [ ] Data Validation được set với List
- [ ] Error Alert được bật với Warning style
- [ ] Tất cả công thức có IFERROR/IF check
- [ ] Charts sử dụng IF để ẩn khi chưa chọn
- [ ] Test: Chọn giá trị → Charts cập nhật đúng
- [ ] Test: Xóa giá trị → Hiển thị cảnh báo (không crash)

---

## 📄 PDF Export Setup

### Bố cục PDF

#### Trang bìa (Cover Page)
```
- Title: Font size 36pt, Bold, Color #1e40af
- Subtitle: Font size 20pt, Color #6b7280
- Logo: Center (nếu có)
- Date: Bottom center
```

#### Header & Footer
```
Header:
- Background: #1e40af (Dark Blue)
- Text: White, Bold
- Content: "BÁO CÁO THỐNG KÊ HỆ THỐNG"
- Height: 50px

Footer:
- Background: #f3f4f6 (Light gray)
- Text: #6b7280
- Left: Date
- Right: Page number
- Height: 40px
```

#### Body Content
```
- Font: Inter hoặc Calibri
- Size: 12pt
- Line height: 1.5
- Margins: 2cm top/bottom, 1.5cm left/right
- Page break: Avoid breaking cards/charts
```

### Chart trong PDF

#### Yêu cầu Chart
```
- Nét rõ: Line width 2-3pt
- Không bị vỡ: Use high-resolution export
- Căn giữa: Center alignment
- Caption: Ngắn gọn, dưới chart
- Giải thích: 1-2 dòng mô tả
```

#### Cách Export Chart từ Excel sang PDF

**Method 1: Copy Chart as Image**
1. Right-click chart trong Excel
2. Copy
3. Paste vào Word/PowerPoint
4. Right-click > Save as Picture
5. Format: PNG (high resolution)
6. Insert vào PDF

**Method 2: Export Chart trực tiếp**
1. Right-click chart trong Excel
2. Save as Picture
3. Format: PNG hoặc PDF
4. Insert vào PDF document

**Method 3: Print to PDF từ Excel**
1. File > Print
2. Settings: Print Selected Chart
3. Printer: Microsoft Print to PDF
4. Save PDF

#### Chart Caption Format
```
[Chart Title]
Caption: Mô tả ngắn gọn về biểu đồ (1-2 dòng)
Giải thích: Ý nghĩa và insights từ biểu đồ
```

**Example:**
```
Phân loại sự kiện theo loại
Caption: Biểu đồ tròn thể hiện tỷ lệ phần trăm các loại sự kiện trong hệ thống.
Giải thích: CreativeContest chiếm tỷ lệ cao nhất (35.7%), tiếp theo là Sport (28.6%).
```

### Style PDF

#### Colors
```
- Background: White (#FFFFFF)
- Accent: #1e40af (Dark Blue) - đồng bộ với Excel
- Text: #1f2937 (Dark gray)
- Secondary: #6b7280 (Gray)
```

#### Spacing
```
- Card padding: 20px
- Card margin: 20px bottom
- Chart margin: 25px top/bottom
- Table margin: 30px bottom
```

#### Page Breaks
```
- Avoid breaking: Cards, Charts, Tables
- CSS: page-break-inside: avoid
```

---

## ✅ Checklist Hoàn Chỉnh

### Excel File
- [ ] Font: Inter hoặc Calibri
- [ ] Header: Nền xanh đậm/tím đậm, chữ trắng, in đậm
- [ ] Body: Kẻ bảng mỏng, zebra rows
- [ ] Freeze header row
- [ ] Auto-fit column width
- [ ] Column Chart: So sánh số lượng theo nhóm
- [ ] Pie/Donut Chart: Tỷ lệ phần trăm
- [ ] Line Chart: Xu hướng theo thời gian
- [ ] Chart colors: Blue, Purple, Teal, Gray (không gắt)
- [ ] Chart title rõ ràng
- [ ] Chart có label %
- [ ] Chart có legend bên phải
- [ ] Dropdown có "-- Please select --"
- [ ] Dropdown không cho phép để trống
- [ ] Công thức có IFERROR/IF check
- [ ] Charts cập nhật đúng khi chọn dropdown

### PDF File
- [ ] Trang bìa: Title, Subtitle, Logo (nếu có)
- [ ] Header: Tên báo cáo
- [ ] Footer: Page number + Date
- [ ] Chart nét rõ, không vỡ, căn giữa
- [ ] Mỗi chart có caption ngắn
- [ ] Mỗi chart có giải thích 1-2 dòng
- [ ] Background trắng
- [ ] Accent color đồng bộ với Excel
- [ ] Khoảng trắng hợp lý

---

## 🎯 Gợi ý Export từ Excel sang PDF

### Cách 1: Print to PDF (Recommended)
1. File > Print
2. Printer: Microsoft Print to PDF
3. Settings:
   - Orientation: Portrait (hoặc Landscape tùy chart)
   - Margins: Normal
   - Scale: Fit to page
4. Print > Save PDF

### Cách 2: Save as PDF
1. File > Save As
2. File type: PDF
3. Options:
   - Include: Entire workbook hoặc Selected sheets
   - Optimize for: Standard (publishing online and printing)
4. Save

### Cách 3: Export Charts riêng
1. Right-click từng chart
2. Save as Picture
3. Format: PNG (high resolution)
4. Insert vào PDF document

### Tips để không bị vỡ layout
- ✅ Sử dụng Print Area để chọn vùng cần in
- ✅ Set Page Break để control layout
- ✅ Use "Fit to Page" để tự động scale
- ✅ Export charts riêng nếu quá phức tạp
- ✅ Test print preview trước khi export

---

## 📝 Notes

- File Excel được tạo tự động với cấu trúc sẵn
- Sheet "Hướng dẫn" chứa instructions chi tiết
- Sheet "Chart Data" chứa data đã format sẵn cho charts
- PDF được generate với cover page, header, footer tự động
- Charts trong PDF được convert thành placeholders với captions

---

**Last Updated:** ${new Date().toLocaleDateString("vi-VN")}


