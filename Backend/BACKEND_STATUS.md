# Backend Status Report

## 📊 Tổng quan

Backend hiện tại đang sử dụng **Flask (Python)** và đã được cấu hình để kết nối với **Azure SQL Server**.

## 🔌 Kết nối Database

### ✅ Đã cấu hình
- **Server**: `lms-hcmut.database.windows.net`
- **Database**: `lms_system`
- **User**: `sManager`
- **Port**: `1433`
- **Driver**: `pymssql`

### 📁 File cấu hình
- `Backend/server/.env` - Chứa thông tin kết nối Azure SQL
- `Backend/server/config/database.py` - Module kết nối database
- `Backend/server/test_connection.py` - Script test kết nối

## 🛠️ API Endpoints đã implement

### 1. Authentication (`/api/auth`)
- ✅ `POST /api/auth/login` - Đăng nhập
- ✅ `POST /api/auth/logout` - Đăng xuất
- ✅ `GET /api/auth/me` - Lấy thông tin user hiện tại

### 2. Users (`/api/users`)
- ✅ `GET /api/users` - Lấy danh sách users
- ✅ `GET /api/users/<id>` - Lấy thông tin user
- ✅ `POST /api/users` - Tạo user mới
- ✅ `PUT /api/users/<id>` - Cập nhật user
- ✅ `DELETE /api/users/<id>` - Xóa user

### 3. Courses (`/api/courses`)
- ✅ `GET /api/courses` - Lấy danh sách courses
- ✅ `GET /api/courses/<id>` - Lấy thông tin course
- ✅ `GET /api/courses/<id>/sections` - Lấy sections của course
- ✅ `GET /api/courses/<id>/sections/<section_id>` - Lấy thông tin section

### 4. Assignments (`/api/assignments`)
- ⚠️ `GET /api/assignments/user/<user_id>` - **Chưa implement** (chỉ có placeholder)
- ⚠️ `GET /api/assignments/<id>` - **Chưa implement** (chỉ có placeholder)
- ⚠️ `POST /api/assignments/<id>/submit` - **Chưa implement** (chỉ có placeholder)

### 5. Quizzes (`/api/quizzes`)
- ⚠️ `GET /api/quizzes/user/<user_id>` - **Chưa implement** (chỉ có placeholder)
- ⚠️ `GET /api/quizzes/<id>` - **Chưa implement** (chỉ có placeholder)

### 6. Students (`/api/students`)
- ✅ `GET /api/students/<id>/courses` - Lấy courses của student

### 7. Grades (`/api/grades`)
- ✅ Có blueprint nhưng cần kiểm tra implementation

### 8. Schedule (`/api/schedule`)
- ✅ Có blueprint và đã query từ database

## ⚠️ Vấn đề đã phát hiện và sửa

### 1. **Schema không khớp với Database** ✅ ĐÃ SỬA

#### Bảng `Course`:
- **Schema thực tế** (từ `script.sql`):
  - `Course_ID` (nvarchar(15))
  - `Name` (nvarchar(100))
  - `Credit` (int)
  - `Start_Date` (date)

- **Code đã sửa** (trong `routes/courses.py`):
  - ✅ `course.Name` (đúng)
  - ✅ `course.Credit` (đúng)
  - ✅ `course.Start_Date` (đúng)

#### Bảng `Section`:
- **Schema thực tế**:
  - `Section_ID` (nvarchar(10))
  - `Course_ID` (nvarchar(15))
  - `Semester` (nvarchar(10))

- **Code đã sửa**:
  - ✅ `section.Semester` (đúng, không còn `Semester_ID`, `Year`, `Room_ID`)

#### File đã sửa:
- ✅ `routes/courses.py` - Đã sửa tất cả queries
- ✅ `routes/schedule.py` - Đã sửa query và response format

### 2. **Một số endpoints chưa implement**
- Assignments endpoints chỉ có placeholder
- Quizzes endpoints chỉ có placeholder
- Cần implement đầy đủ để sync với frontend

### 3. **Database connection**
- Code đã có cấu hình kết nối Azure SQL
- Cần test xem có kết nối được không bằng `test_connection.py`

## 📋 Các bảng đã sử dụng trong code

### ✅ Đã query:
- `[Users]` - ✅ Khớp với schema
- `[Account]` - ✅ Khớp với schema
- `[Admin]` - ✅ Khớp với schema
- `[Tutor]` - ✅ Khớp với schema
- `[Section]` - ✅ Khớp với schema

### ⚠️ Cần kiểm tra:
- `[Course]` - ❌ **Có vấn đề** (tên cột không khớp)
- `[Assignment]` - Chưa thấy query trong code
- `[Quiz]` - Chưa thấy query trong code
- `[Assessment]` - Chưa thấy query trong code
- `[Submission]` - Chưa thấy query trong code

## 🔧 Cần làm gì tiếp theo

### 1. **Sửa lỗi schema mismatch**
```python
# routes/courses.py - Cần sửa từ:
'Course_Name': course.Course_Name,  # ❌
'Credits': course.Credits,          # ❌

# Thành:
'Course_Name': course.Name,          # ✅
'Credits': course.Credit,            # ✅
```

### 2. **Implement các endpoints còn thiếu**
- Assignments: CRUD operations
- Quizzes: CRUD operations
- Grades: Query từ bảng Assessment

### 3. **Test kết nối database**
```bash
cd Backend/server
python test_connection.py
```

### 4. **Kiểm tra và sync schema**
- Đảm bảo tất cả queries match với schema trong `script.sql`
- Có thể cần tạo migration script nếu schema đã thay đổi

## 📝 Ghi chú

- Backend đã có cấu trúc tốt với Flask Blueprints
- Database connection đã được setup cho Azure SQL
- Cần fix schema mismatch trước khi deploy
- Một số endpoints quan trọng chưa được implement

