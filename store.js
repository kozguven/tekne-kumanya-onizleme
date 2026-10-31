/* Demo verisi ve ortak yardımcılar. Veriler yalnız bu tarayıcıda saklanır. */
const KEY = 'kumanya-demo-v1';

const CATS = ['Kasap', 'Balık', 'Manav', 'Süt ve kahvaltılık', 'Market', 'İçecek'];

function P(id, name, cat, unit, price, kdv, barcode) {
  return { id, name, cat, unit, price, kdv, barcode: barcode || '' };
}

const PRODUCTS = [
  P('p1', 'Kuzu pirzola', 'Kasap', 'kg', 1150, 1),
  P('p2', 'Dana kıyma', 'Kasap', 'kg', 720, 1),
  P('p3', 'Dana kuşbaşı', 'Kasap', 'kg', 760, 1),
  P('p4', 'Tavuk göğüs', 'Kasap', 'kg', 260, 1),
  P('p5', 'Tavuk kanat', 'Kasap', 'kg', 190, 1),
  P('p6', 'Köfte (hazır)', 'Kasap', 'kg', 680, 1),
  P('p7', 'Levrek', 'Balık', 'kg', 480, 1),
  P('p8', 'Çipura', 'Balık', 'kg', 450, 1),
  P('p9', 'Karides (ayıklanmış)', 'Balık', 'kg', 900, 1),
  P('p10', 'Kalamar', 'Balık', 'kg', 620, 1),
  P('p11', 'Domates', 'Manav', 'kg', 45, 1),
  P('p12', 'Salatalık', 'Manav', 'kg', 35, 1),
  P('p13', 'Limon', 'Manav', 'kg', 60, 1),
  P('p14', 'Karpuz', 'Manav', 'kg', 20, 1),
  P('p15', 'Kavun', 'Manav', 'kg', 30, 1),
  P('p16', 'Patates', 'Manav', 'kg', 30, 1),
  P('p17', 'Kuru soğan', 'Manav', 'kg', 25, 1),
  P('p18', 'Maydanoz', 'Manav', 'demet', 15, 1),
  P('p19', 'Roka', 'Manav', 'demet', 20, 1),
  P('p20', 'Şeftali', 'Manav', 'kg', 70, 1),
  P('p21', 'Süt 1 L', 'Süt ve kahvaltılık', 'adet', 75, 1, '8690504011022'),
  P('p22', 'Süzme yoğurt 1 kg', 'Süt ve kahvaltılık', 'adet', 195, 1, '8690504054128'),
  P('p23', 'Yoğurt 1,2 kg', 'Süt ve kahvaltılık', 'adet', 140, 1, '8690504052339'),
  P('p24', 'Beyaz peynir', 'Süt ve kahvaltılık', 'kg', 420, 1),
  P('p25', 'Kaşar peyniri 600 g', 'Süt ve kahvaltılık', 'adet', 330, 1, '8690504081247'),
  P('p26', 'Yumurta 30\'lu', 'Süt ve kahvaltılık', 'adet', 210, 1, '8690831204510'),
  P('p27', 'Tereyağı 500 g', 'Süt ve kahvaltılık', 'adet', 340, 1, '8690504091253'),
  P('p28', 'Siyah zeytin 1 kg', 'Süt ve kahvaltılık', 'adet', 300, 1, '8690632001387'),
  P('p29', 'Krema 200 ml', 'Süt ve kahvaltılık', 'adet', 95, 1, '8690504070227'),
  P('p30', 'Zeytinyağı 1 L', 'Market', 'adet', 489, 1, '8690632002018'),
  P('p31', 'Ayçiçek yağı 2 L', 'Market', 'adet', 330, 1, '8690574101203'),
  P('p32', 'Un 1 kg', 'Market', 'adet', 59, 1, '8690570002106'),
  P('p33', 'Makarna penne 500 g', 'Market', 'adet', 55, 1, '8690570515613'),
  P('p34', 'Nohut konserve 800 g', 'Market', 'adet', 115, 1, '8690575200159'),
  P('p35', 'Pirinç 2 kg', 'Market', 'adet', 150, 1, '8690570340215'),
  P('p36', 'Toz şeker 1 kg', 'Market', 'adet', 55, 1, '8690557000312'),
  P('p37', 'Çay 1 kg', 'Market', 'adet', 320, 1, '8690637001405'),
  P('p38', 'Kahve 250 g', 'Market', 'adet', 280, 1, '8690637902012'),
  P('p39', 'Kola 1 L', 'İçecek', 'adet', 60, 20, '5449000054227'),
  P('p40', 'Portakallı gazoz 1 L', 'İçecek', 'adet', 55, 20, '5449000011527'),
  P('p41', 'Su 5 L', 'İçecek', 'adet', 45, 1, '8690552015005'),
  P('p42', 'Maden suyu 6\'lı', 'İçecek', 'adet', 90, 20, '8690558010601'),
  P('p43', 'Buz 2 kg', 'İçecek', 'adet', 40, 20)
];

