# BIÊN BẢN BÀN GIAO — tim-hang-xe-tai-web

> Đọc file này TRƯỚC khi làm gì trong dự án này — đủ để bắt tay vào việc ngay, không cần dò lại
> git log, không cần đọc lại toàn bộ code hay khám phá từ đầu. Ngày lập: 2026-08-16.

## 1. Đây là dự án gì

`timhangxetai.com` (root domain) = **trang giới thiệu app + blog SEO**, viết bằng Astro, deploy qua
Cloudflare Pages.

**TÁCH BIỆT HOÀN TOÀN** khỏi `app.timhangxetai.com` (app thật — chỗ chủ hàng/nhà xe đăng ký dùng),
là Cloudflare Worker riêng, code ở `G:\My Drive\CLAUDE+FUNNELTEX\app-tim-hang-xe-tai` (repo GitHub
`maivannhan2025-bot/tim-hang-xe-tai`). **Đừng nhầm 2 dự án** — sửa nội dung/marketing/blog thì làm ở
đây, KHÔNG đụng app kia.

Chủ dự án: anh Mai Văn Nhận — **không rành lập trình**, luôn nói bằng lời thường, báo kết quả bằng
bảng/gạch đầu dòng dễ hiểu, không dùng thuật ngữ khi báo cáo cho anh.

## 2. Vị trí & cấu hình

| | |
|---|---|
| Mã nguồn | `G:\My Drive\CLAUDE+FUNNELTEX\tim-hang-xe-tai-web` |
| Repo GitHub | `maivannhan2025-bot/tim-hang-xe-tai-web` (private) |
| Hosting | Cloudflare Pages, project `tim-hang-xe-tai-web` |
| Tên miền | `timhangxetai.com` + `www` (redirect 301 về apex qua `functions/_middleware.js`) |
| Deploy | GitHub Action `.github/workflows/deploy.yml` — tự chạy khi push `main`, **cộng thêm
`cron: '0 */2 * * *'`** (build lại mỗi 2 tiếng — lý do xem mục 4) |
| Trang quản lý | `/quan-ly/` — copy nguyên từ `QUAN-LY-GOC/index.html`, chỉ đổi khối `CFG`
(`repo:'maivannhan2025-bot/tim-hang-xe-tai-web'`, `auth:'https://sveltia-auth.vantaidanhlong.workers.dev'`
— dùng CHUNG cầu đăng nhập GitHub với Danh Long/Lê Chung, `site:'https://timhangxetai.com'`) |
| Framework | Astro `^4.16.0`, output `static`, `@astrojs/sitemap` **ghim đúng bản `3.2.1`**
(bản `3.7.3` lỗi build "Cannot read reduce" với Astro 4 — ĐỪNG nâng cấp package này mà không test) |

Sửa trang quản lý (`/quan-ly`) → PHẢI qua khuôn gốc `QUAN-LY-GOC/index.html` trước, xem skill
`sua-trang-quan-ly-goc`. Không sửa thẳng bản áp ở đây rồi bỏ quên khuôn gốc.

## 3. Cấu trúc nội dung (Astro content collections)

- `src/content.config.ts` — schema bài blog: `title, description, ngayDang (coerce date), thoiGianDoc,
anhDaiDien, doiTuong (chu-hang|nha-xe|ca-hai), draft (bool, default false)`.
- `src/content/blog/*.md` — mỗi bài 1 file, slug = tên file.
- `public/anh/` — kho ảnh dùng cho blog (ảnh thật, xem mục 5).
- `src/pages/index.astro` — trang chủ, 83 điểm `data-edit` (anh Nhận tự sửa qua `/quan-ly`).
- `src/pages/blog/index.astro` + `src/pages/blog/[slug]/index.astro` — danh sách + chi tiết bài,
  chia cột "chủ hàng" / "nhà xe" theo `doiTuong`.

