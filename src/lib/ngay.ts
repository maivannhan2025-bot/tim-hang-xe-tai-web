// ============================================================
//  NGÀY GIỜ cho bài blog — dùng chung cho mọi web (khuôn gốc).
//
//  Vì sao phải có file này:
//  1) Máy dựng web (GitHub Actions) chạy giờ UTC. In ngày giờ mà không ép múi giờ thì
//     bài hẹn 14:30 giờ VN sẽ hiện thành 07:30. Mọi hàm dưới đây đều ép Asia/Ho_Chi_Minh.
//  2) "Lúc sửa gần nhất" lấy từ lịch sử Git của chính file .md đó, nên đúng cho mọi cách sửa:
//     sửa qua /quan-ly, sửa qua Cổng đăng bài, hay sửa tay rồi push.
//     (Cần workflow checkout với fetch-depth: 0 — không có lịch sử thì tự bỏ qua, không vỡ build.)
// ============================================================
import { execFileSync } from 'node:child_process';

const MUI_GIO = 'Asia/Ho_Chi_Minh';
const THU_MUC_BAI = 'src/content/blog';

function tach(d: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: MUI_GIO, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: 'h23',
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  const gio = g('hour') === '24' ? '00' : g('hour'); // vài phiên bản Node trả 24 cho nửa đêm
  return { nam: g('year'), thang: g('month'), ngay: g('day'), gio, phut: g('minute') };
}

/** 07/09/2026 */
export function ngayVN(d: Date): string {
  const v = tach(d);
  return `${v.ngay}/${v.thang}/${v.nam}`;
}

/** 07/09/2026 lúc 14:30 */
export function ngayGioVN(d: Date): string {
  const v = tach(d);
  return `${v.ngay}/${v.thang}/${v.nam} lúc ${v.gio}:${v.phut}`;
}

/** 2026-09-07T14:30:00+07:00 — dạng máy đọc, cho thẻ <time> và dữ liệu Google */
export function isoVN(d: Date): string {
  const v = tach(d);
  return `${v.nam}-${v.thang}-${v.ngay}T${v.gio}:${v.phut}:00+07:00`;
}

/**
 * Bài có đặt GIỜ thật hay chỉ ghi ngày trơn?
 * YAML đọc "ngayDang: 2026-09-07" (không giờ) thành đúng 00:00 giờ UTC, nên cứ 00:00 UTC
 * là coi như bài chỉ có ngày -> in mỗi ngày, không bịa ra "lúc 07:00".
 * (Bài hẹn đúng 07:00 giờ VN cũng rơi vào đây — chấp nhận, vì đó vốn là mốc mặc định cũ.)
 */
export function coGio(d: Date): boolean {
  return !(d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0);
}

// ---- Lúc sửa gần nhất, đọc từ lịch sử Git (chạy 1 lần cho cả kho, không gọi git từng bài) ----
let bangSua: Map<string, Date> | null = null;

function docLichSuGit(): Map<string, Date> {
  const bang = new Map<string, Date>();
  try {
    // Kho "nông" (clone --depth 1) chỉ có ĐÚNG một commit, nên mọi bài đều trông như vừa sửa
    // cùng một lúc. Thà không hiện gì còn hơn hiện ngày sửa BỊA. Cần fetch-depth: 0 khi dựng.
    const nong = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (nong === 'true') return bang;
    const ra = execFileSync(
      'git',
      ['log', '--format=%x00%cI', '--name-only', '--', THU_MUC_BAI],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 },
    );
    let moc: Date | null = null;
    for (const dong of ra.split('\n')) {
      if (dong.startsWith('\0')) { moc = new Date(dong.slice(1).trim()); continue; }
      const ten = dong.trim();
      // git log trả mới nhất trước, nên lần ĐẦU gặp file là lần sửa gần nhất.
      if (ten && moc && !bang.has(ten)) bang.set(ten, moc);
    }
  } catch {
    // Không có git (chạy dev trên máy, hoặc checkout nông) — bỏ qua, coi như chưa từng sửa.
  }
  return bang;
}

/**
 * Lúc sửa gần nhất của một bài. Trả null nếu không tra được.
 * `duongDan` là đường dẫn file trong kho, ví dụ "src/content/blog/abc.md".
 */
export function lucSuaGanNhat(duongDan?: string): Date | null {
  if (!duongDan) return null;
  if (!bangSua) bangSua = docLichSuGit();
  return bangSua.get(duongDan.replace(/^\.?\//, '')) ?? null;
}

/** Đường dẫn file .md của một bài trong kho, từ dữ liệu Astro trả về. */
export function duongDanBai(bai: { filePath?: string; id: string }): string {
  if (bai.filePath) return bai.filePath.replace(/^\.?\//, '');
  return `${THU_MUC_BAI}/${bai.id.replace(/\.md$/, '')}.md`;
}
