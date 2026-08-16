// Cloudflare Pages Function chạy trước mọi request. Chuyển www.timhangxetai.com sang
// timhangxetai.com (301) — _redirects thường (Netlify-style) KHÔNG lọc theo domain được,
// phải xử lý ở tầng này. Xem QUAN-LY-GOC/DANH-SACH-WEB.md mục tim-hang-xe-tai-web.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.timhangxetai.com") {
    url.hostname = "timhangxetai.com";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