const AGENCIES = [
  { id: 'a1', name: 'Ege Mavi Yatçılık', user: 'egemavi', person: 'Selin Aydın', phone: '0532 000 11 22' },
  { id: 'a2', name: 'Göcek Koy Charter', user: 'gocekkoy', person: 'Murat Er', phone: '0533 000 33 44' },
  { id: 'a3', name: 'Likya Rota Turizm', user: 'likyarota', person: 'Deniz Kaya', phone: '0535 000 55 66' }
];

const BOATS = [
  { id: 'b1', a: 'a1', name: 'Mavi Rüya' }, { id: 'b2', a: 'a1', name: 'Ece Sultan' },
  { id: 'b3', a: 'a1', name: 'Kaptan Rıza' }, { id: 'b4', a: 'a1', name: 'Su Perisi' },
  { id: 'b5', a: 'a2', name: 'Yıldız Koyu' }, { id: 'b6', a: 'a2', name: 'Ada Rüzgârı' },
  { id: 'b7', a: 'a2', name: 'Lodos' }, { id: 'b8', a: 'a3', name: 'Likya Prensesi' },
  { id: 'b9', a: 'a3', name: 'Gökova' }
];

const CUSTOMERS = [
  { id: 'c1', a: 'a1', name: 'Ahmet Yılmaz', taxNo: '1234567••••', email: 'ahmet@ornek.com', addr: 'Kadıköy / İstanbul' },
  { id: 'c2', a: 'a1', name: 'Mehmet Demir', taxNo: '2345678••••', email: 'mehmet@ornek.com', addr: 'Çankaya / Ankara' },
  { id: 'c3', a: 'a1', name: 'Cengiz Öztürk', taxNo: '3456789••••', email: 'cengiz@ornek.com', addr: 'Nilüfer / Bursa' },
  { id: 'c4', a: 'a2', name: 'Thomas Weber', taxNo: 'Pasaport, yabancı uyruklu', email: 'weber@ornek.de', addr: 'Köln / Almanya' },
  { id: 'c5', a: 'a2', name: 'Öz Kardeşler Tekstil Ltd. Şti.', taxNo: 'VKN 645••••••', email: 'muhasebe@ornek.com.tr', addr: 'Osmangazi / Bursa' },
  { id: 'c6', a: 'a3', name: 'Ayşe Korkmaz', taxNo: '4567890••••', email: 'ayse@ornek.com', addr: 'Karşıyaka / İzmir' }
];

const PLACES = ['Göcek Belediye İskelesi', 'Göcek Skopea Marina', 'Fethiye Ece Marina', 'Fethiye Kordon İskelesi'];

const STATUS = {
  yeni: 'Yeni sipariş',
  hazirlaniyor: 'Hazırlanıyor',
  teklif: 'Teklif gönderildi',
  onaylandi: 'Onaylandı',
  yuklendi: 'Tekneye yüklendi',
  faturalandi: 'Faturalandı'
};
const FLOW = ['yeni', 'hazirlaniyor', 'teklif', 'onaylandi', 'yuklendi', 'faturalandi'];

function dayStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function L(pid, qty, extra) {
  const p = PRODUCTS.find(x => x.id === pid);
  return Object.assign({ pid, qty, price: p.price, done: false, actual: null }, extra || {});
}

function seed() {
  const orders = [
    { id: 'o1', no: 1118, a: 'a1', b: 'b1', c: 'c1', date: dayStr(1), time: '09:00', place: PLACES[0], note: '8 kişilik grup, 1 vejetaryen misafir var.', status: 'yeni', version: 1, created: dayStr(0),
      lines: [L('p21', 2), L('p22', 3), L('p23', 1), L('p30', 1), L('p31', 2), L('p32', 1), L('p29', 3), L('p33', 4), L('p34', 2), L('p1', 2.5), L('p11', 3), L('p12', 2), L('p13', 1), L('p39', 12), L('p41', 6)] },
    { id: 'o2', no: 1117, a: 'a1', b: 'b2', c: 'c2', date: dayStr(1), time: '10:30', place: PLACES[1], note: '', status: 'hazirlaniyor', version: 1, created: dayStr(-1),
      lines: [L('p7', 3, { done: true, actual: 3.2 }), L('p8', 2, { done: true, actual: 2 }), L('p26', 2, { done: true }), L('p27', 1, { done: true }), L('p24', 1.5), L('p28', 1), L('p37', 1), L('p14', 8), L('p40', 6), L('p43', 4)] },
    { id: 'o3', no: 1116, a: 'a2', b: 'b5', c: 'c4', date: dayStr(0), time: '08:30', place: PLACES[2], note: 'Kahvaltılıklar ayrı kasada olsun.', status: 'teklif', version: 2, created: dayStr(-2),
      lines: [L('p2', 2, { done: true, actual: 2.1 }), L('p4', 3, { done: true, actual: 3 }), L('p16', 5, { done: true, actual: 5 }), L('p17', 3, { done: true, actual: 3 }), L('p26', 3, { done: true }), L('p21', 6, { done: true }), L('p38', 2, { done: true }), L('p42', 4, { done: true })] },
    { id: 'o4', no: 1115, a: 'a3', b: 'b8', c: 'c6', date: dayStr(0), time: '11:00', place: PLACES[3], note: '', status: 'onaylandi', version: 1, created: dayStr(-2),
      lines: [L('p3', 2, { done: true, actual: 2 }), L('p10', 1.5, { done: true, actual: 1.5 }), L('p20', 3, { done: true, actual: 3 }), L('p35', 2, { done: true }), L('p36', 2, { done: true }), L('p41', 10, { done: true })] },
    { id: 'o5', no: 1114, a: 'a2', b: 'b6', c: 'c5', date: dayStr(-1), time: '09:30', place: PLACES[1], note: '', status: 'yuklendi', version: 1, created: dayStr(-3),
      payment: { method: 'Havale', amount: 0, date: dayStr(-1) },
      lines: [L('p6', 3, { done: true, actual: 3 }), L('p9', 2, { done: true, actual: 2 }), L('p11', 4, { done: true, actual: 4 }), L('p19', 5, { done: true }), L('p25', 2, { done: true }), L('p39', 24, { done: true }), L('p43', 6, { done: true })] },
    { id: 'o6', no: 1107, a: 'a1', b: 'b3', c: 'c3', date: dayStr(-4), time: '09:00', place: PLACES[0], note: '', status: 'faturalandi', version: 1, created: dayStr(-6),
      payment: { method: 'Nakit', amount: 0, date: dayStr(-4) }, invoiceId: 'f1',
      lines: [L('p1', 3, { done: true, actual: 3 }), L('p7', 2, { done: true, actual: 2 }), L('p21', 4, { done: true }), L('p26', 2, { done: true }), L('p30', 1, { done: true }), L('p15', 6, { done: true, actual: 6 }), L('p41', 8, { done: true })] }
  ];
  const s = { products: PRODUCTS, agencies: AGENCIES, boats: BOATS, customers: CUSTOMERS.slice(), orders, invoices: [], seq: { order: 1119, invoice: 58, customer: 7 } };
  const o5 = orders[4]; o5.payment.amount = total(o5);
  const o6 = orders[5]; o6.payment.amount = total(o6);
  s.invoices.push({ id: 'f1', no: 'MKU2026000000057', orderId: 'o6', date: dayStr(-4), type: 'e-Arşiv', amount: total(o6) });
  return s;
}

