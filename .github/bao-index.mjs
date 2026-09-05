// ============================================================================
//  BAO INDEX — bao may tim kiem vao lay BAI VUA LEN CONG KHAI (giao thuc IndexNow)
//
//  Chay 2 lan trong mot lan deploy:
//    node .github/bao-index.mjs ghi-nho   <- TRUOC khi deploy: chup lai sitemap DANG live
//    node .github/bao-index.mjs bao       <- SAU khi deploy: so voi ban vua build,
//                                            chi bao nhung URL MOI hoac DOI NGAY
//
//  Vi sao phai so sanh: bai dat lich (ngayDang tuong lai) chi "hien ra" o lan build
//  SAU dung ngay do — luc ay khong co commit nao ca. So sitemap cu vs moi la cach duy
//  nhat bat dung khoanh khac bai len cong khai. Bao lai ca sitemap moi lan deploy thi
//  vua thua vua de bi coi la rac.
//
//  KHOA IndexNow KHONG phai bi mat: no von phai nam cong khai o file .txt tren web.
//  Loi o day KHONG BAO GIO duoc chan deploy -> moi nhanh loi deu exit 0.
// ============================================================================

import fs from 'node:fs';

const CH = {
  HOST: 'timhangxetai.com',
  KEY: 'e876b328ebf50b9edea4ecb671cfbf34ec7fa119',
  KEY_LOCATION: 'https://timhangxetai.com/e876b328ebf50b9edea4ecb671cfbf34ec7fa119.txt',
  SITEMAP_LIVE: 'https://timhangxetai.com/sitemap-index.xml',
  DIST_DIR: 'dist',
  DIST_KHOP: /^sitemap-\d+\.xml$/,
  // IndexNow chi cho bao URL nam CUNG thu muc voi file khoa. De trong = ca ten mien.
  CHI_TRONG: '',
};

const FILE_TAM = '/tmp/sitemap-truoc-deploy.json';
const UA = 'Mozilla/5.0 (compatible; bao-index/1.0)';

function docXml(xml) {
  const map = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/);
    const lastmod = m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/);
    if (loc) map.set(loc[1], lastmod ? lastmod[1] : '');
  }
  return map;
}

async function taiSitemap(url, daDi = new Set()) {
  if (daDi.has(url)) return new Map();
  daDi.add(url);
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' khi tai ' + url);
  const xml = await r.text();
  if (xml.includes('<sitemapindex')) {
    const gop = new Map();
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      for (const [k, v] of await taiSitemap(m[1], daDi)) gop.set(k, v);
    }
    return gop;
  }
  if (!xml.includes('<urlset')) throw new Error('Khong phai sitemap: ' + url);
  return docXml(xml);
}

function docSitemapVuaBuild() {
  const gop = new Map();
  for (const f of fs.readdirSync(CH.DIST_DIR).filter((f) => CH.DIST_KHOP.test(f))) {
    for (const [k, v] of docXml(fs.readFileSync(CH.DIST_DIR + '/' + f, 'utf8'))) gop.set(k, v);
  }
  return gop;
}

async function ghiNho() {
  try {
    const cu = await taiSitemap(CH.SITEMAP_LIVE);
    fs.writeFileSync(FILE_TAM, JSON.stringify({ ok: true, urls: [...cu] }));
    console.log('Da chup sitemap dang live:', cu.size, 'URL');
  } catch (e) {
    fs.writeFileSync(FILE_TAM, JSON.stringify({ ok: false, ly_do: e.message }));
    console.log('Khong chup duoc sitemap live (' + e.message + ') — lan nay se bao ca sitemap.');
  }
}

async function bao() {
  const moi = docSitemapVuaBuild();
  if (!moi.size) return console.log('Khong doc duoc URL nao trong ' + CH.DIST_DIR + ' — bo qua.');

  let truoc = { ok: false, ly_do: 'khong co file tam' };
  try {
    truoc = JSON.parse(fs.readFileSync(FILE_TAM, 'utf8'));
  } catch {}

  let urls;
  if (truoc.ok) {
    const cu = new Map(truoc.urls);
    urls = [...moi].filter(([loc, lm]) => !cu.has(loc) || cu.get(loc) !== lm).map(([loc]) => loc);
    console.log('So sanh: cu ' + cu.size + ' URL, moi ' + moi.size + ' URL -> ' + urls.length + ' URL vua len/vua doi');
  } else {
    urls = [...moi.keys()];
    console.log('Khong co ban cu de so (' + truoc.ly_do + ') -> bao ca ' + urls.length + ' URL');
  }

  if (CH.CHI_TRONG) urls = urls.filter((u) => u.startsWith(CH.CHI_TRONG));
  if (!urls.length) return console.log('Khong co bai nao moi len cong khai — khong bao gi ca.');

  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA },
    body: JSON.stringify({
      host: CH.HOST,
      key: CH.KEY,
      keyLocation: CH.KEY_LOCATION,
      urlList: urls,
    }),
  });
  console.log('IndexNow tra ve status:', r.status, '- so URL da gui:', urls.length);
  for (const u of urls) console.log('   ' + u);
}

const viec = process.argv[2];
try {
  if (viec === 'ghi-nho') await ghiNho();
  else if (viec === 'bao') await bao();
  else console.log('Dung: node .github/bao-index.mjs ghi-nho | bao');
} catch (e) {
  console.log('Loi bao index (bo qua, khong chan deploy):', e.message);
}