## 4. Cơ chế HẸN GIỜ đăng bài (quan trọng, dễ hiểu nhầm)

Astro/Cloudflare Pages **không có cơ chế hẹn lịch sẵn** (khác WordPress). Cách đã dựng:

1. Mỗi bài đặt `ngayDang` là thời điểm tương lai (ISO có giờ + múi giờ, VD
   `2026-08-16T19:30:00+07:00`).
2. `getStaticPaths` ở cả `blog/index.astro` và `blog/[slug]/index.astro` lọc:
   `!data.draft && data.ngayDang.valueOf() <= now` — bài chưa tới giờ **hoàn toàn không được build ra
   trang** (không phải ẩn bằng CSS — truy cập thẳng URL sẽ ra **404 thật**, đây là hành vi ĐÚNG,
   không phải lỗi).
3. GitHub Action có thêm `schedule: cron: '0 */2 * * *'` để tự build lại đều đặn — nhờ vậy bài hẹn
   giờ "tự sống dậy" đúng lúc mà không cần ai bấm gì.

**Bẫy đã gặp:** khi build-test trong thư mục scratchpad ngoài Drive, nếu chỉ đồng bộ file nội dung
`.md` mà QUÊN đồng bộ lại `src/pages/blog/*.astro` (bản cũ chưa có bộ lọc ngày) → build ra TẤT CẢ bài
kể cả bài tương lai, tưởng nhầm là lỗi thật. **Luôn đồng bộ lại toàn bộ `src/` trước khi build-test**,
đừng chỉ copy phần vừa sửa.

## 5. Nguồn ảnh blog — ĐỪNG tạo kho ảnh mới

Ảnh thật dùng CHUNG với 4 website kia của anh Nhận (Lê Chung, Danh Long, 2 web Hùng Vương), lấy từ
thư mục Google Drive dùng chung — xem `kho-anh-drive.md` trong skill `content-4-web-mai-van-nhan`
(plugin `anthropic-skills`) để biết cách tải + quy trình xem tận mắt trước khi dùng.

**Luật bắt buộc:** đúng 3 ảnh thật/bài (1 đại diện + 2 nhúng thân bài), khác nhau rõ rệt, đã xem tận
mắt từng ảnh trước khi dùng (KHÔNG tin tên file) — loại bỏ ảnh dính thương hiệu hãng khác, số điện
thoại lạ, mặt người lạ rõ nét. Lần 16/08 đã loại 6/18 ảnh ứng viên vì lý do này dù tên file nhìn hợp lệ.

Ảnh đã tải về nằm sẵn ở `public/anh/` — danh sách hiện có xem trực tiếp trong thư mục, không cần tải
lại nếu dùng đúng ảnh đã có.

## 6. Trạng thái nội dung hiện tại (16/08/2026)

6 bài blog: 1 bài gốc (`vi-sao-xe-chay-rong-chieu-ve`) + 5 bài mới viết theo từ khóa chủ hàng hay tìm
(xe tải mấy tấn, thuê xe đi tỉnh, chọn nhà xe uy tín, giấy tờ vận chuyển, thuê xe Bắc Nam). Lịch đăng
trải từ 16:00 16/08 tới 19:30 17/08. Chi tiết đầy đủ (tiêu đề, giờ, trạng thái sống/hẹn) xem
`QUAN-LY-GOC/DANH-SACH-WEB.md` mục "4) Tìm Hàng Xe Tải" — **không chép lại ở đây để tránh lệch dữ
liệu khi có bài mới**, luôn tra file đó để biết trạng thái mới nhất.

Đã kiểm 2 vòng độc lập theo luật viết (skill `content-4-web-mai-van-nhan` mục 4) + luật SEO nội dung
(luật 15: từ khóa phải có ở tiêu đề/mô tả/mở bài/≥2 H2/kết luận/1 alt ảnh) — vòng 1 tự kiểm bỏ sót
lỗi alt ảnh, vòng 2 xác minh chéo độc lập mới bắt hết. **Bài học: đừng chỉ tin báo cáo tự kiểm của
chính mình cho việc SEO/nội dung, luôn xác minh chéo trước khi báo "đã đạt chuẩn".**

