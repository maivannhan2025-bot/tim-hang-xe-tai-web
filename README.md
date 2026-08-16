# tim-hang-xe-tai-web

Trang giới thiệu (marketing) + Blog của **timhangxetai.com** — sàn kết nối chủ hàng và nhà xe tải.

Dựng theo khung Astro chuẩn (`QUAN-LY-GOC/KHUNG-WEB-CHUAN.md`) để có trang quản lý tự sửa 100% tiếng Việt tại `/quan-ly`.

- **App thật** (đăng nhập, đăng đơn, báo giá...) sống ở dự án riêng `app-tim-hang-xe-tai`, chạy tại `app.timhangxetai.com` — KHÔNG đụng gì ở đây.
- Dự án này CHỈ phục vụ: trang chủ giới thiệu (`/`) + blog (`/blog/*`) + trang quản lý (`/quan-ly`).

## Cấu trúc
```
src/data/chung.json      liên hệ + Pixel/GA/Form (sửa qua /quan-ly, không cần sửa tay)
src/data/trangchu.json   nội dung trang chủ (chữ/icon) (sửa qua /quan-ly, không cần sửa tay)
src/pages/index.astro    trang chủ, gắn data-edit để /quan-ly sửa trực quan được
src/content/blog/*.md    bài blog
public/quan-ly/index.html  trang quản lý — copy từ QUAN-LY-GOC, chỉ khác khối CFG
```

## Chạy thử ở máy
```
npm install
npm run dev
```

## Deploy
Push lên `main` → GitHub Action tự build + đẩy lên Cloudflare Pages (project `tim-hang-xe-tai-web`).
