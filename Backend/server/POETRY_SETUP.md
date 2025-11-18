# Poetry Setup Guide

Hướng dẫn chuyển đổi từ pip sang Poetry cho Backend server.

## 📦 Cài đặt Poetry

### Windows (PowerShell)
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

Sau khi cài đặt, thêm Poetry vào PATH:
```powershell
# Tạm thời cho session hiện tại
$env:Path += ";$env:APPDATA\Python\Scripts"

# Hoặc thêm vĩnh viễn vào System Environment Variables
# Control Panel > System > Advanced > Environment Variables
# Thêm: %APPDATA%\Python\Scripts vào PATH
```

### macOS/Linux
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Thêm vào PATH:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Hoặc dùng pip
```bash
pip install poetry
```

## ✅ Kiểm tra cài đặt
```bash
poetry --version
```

## 🚀 Sử dụng Poetry

### 1. Cài đặt dependencies
```bash
cd Backend/server
poetry install
```

Poetry sẽ:
- Tự động tạo virtual environment
- Cài đặt tất cả dependencies từ `pyproject.toml`
- Tạo file `poetry.lock` để lock versions

### 2. Chạy ứng dụng

**Cách 1: Dùng poetry run**
```bash
poetry run python app.py
```

**Cách 2: Activate shell**
```bash
poetry shell
python app.py
```

### 3. Thêm dependency mới
```bash
poetry add package-name
poetry add package-name@^1.0.0  # với version cụ thể
```

### 4. Xóa dependency
```bash
poetry remove package-name
```

### 5. Cập nhật dependencies
```bash
poetry update  # Update tất cả
poetry update package-name  # Update package cụ thể
```

### 6. Xem dependencies
```bash
poetry show  # List tất cả packages
poetry show package-name  # Chi tiết package
```

### 7. Export ra requirements.txt (nếu cần)
```bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

## 📁 Cấu trúc file

Sau khi setup, bạn sẽ có:
```
Backend/server/
├── pyproject.toml      # Poetry config (thay thế requirements.txt)
├── poetry.lock         # Lock file (tự động tạo)
├── requirements.txt    # Giữ lại để tham khảo (không cần dùng nữa)
└── .venv/             # Virtual environment (tự động tạo)
```

## 🔄 Migration từ pip sang Poetry

Đã hoàn thành:
- ✅ Tạo `pyproject.toml` từ `requirements.txt`
- ✅ Cập nhật README.md với hướng dẫn Poetry
- ✅ Giữ lại `requirements.txt` để tham khảo

## ⚠️ Lưu ý

1. **Virtual Environment**: Poetry tự động quản lý virtual environment, không cần tạo thủ công
2. **poetry.lock**: File này nên được commit vào git để đảm bảo mọi người dùng cùng versions
3. **.venv/**: Thư mục này sẽ được tạo tự động, có thể thêm vào `.gitignore`

## 🆘 Troubleshooting

### Poetry không được nhận diện
- Kiểm tra PATH đã được thêm chưa
- Restart terminal/IDE
- Thử cài lại Poetry

### Lỗi khi install dependencies
```bash
# Clear cache
poetry cache clear pypi --all

# Thử lại
poetry install
```

### Xung đột với virtual environment cũ
```bash
# Xóa virtual environment cũ
poetry env remove python

# Tạo lại
poetry install
```

