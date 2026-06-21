# DeskOS & PC Optimizer Pro

Ứng dụng quản lý màn hình ảo động và tối ưu hóa hệ thống PC được xây dựng bằng Electron, HTML5, CSS3, và JavaScript. 

Giao diện của ứng dụng được thiết kế theo phong cách **Holographic Glassmorphism (Kính mờ)** hiện đại với các hiệu ứng chuyển động mượt mà, tích hợp bộ tổng hợp âm thanh tương tác trực tiếp (Web Audio API) và công cụ quét/dọn dẹp tệp tin rác thông minh, an toàn.

---

## ✨ Các Tính Năng Nổi Bật

### 1. 🖥️ Màn Hình Ảo Đẹp Mắt & Sinh Động (DeskOS)
* **Giao diện Kính mờ cao cấp (Glassmorphism):** Sự kết hợp giữa các lớp phủ màu tối bán trong suốt, đường viền phát sáng (neon borders) và hiệu ứng làm mờ nền sâu (`backdrop-filter`).
* **Sắp xếp Thư mục Dạng Động:** Các thư mục trên màn hình hiển thị dưới dạng các ô lưới thu nhỏ (2x2 preview) chứa biểu tượng của các ứng dụng bên trong (giống như trên iOS/macOS). Khi nhấp đúp, thư mục sẽ mở ra bằng một hiệu ứng phóng to (zoom scale) mềm mại và mượt mà.
* **Mở rộng & Tùy biến:** Dễ dàng tạo nhóm thư mục mới, đổi tên thư mục trực tiếp, thêm các phím tắt ứng dụng (`.exe`, `.lnk`...) hoặc tệp tin bất kỳ từ máy tính của bạn và lưu trữ cấu trúc này một cách bền vững (`localStorage`).

### 2. 🚀 Khởi Chạy Ứng Dụng Trực Tiếp (App Launcher)
* **Khởi chạy tức thì:** Nhấp đúp vào bất kỳ biểu tượng phím tắt nào bên trong thư mục để khởi chạy ứng dụng đó trực tiếp thông qua API an toàn của hệ điều hành (`shell.openPath`).
* **Cấu hình sẵn ứng dụng hệ thống:** Các công cụ mặc định như Command Prompt (CMD), Task Manager, PowerShell, Calculator, Notepad, Wordpad, Microsoft Edge đã được cấu hình sẵn đường dẫn để bạn trải nghiệm ngay lập tức.

### 3. 🔊 Âm Thanh Tương Tác Động (Sound FX)
* **Bộ tổng hợp âm thanh tích hợp:** Không cần tải các tệp âm thanh bên ngoài (tránh lỗi tải chậm/không tìm thấy file), ứng dụng sử dụng **Web Audio API** để tạo ra các tần số âm thanh cơ học chuẩn xác:
  * *Click sound:* Âm thanh cơ học click sắc bén khi nhấn nút.
  * *Hover blip:* Âm thanh lướt chuột nhẹ nhàng khi di qua các thẻ/biểu tượng.
  * *Folder sweep:* Tiếng rít gió (whoosh) khi mở/đóng thư mục.
  * *Success chime:* Hợp âm thành công khi quét xong hoặc hoàn tất dọn dẹp.
  * *Swoosh sound:* Hiệu ứng lướt dọn dẹp khi xóa tệp tin.
  * *Radar sound:* Âm thanh quét tần số lặp lại trong suốt quá trình quét đĩa.
* **Bật/Tắt dễ dàng:** Nút chuyển đổi âm thanh (Mute/Unmute) được tích hợp ngay trên thanh tiêu đề góc trên cùng bên phải.

### 4. 🧹 Trình Quét & Dọn Dẹp Tối Ưu Hệ Thống (PC Optimizer)
* **Quét thông minh (Smart Scan):** Tự động phát hiện các tệp tin tạm (Temp files), tệp bộ nhớ đệm (Cache), tệp nhật ký hệ thống (Logs), các bộ cài đặt ứng dụng đã tải về bị lãng quên (`.exe`, `.msi` trong thư mục Downloads), các tệp tin có dung lượng lớn (>150MB), và các ứng dụng/tệp tin đã lâu không dùng (hơn 60 ngày) trên Desktop và Start Menu.
* **Quét thư mục tùy chỉnh (Custom Directory):** Cho phép bạn chọn bất kỳ thư mục cụ thể nào trên ổ đĩa để phân tích và dọn dẹp dung lượng thừa.
* **Phân loại & Đề xuất An toàn:**
  * `Safe to Delete` (Màu xanh lá): Các tệp rác, temp, cache an toàn để xóa. Được chọn tự động để xóa nhanh.
  * `Review` (Màu vàng): Các tệp cài đặt hoặc tệp dung lượng lớn. Bạn cần xem xét trước khi tích chọn xóa.
  * `Keep` (Màu đỏ): Các tệp cấu hình hệ thống quan trọng (`.sys`, `.dll`, `.ini`). **Ứng dụng sẽ tự động khóa và vô hiệu hóa nút xóa các tệp này để bảo vệ máy tính của bạn tuyệt đối.**
* **Xóa trực tiếp an toàn:** Khi nhấn dọn dẹp, ứng dụng sử dụng API gốc `shell.trashItem` để di chuyển các tệp rác vào **Recycle Bin (Thùng rác)** của Windows. Điều này giúp bạn có thể khôi phục lại tệp tin bất cứ lúc nào nếu cần, đảm bảo an toàn tối đa cho hệ thống.