/* --- saklama --- */
let S;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); return; } } catch (e) { /* özel pencere vb. */ }
  S = seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* saklanamazsa sayfa yine çalışır */ } }
function resetDemo() { try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch (e) {} S = seed(); save(); }
load();

/* --- yardımcılar --- */
const $ = (q, el) => (el || document).querySelector(q);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => (Math.round(n * 100) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
const qtyTxt = (q, u) => (Number.isInteger(q) ? q : q.toLocaleString('tr-TR', { maximumFractionDigits: 2 })) + ' ' + u;
const trDate = d => { const [y, m, g] = d.split('-'); return g + '.' + m + '.' + y; };
const dayLabel = d => d === dayStr(0) ? 'Bugün' : d === dayStr(1) ? 'Yarın' : d === dayStr(-1) ? 'Dün' : trDate(d);

const prod = id => S.products.find(p => p.id === id);
const agency = id => S.agencies.find(a => a.id === id);
const boat = id => S.boats.find(b => b.id === id);
const cust = id => S.customers.find(c => c.id === id);
const order = id => S.orders.find(o => o.id === id);

function lineQty(l) { return l.actual != null ? l.actual : l.qty; }
function lineTotal(l) { return lineQty(l) * l.price; }
function total(o) { return o.lines.reduce((t, l) => t + lineTotal(l), 0); }
function kdvSplit(o) {
  const m = {};
  o.lines.forEach(l => { const k = prod(l.pid).kdv; m[k] = (m[k] || 0) + lineTotal(l); });
  return Object.keys(m).map(k => { const gross = m[k]; const net = gross / (1 + k / 100); return { k, net, vat: gross - net }; });
}
const stTag = s => `<span class="st st-${s}">${STATUS[s]}</span>`;

function toast(msg) {
  const old = $('.toast'); if (old) old.remove();
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
}

function modal(html, onReady) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m || e.target.dataset.close != null) m.remove(); });
  document.body.appendChild(m);
  const f = m.querySelector('input,select,button'); if (f) f.focus();
  if (onReady) onReady(m);
  return m;
}

function screensMenu() {
  const w = document.createElement('div'); w.className = 'screens';
  w.innerHTML = `<button type="button" aria-expanded="false">Ekranlar</button>
  <nav class="hide" aria-label="Demo ekranları">
    <a href="index.html">Demo girişi</a>
    <div class="sep"></div>
    <a href="acente.html">Acente: siparişlerim</a>
    <a href="acente.html#yeni">Acente: yeni sipariş</a>
    <div class="sep"></div>
    <a href="panel.html#ozet">Panel: özet</a>
    <a href="panel.html#teklifler">Panel: teklifler</a>
    <a href="panel.html#hazirlik/o2">Panel: barkodla hazırlık</a>
    <a href="panel.html#faturalar">Panel: faturalar</a>
    <a href="panel.html#urunler">Panel: ürünler</a>
    <a href="panel.html#acenteler">Panel: acenteler ve tekneler</a>
    <a href="panel.html#raporlar">Panel: raporlar</a>
    <div class="sep"></div>
    <a href="#" data-reset>Demoyu baştan başlat</a>
  </nav>`;
  const b = w.querySelector('button'), n = w.querySelector('nav');
  b.onclick = () => { n.classList.toggle('hide'); b.setAttribute('aria-expanded', !n.classList.contains('hide')); };
  w.querySelector('[data-reset]').onclick = e => { e.preventDefault(); resetDemo(); location.href = 'index.html'; };
  document.body.appendChild(w);
}
document.addEventListener('DOMContentLoaded', screensMenu);