## 7. SEO nền tảng đã làm

- `robots.txt` + `sitemap-index.xml`/`sitemap-0.xml` thật (từng bị Cloudflare Pages trả nhầm mọi
  đường dẫn sai về trang chủ — soft-404 — đã thêm `src/pages/404.astro` để sửa).
- Google Search Console: property `https://timhangxetai.com/` verify qua thẻ meta (không dùng kiểu
  Domain — chỉ index đúng phần marketing, không đụng `app.timhangxetai.com`), đã nộp sitemap, đã yêu
  cầu lập chỉ mục thủ công cho các trang chính.
- JSON-LD Organization, og:image, Twitter Card, heading đúng thứ bậc (H1 do Layout tự render từ
  `title`, không viết `#` trong thân bài).

## 8. Việc còn thiếu (không gấp, chờ anh Nhận)

- `chung.json` còn trống: hotline, Zalo, địa chỉ thật, Facebook Pixel, GA — anh Nhận tự điền qua
  `/quan-ly` khi cần, đừng tự bịa.
- Chưa có ảnh logo/thương hiệu chính thức (đang tạm dùng ảnh blog).
- Chưa có lời đánh giá (testimonial) thật từ khách.
- Còn 6/11 chủ đề gợi ý ban đầu chưa viết — hỏi anh Nhận có muốn viết tiếp đợt sau không.

## 9. Quy trình chuẩn khi sửa tiếp (đã dùng thành công nhiều lần)

1. `npm install`/`astro build`/mọi lệnh node đều chạy TRONG bản sao ở
   `<scratchpad-session>/build-check` (NGOÀI Google Drive) — chạy trực tiếp trong thư mục Drive dễ
   lỗi `ENOTEMPTY`/`EBADF` vì Drive đồng bộ real-time xung đột với ghi file nhanh của node.
2. Đồng bộ lại **toàn bộ** `src/`, `public/`, config vào bản build-check trước khi build (đừng chỉ
   copy phần vừa sửa — xem bẫy ở mục 4).
3. `npx astro build`, kiểm `dist/` — đúng số trang mong đợi, ảnh/H2/từ khóa đúng như dự tính.
4. Trước khi `git commit`/`push`: LUÔN `find .git -iname "desktop.ini" -delete` (Google Drive nhét
   file trang trí vào trong `.git/`, gây lỗi `fatal: bad object refs/desktop.ini` khi fetch/push).
5. `git fetch origin && git rebase origin/main && git push origin main`
   (`GIT_TERMINAL_PROMPT=0`, dùng credential cache sẵn của Windows).
6. Đợi GitHub Action deploy (~1-2 phút), verify bằng
   `curl -sL "https://timhangxetai.com/<đường-dẫn>?cb=$RANDOM"` — lặp vài lần nếu nghi cache Cloudflare
   chưa cập nhật.
7. Cập nhật `QUAN-LY-GOC/DANH-SACH-WEB.md` mục "4) Tìm Hàng Xe Tải" với đợt sửa mới.

## 10. Liên kết bộ nhớ & tài liệu khác

- Bộ nhớ dài hạn Claude: `timhangxetai-web-marketing-blog.md` (tóm tắt ngắn, tự nạp mỗi phiên).
- Chi tiết kỹ thuật + lịch sử từng đợt: `QUAN-LY-GOC/DANH-SACH-WEB.md`.
- Luật viết nội dung 4 web: skill `content-4-web-mai-van-nhan` (plugin `anthropic-skills`).
- Luật chung mọi dự án của anh Nhận: `G:\My Drive\CLAUDE+FUNNELTEX\CLAUDE.md`.