### 5. 📊 Bảng Theo Dõi Hiệu Năng (System Specs)
* **Đồng hồ đo thời gian thực:** Hiển thị biểu đồ vòng quay động thể hiện phần trăm sử dụng RAM và dung lượng đĩa cứng ổ C: hiện tại.
* **Cập nhật liên tục:** Tự động làm mới số liệu mỗi 3 giây để phản ánh đúng hiệu năng hiện tại của máy tính.
* **Thông tin phần cứng chi tiết:** Hiển thị hệ điều hành, tên vi xử lý (CPU), số luồng (Cores) và dung lượng RAM tổng.

### 6. ⚡ Tối Ưu Hóa & Giải Phóng Bộ Nhớ RAM (RAM Boost)
* **Giải phóng RAM tức thì:** Tích hợp nút bấm "Optimize RAM" ở tab PC Optimizer và nút "Boost RAM" ở tab System Specs cạnh biểu đồ đo.
* **Cơ chế hoạt động Native:** Gọi script PowerShell ngầm để kích hoạt hàm API gốc `EmptyWorkingSet()` trên toàn bộ các tiến trình người dùng đang chạy (như trình duyệt Chrome/Edge, ứng dụng chạy ngầm...), kết hợp với lệnh dọn rác bộ nhớ V8 engine của chính Electron. Giải phóng ngay lập tức hàng trăm MB đến hàng GB bộ nhớ đệm (Standby List & Working Set) mà không cần quyền Admin.
* **Hoạt ảnh tương tác & âm thanh:** Khi kích hoạt, vòng tròn RAM sẽ phát sáng neon rực rỡ, icon xoay và âm thanh quét radar tần số tăng dần sẽ phát lên, kết thúc bằng hợp âm báo thành công.

### 7. 📅 Quét các Tệp tin & Ứng dụng Không Sử Dụng (Unused Items Scanner)
* **Phát hiện ứng dụng bỏ hoang:** Tự động quét các phím tắt ứng dụng (`.lnk`, `.exe`) trong thư mục Start Menu hệ thống và màn hình Desktop. Nếu ứng dụng không được mở hoặc sửa đổi trong hơn 60 ngày, nó sẽ được liệt kê dưới dạng `Unused App`.
* **Phát hiện tệp tin dư thừa:** Quét các tệp tài liệu hoặc dữ liệu khác không có hoạt động chỉnh sửa hay truy cập trong hơn 60 ngày, liệt kê dưới dạng `Unused File`.
* **Bộ lọc riêng biệt:** Tab "Unused Items" trong danh sách kết quả giúp bạn nhanh chóng xem xét và di chuyển chúng vào Thùng rác một cách an toàn.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
Tool_Desktop/
├── .gitignore                # Danh sách các tệp/thư mục bỏ qua không đẩy lên Git (ví dụ: node_modules)
├── package.json               # Cấu hình dự án & các lệnh khởi chạy Electron
├── main.js                   # Xử lý tiến trình chính (Main Process: quét file, xóa file, mở app, hệ thống...)
├── preload.js                # Cầu nối IPC an toàn (ContextBridge) giữa Main và Renderer
├── run-app.bat               # Khởi chạy ứng dụng và tự động cài đặt thư viện (Hiện terminal)
├── run-silent.vbs            # Khởi chạy ứng dụng ẩn hoàn toàn terminal popup
├── create-shortcut.bat       # Kịch bản tự động tạo shortcut "DeskOS" ngoài màn hình Desktop
├── push.bat                  # Kịch bản tự động đẩy code lên Github repository 1-click
└── renderer/                 # Tiến trình giao diện (Renderer Process)
    ├── index.html            # Khung giao diện HTML & các biểu tượng SVG sắc nét
    ├── style.css             # Thiết kế kính mờ Holographic, hiệu ứng chuyển động & biểu đồ tròn
    └── renderer.js           # Logic xử lý giao diện, bộ phát âm thanh & kết nối IPC
```

---

## 🚀 Hướng Dẫn Chạy & Quản Lý Ứng Dụng

### 1. Tạo lối tắt màn hình chính (Desktop Shortcut)
* Nhấp đúp chuột vào tệp **`create-shortcut.bat`** trong thư mục dự án.
* Một biểu tượng shortcut có tên **`DeskOS`** với icon màn hình máy tính sẽ được tự động tạo ngoài Desktop của bạn.

### 2. Khởi chạy ứng dụng KHÔNG hiện cửa sổ dòng lệnh (Silent Start)
* Bạn chỉ cần nhấp đúp chuột vào shortcut **`DeskOS`** ngoài màn hình Desktop (hoặc chạy trực tiếp tệp **`run-silent.vbs`** trong thư mục).
* Ứng dụng sẽ tự động gọi chạy `run-app.bat` ở dạng ẩn. Giao diện DeskOS kính mờ tuyệt đẹp sẽ hiện lên ngay lập tức mà **không xuất hiện bất kỳ cửa sổ dòng lệnh đen (Command Prompt) nào**.

### 3. Đẩy mã nguồn lên GitHub (1-Click Push)
* Nhấp đúp chuột vào tệp **`push.bat`**.
* Kịch bản sẽ tự động khởi tạo git, cấu hình đường dẫn remote tới `https://github.com/HoangKyAnh05/Tool_Desktop.git`, đóng gói toàn bộ thay đổi và đẩy (push) trực tiếp lên nhánh `main` trên GitHub của bạn.
