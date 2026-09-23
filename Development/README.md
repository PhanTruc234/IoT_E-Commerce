# Triển khai hệ thống IoTech

Backend **NestJS** + Frontend **Next.js**, cơ sở dữ liệu dùng **PostgreSQL**.
Cách triển khai khuyến nghị là dùng **Docker Compose**.

## Cấu trúc thư mục Development
```
Development/
├── .env.example            # Biến build-time cho FRONTEND (NEXT_PUBLIC_*) — copy thành .env
├── env/
│   └── backend.env.example # Biến runtime cho BACKEND (Neon, JWT, R2, VNPAY…) — copy thành backend.env
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docker-compose.yml
└── README.md
```
> Mã nguồn nằm ở `Source/backend` và `Source/frontend`. Khi chạy Docker, **không cần** đặt `.env` trong `Source/` — Compose lấy biến từ hai file trong `Development/` và tiêm vào lúc build/chạy.

## 1. Yêu cầu môi trường
- **Docker** 24+ và **Docker Compose v2** (cách khuyến nghị), hoặc
- **Node.js** 22 (backend) / 20+ (frontend) và **pnpm** 11 (nếu chạy thủ công).
- Một database.
- Tuỳ chọn: Cloudflare R2 (lưu ảnh), VNPAY sandbox (thanh toán), Google OAuth Client ID (đăng nhập Google).

## 2. Chạy bằng Docker (khuyến nghị)
Từ thư mục `Development`:
```bash
cd Development


cp .env.example .env                       
cp env/backend.env.example env/backend.env  

docker compose up -d --build
```
- Frontend: `http://<IP_VPS>:3000` (hoặc `http://localhost:3000` khi chạy tại máy)
- Backend API: `http://<api.IP_VPS>:3001/api` • Swagger: `http://<api.IP_VPS>:3001/api/docs`
- Migration tự chạy lên Neon khi container backend khởi động.

Kiểm tra:
```bash
docker compose ps                 
docker compose logs -f backend   
```

Tạo dữ liệu mẫu (tuỳ chọn, cần khai báo seed trong package.json):
```bash
docker compose exec backend pnpm prisma db seed
```

Cập nhật khi có code mới:
```bash
git pull
docker compose up -d --build
```
Dừng: `docker compose down`.

## 3. Chạy thủ công (không Docker)
**Backend**
```bash
cd Source/backend
cp ../../Development/env/backend.env.example .env    # điền giá trị
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm db:seed           
pnpm start:prod       
```
**Frontend**
```bash
cd Source/frontend

pnpm install
pnpm build && pnpm start    
```

## 4. Biến môi trường
| File                          | Dùng cho | Cơ chế                                                                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Development/.env`            | Frontend | Compose truyền vào `build.args` → `NEXT_PUBLIC_*` **nung vào bundle lúc build** (đổi thì phải `--build` lại).            |
| `Development/env/backend.env` | Backend  | Compose nạp qua `env_file` → tiêm vào `process.env` của container **lúc chạy** (đổi thì chỉ cần `docker compose up -d`). |

Chi tiết các biến xem trong `Development/env/backend.env.example` và `Development/.env.example`.

## 5. Chạy production với tên miền + HTTPS (tuỳ chọn)
Khi có tên miền, thêm reverse proxy (ví dụ Caddy tự cấp SSL) và đổi:
- `Development/.env`: `NEXT_PUBLIC_API_URL=https://tenmien.com/api`, `NEXT_PUBLIC_SITE_URL=https://tenmien.com`
- `Development/env/backend.env`: `COOKIE_SECURE=true`, `CORS_ORIGINS=https://tenmien.com`, `FRONTEND_URL=https://tenmien.com`, `VNP_RETURN_URL=https://tenmien.com/api/payments/vnpay/return`
- Trỏ bản ghi DNS A của tên miền về IP VPS, rồi `docker compose up -d --build`.

## 6. Lưu ý bảo mật
- **Không commit** `Development/.env` và `Development/env/backend.env` (chứa bí mật). Chỉ commit các file `*.example`.
- Sinh khoá JWT ngẫu nhiên: `openssl rand -hex 32` (chạy 2 lần cho 2 secret).
- Chuỗi Neon cần `?sslmode=require`; nên dùng endpoint **pooler** của Neon.
- Với đăng nhập Google: thêm URL frontend (vd `http://<IP_VPS>:3000`) vào *Authorized JavaScript origins* trong Google Cloud Console.
