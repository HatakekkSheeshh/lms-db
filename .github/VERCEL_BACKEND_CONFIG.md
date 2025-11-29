# 🔗 Hướng dẫn Cấu hình Vercel trỏ đến Backend Azure

## ❓ Vercel có tự trỏ đến backend không?

**Không**, Vercel không tự động trỏ đến backend. Bạn cần **cấu hình thủ công** environment variable trong Vercel.

## 🔍 Cách Frontend kết nối với Backend

Frontend sử dụng environment variable `VITE_API_BASE_URL` để biết backend ở đâu:

```typescript
// Frontend/src/lib/api/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
```

- **Development**: `http://localhost:3001/api` (mặc định)
- **Production**: Cần set `VITE_API_BASE_URL` trong Vercel

## ✅ Các bước cấu hình Vercel

### Bước 1: Lấy URL của Azure App Service

1. Vào Azure Portal → **App Services** → `hcmut-lms-deploy`
2. Vào **Overview**
3. Copy **URL** (ví dụ: `https://hcmut-lms-deploy.azurewebsites.net`)
4. URL backend API sẽ là: `https://hcmut-lms-deploy.azurewebsites.net/api`

### Bước 2: Thêm Environment Variable trong Vercel

1. Vào Vercel Dashboard: `https://vercel.com/dashboard`
2. Chọn project của bạn (LMS Frontend)
3. Vào **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Điền:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://hcmut-lms-deploy.azurewebsites.net/api`
   - **Environment**: Chọn:
     - ✅ **Production** (cho production)
     - ✅ **Preview** (cho preview deployments)
     - ✅ **Development** (nếu cần)
6. Click **"Save"**

### Bước 3: Redeploy Frontend

Sau khi thêm environment variable:

1. Vào **Deployments** tab
2. Click **"..."** (3 chấm) trên deployment mới nhất
3. Click **"Redeploy"**
4. Hoặc push code mới lên GitHub → Vercel sẽ tự động deploy

## 🔧 Cấu hình trong Vercel Dashboard

**Cách 1: Qua Web UI (Khuyến nghị)**

1. Vercel Dashboard → Project → **Settings**
2. **Environment Variables** → **Add New**
3. Thêm:
   ```
   VITE_API_BASE_URL=https://hcmut-lms-deploy.azurewebsites.net/api
   ```

**Cách 2: Qua Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variable
vercel env add VITE_API_BASE_URL production
# Nhập: https://hcmut-lms-deploy.azurewebsites.net/api
```

## ⚠️ Lưu ý quan trọng

### 1. CORS Configuration

Backend cần cho phép requests từ Vercel domain:

1. Vào Azure App Service → **API** → **CORS**
2. Thêm domain Vercel:
   - `https://your-app.vercel.app`
   - Hoặc `https://*.vercel.app` (cho tất cả Vercel preview deployments)
3. Click **"Save"**

### 2. HTTPS

- ✅ Backend Azure App Service đã có HTTPS mặc định
- ✅ Vercel cũng dùng HTTPS
- ✅ Không cần cấu hình thêm

### 3. Environment Variables trong Vercel

- **Production**: Dùng cho domain chính
- **Preview**: Dùng cho preview deployments (mỗi PR)
- **Development**: Dùng cho local development (nếu cần)

**Khuyến nghị**: Set cho cả **Production** và **Preview**

## 📝 Ví dụ cấu hình

### Trong Vercel Dashboard:

```
Environment Variables:
┌─────────────────────┬─────────────────────────────────────────────┬─────────────┐
│ Name                │ Value                                      │ Environment │
├─────────────────────┼─────────────────────────────────────────────┼─────────────┤
│ VITE_API_BASE_URL   │ https://hcmut-lms-deploy.azurewebsites.net │ Production  │
│                     │ /api                                       │ Preview     │
└─────────────────────┴─────────────────────────────────────────────┴─────────────┘
```

### Sau khi deploy:

Frontend sẽ gọi API đến:
```
https://hcmut-lms-deploy.azurewebsites.net/api/auth/login
https://hcmut-lms-deploy.azurewebsites.net/api/users
...
```

## 🔍 Kiểm tra cấu hình

### 1. Kiểm tra Environment Variable

1. Vào Vercel → Project → **Settings** → **Environment Variables**
2. Xem `VITE_API_BASE_URL` đã có chưa
3. Kiểm tra giá trị có đúng không

### 2. Kiểm tra trong Browser

1. Deploy frontend lên Vercel
2. Mở browser → Developer Tools → **Console**
3. Gõ:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```
4. Xem output có đúng URL backend không

### 3. Test API Call

1. Mở frontend trên Vercel
2. Thử login hoặc gọi API
3. Xem Network tab trong Developer Tools
4. Kiểm tra request có gửi đến đúng backend URL không

## 🚨 Troubleshooting

### Lỗi: CORS Error

**Triệu chứng:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Giải pháp:**
1. Vào Azure App Service → **API** → **CORS**
2. Thêm domain Vercel vào allowed origins
3. Click **"Save"**
4. Restart App Service

### Lỗi: 404 Not Found

**Triệu chứng:**
```
GET https://hcmut-lms-deploy.azurewebsites.net/api/health 404
```

**Giải pháp:**
1. Kiểm tra URL backend có đúng không
2. Kiểm tra backend có đang chạy không
3. Test trực tiếp: `https://hcmut-lms-deploy.azurewebsites.net/api/health`

### Lỗi: Environment Variable không áp dụng

**Triệu chứng:**
Frontend vẫn gọi `http://localhost:3001/api`

**Giải pháp:**
1. Redeploy frontend sau khi thêm environment variable
2. Kiểm tra environment variable có set đúng environment (Production/Preview) không
3. Clear browser cache

## ✅ Tóm tắt

1. ✅ **Vercel KHÔNG tự trỏ đến backend**
2. ✅ **Cần cấu hình thủ công** `VITE_API_BASE_URL` trong Vercel
3. ✅ **URL backend**: `https://hcmut-lms-deploy.azurewebsites.net/api`
4. ✅ **Cấu hình CORS** trên Azure App Service
5. ✅ **Redeploy** frontend sau khi cấu hình

## 🎯 Checklist

- [ ] Lấy URL Azure App Service
- [ ] Thêm `VITE_API_BASE_URL` trong Vercel
- [ ] Cấu hình CORS trên Azure App Service
- [ ] Redeploy frontend
- [ ] Test API calls từ frontend
- [ ] Kiểm tra không có CORS errors

