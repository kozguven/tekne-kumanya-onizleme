/* Yönetim paneli: özet, teklifler, teklif ayrıntısı, barkodla hazırlık, faturalar, ürünler, acenteler, raporlar */
const view = $('#view');
let filter = 'hepsi';

window.addEventListener('hashchange', route);
$('#msel').onchange = e => { location.hash = e.target.value; };

function route() {
  const [r, id] = (location.hash.slice(1) || 'ozet').split('/');
  const top = r === 'teklif' || r === 'hazirlik' ? 'teklifler' : r;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === top));
  if ([...$('#msel').options].some(o => o.value === top)) $('#msel').value = top;
  const n = S.orders.filter(o => o.status === 'yeni').length;
  $('#newc').textContent = n || ''; $('#newc').classList.toggle('hide', !n);
  window.scrollTo(0, 0);
  if (r === 'teklif' && order(id)) return viewOffer(id);
  if (r === 'hazirlik' && order(id)) return viewPrep(id);
  ({ teklifler: viewOffers, faturalar: viewInvoices, urunler: viewProducts, acenteler: viewAgencies, raporlar: viewReports }[r] || viewSummary)();
}

const orderRow = o => `<tr class="click" data-id="${o.id}">
  <td data-l="No"><b>${o.no}</b></td>
  <td data-l="Tekne">${esc(boat(o.b).name)}<div class="small muted">${esc(agency(o.a).name)}</div></td>
  <td data-l="Müşteri">${esc(cust(o.c).name)}</td>
  <td data-l="Teslim">${dayLabel(o.date)} ${o.time}</td>
  <td data-l="Durum">${stTag(o.status)}</td>
  <td data-l="Tutar" class="r num">${money(total(o))}</td></tr>`;
const orderTable = list => `<div class="tw"><table class="t resp"><thead><tr><th>No</th><th>Tekne / acente</th><th>Müşteri</th><th>Teslim</th><th>Durum</th><th class="r">Tutar</th></tr></thead>
  <tbody>${list.map(orderRow).join('') || '<tr><td colspan="6" class="muted">Kayıt yok.</td></tr>'}</tbody></table></div>`;
const bindRows = () => view.querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = () => location.hash = 'teklif/' + tr.dataset.id);

/* --- özet --- */
function viewSummary() {
  const today = S.orders.filter(o => o.date === dayStr(0) || o.date === dayStr(1)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const open = S.orders.filter(o => o.status === 'yuklendi' && !o.payment).reduce((t, o) => t + total(o), 0);
  const month = S.invoices.reduce((t, f) => t + f.amount, 0);
  view.innerHTML = `
    <div class="hd"><div><h1>Günaydın</h1><p>${trDate(dayStr(0))}, bugün ve yarın teslim edilecek siparişler</p></div>
      <a class="btn alt" href="acente.html">Acente ekranını aç</a></div>
    <div class="kpis">
      <div class="kpi"><div class="v">${S.orders.filter(o => o.status === 'yeni').length}</div><div class="k">Yeni sipariş</div></div>
      <div class="kpi"><div class="v">${S.orders.filter(o => o.status === 'hazirlaniyor').length}</div><div class="k">Hazırlanıyor</div></div>
      <div class="kpi"><div class="v num">${money(open)}</div><div class="k">Tahsil edilmemiş</div></div>
      <div class="kpi"><div class="v num">${money(month)}</div><div class="k">Bu ay faturalanan</div></div>
    </div>
    <div class="grid2">
      <div class="card"><h2 style="margin-bottom:10px">Bugün ve yarın</h2>${orderTable(today)}</div>
      <div class="card"><h2 style="margin-bottom:10px">Sıradaki işler</h2>
        ${S.orders.filter(o => o.status !== 'faturalandi').sort((a, b) => FLOW.indexOf(a.status) - FLOW.indexOf(b.status)).map(o => `
          <div class="sumrow" style="border-bottom:1px solid var(--line);padding:9px 0;gap:10px">
            <span><b>${esc(boat(o.b).name)}</b><br><span class="small muted">${nextStep(o)}</span></span>
            <a class="btn sm alt" href="#teklif/${o.id}">Aç</a></div>`).join('')}
      </div>
    </div>`;
  bindRows();
}
function nextStep(o) {
  return { musteri: 'Acentenin müşterisi onaylayacak', yeni: 'Hazırlığa başlanacak', hazirlaniyor: 'Barkodla hazırlık sürüyor', teklif: 'Acente onayı bekleniyor', onaylandi: 'Tekneye yüklenecek', yuklendi: o.payment ? 'Faturaya çevrilecek' : 'Ödeme alınacak' }[o.status] || '';
}

/* --- teklif listesi --- */
function viewOffers() {
  const list = S.orders.filter(o => filter === 'hepsi' || o.status === filter).sort((a, b) => b.no - a.no);
  view.innerHTML = `
    <div class="hd"><div><h1>Teklifler</h1><p>Acentelerden gelen her sipariş burada teklif olarak açılır.</p></div></div>
    <div class="filters">${['hepsi', 'musteri', ...FLOW].map(s => `<button type="button" data-f="${s}" class="${filter === s ? 'on' : ''}">${s === 'hepsi' ? 'Hepsi' : STATUS[s]} (${s === 'hepsi' ? S.orders.length : S.orders.filter(o => o.status === s).length})</button>`).join('')}</div>
    <div class="card">${orderTable(list)}</div>`;
  view.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; viewOffers(); });
  bindRows();
}

/* --- teklif ayrıntısı --- */
function viewOffer(id) {
  const o = order(id), c = cust(o.c), editable = FLOW.indexOf(o.status) < 4;
  const acts = {
    musteri: `<span class="small muted" style="align-self:center;max-width:300px">Acente tahmini teklifi müşteriye gönderdi; müşteri kabul edince sipariş "Yeni sipariş" olarak düşer.</span>`,
    yeni: `<a class="btn" href="#hazirlik/${o.id}" data-start>Hazırlığa başla</a><button class="btn alt" data-pdf>Teklif PDF'ini gönder</button>`,
    hazirlaniyor: `<a class="btn" href="#hazirlik/${o.id}">Barkodla hazırlık</a><button class="btn alt" data-pdf>Teklif PDF'ini gönder</button>`,
    teklif: `<button class="btn" data-approve>Onaylandı olarak işaretle</button><button class="btn alt" data-pdf>PDF'i yeniden gönder</button>`,
    onaylandi: `<button class="btn" data-load>Tekneye yüklendi</button>`,
    yuklendi: o.payment ? `<button class="btn flag" data-inv>Faturaya çevir</button>` : `<button class="btn" data-pay>Ödeme al</button><button class="btn flag" data-inv>Faturaya çevir</button>`,
    faturalandi: `<a class="btn" href="belge.html?tip=fatura&id=${o.id}">Faturayı gör</a>`
  }[o.status];
  view.innerHTML = `
    <div class="hd"><div><a href="#teklifler" class="small">Tekliflere dön</a><h1 style="margin-top:4px">Teklif ${o.no}, ${esc(boat(o.b).name)}</h1>
      <p>${stTag(o.status)} &nbsp;Sürüm ${o.version}${o.dirty ? ', kaydedilmemiş değişiklik var' : ''}</p></div>
      <div class="acts">${acts}<a class="btn alt" href="belge.html?tip=teklif&id=${o.id}">PDF önizleme</a></div></div>
    <div class="meta">
      <div><small>Acente</small><b>${esc(agency(o.a).name)}</b></div>
      <div><small>Fatura müşterisi</small><b>${esc(c.name)}</b><div class="small muted">${esc(c.taxNo)}</div></div>
      <div><small>Teslim</small><b>${dayLabel(o.date)} ${o.time}</b><div class="small muted">${esc(o.place)}</div></div>
      <div><small>Ödeme</small><b>${o.payment ? esc(o.payment.method) + ', ' + money(o.payment.amount) : 'Alınmadı'}</b></div>
    </div>
    ${o.note ? `<div class="card" style="margin-bottom:14px"><b>Acente notu:</b> ${esc(o.note)}</div>` : ''}
    <div class="card lines">
      <div class="tw"><table class="t"><thead><tr><th>Ürün</th><th class="r">Sipariş</th><th class="r">Tartılan / hazır</th><th class="r">Birim fiyat</th><th class="r">Tutar</th>${editable ? '<th></th>' : ''}</tr></thead><tbody>
      ${o.lines.map((l, i) => { const p = prod(l.pid); return `<tr>
        <td>${esc(p.name)}${l.done ? ' <span class="st st-faturalandi">Hazır</span>' : ''}</td>
        <td class="r">${editable ? `<input class="inp num" data-q="${i}" value="${String(l.qty).replace('.', ',')}" aria-label="${esc(p.name)} miktar"> ${p.unit}` : qtyTxt(l.qty, p.unit)}</td>
        <td class="r">${l.actual != null ? qtyTxt(l.actual, p.unit) : (l.done ? 'Hazır' : '<span class="muted">Bekliyor</span>')}</td>
        <td class="r">${editable ? `<input class="inp num" data-pr="${i}" value="${String(l.price).replace('.', ',')}" aria-label="${esc(p.name)} fiyat">` : money(l.price)}</td>
        <td class="r num">${money(lineTotal(l))}</td>
        ${editable ? `<td class="r"><button class="linkbtn" data-rm="${i}" aria-label="${esc(p.name)} sil">Sil</button></td>` : ''}</tr>`; }).join('')}
      </tbody></table></div>
      ${editable ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;align-items:center">
        <select class="inp" id="addp" style="max-width:320px"><option value="">Ürün ekle (ilave)</option>${S.products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
        <button class="btn alt sm" id="addb">Ekle</button></div>` : ''}
      <div class="sumrow tot" style="max-width:360px;margin-left:auto"><span>Toplam (KDV dahil)</span><span class="num">${money(total(o))}</span></div>
    </div>`;

  const changed = () => { o.dirty = true; save(); viewOffer(id); };
  view.querySelectorAll('[data-q]').forEach(i => i.onchange = () => { const l = o.lines[i.dataset.q]; l.qty = parseFloat(i.value.replace(',', '.')) || 0; if (!l.done) l.actual = null; changed(); });
  view.querySelectorAll('[data-pr]').forEach(i => i.onchange = () => { o.lines[i.dataset.pr].price = parseFloat(i.value.replace(',', '.')) || 0; changed(); });
  view.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { o.lines.splice(+b.dataset.rm, 1); changed(); });
  const ab = $('#addb'); if (ab) ab.onclick = () => { const v = $('#addp').value; if (!v) return; o.lines.push(L(v, 1)); changed(); toast('İlave ürün eklendi. PDF\'i yeniden gönderdiğinizde yeni sürüm olur.'); };

  const st = $('[data-start]'); if (st) st.onclick = () => { o.status = 'hazirlaniyor'; save(); };
  const pdf = $('[data-pdf]'); if (pdf) pdf.onclick = () => sendPdf(o);
  const ap = $('[data-approve]'); if (ap) ap.onclick = () => { o.status = 'onaylandi'; save(); toast('Teklif onaylandı.'); viewOffer(id); };
  const ld = $('[data-load]'); if (ld) ld.onclick = () => { o.status = 'yuklendi'; save(); toast('Tekneye yüklendi olarak kaydedildi.'); viewOffer(id); };
  const py = $('[data-pay]'); if (py) py.onclick = () => takePayment(o);
  const iv = $('[data-inv]'); if (iv) iv.onclick = () => makeInvoice(o);
}

function sendPdf(o) {
  if (o.status === 'teklif' && o.dirty) o.version++;
  o.dirty = false; o.status = 'teklif'; save();
  modal(`<h3>Teklif PDF'i hazır (sürüm ${o.version})</h3>
    <p>${esc(agency(o.a).name)} acentesine gönderilecek. Acente teklifi kendi ekranında da görür ve onaylayabilir.</p>
    <div class="acts" style="justify-content:flex-start">
      <button class="btn" data-wa>WhatsApp'tan paylaş</button><button class="btn alt" data-ml>E-postayla gönder</button>
      <a class="btn alt" href="belge.html?tip=teklif&id=${o.id}">PDF'i görüntüle</a></div>
    <div class="acts"><button class="btn alt" data-close>Kapat</button></div>`, m => {
    m.querySelector('[data-wa]').onclick = () => toast('Gerçek sistemde telefonun paylaşım menüsü açılır ve PDF WhatsApp\'tan acenteye gider.');
    m.querySelector('[data-ml]').onclick = () => toast('Demo: PDF acentenin e-posta adresine gönderildi.');
  });
  viewOffer(o.id);
}

function takePayment(o) {
  modal(`<h3>Ödeme al</h3>
    <label class="f"><span>Tutar</span><input class="inp num" id="am" value="${String(Math.round(total(o) * 100) / 100).replace('.', ',')}"></label>
    <label class="f"><span>Ödeme şekli</span><select class="inp" id="mt"><option>Nakit</option><option>Havale / EFT</option><option>Kredi kartı</option></select></label>
    <div class="acts"><button class="btn alt" data-close>Vazgeç</button><button class="btn" id="sv">Kaydet</button></div>`, m => {
    m.querySelector('#sv').onclick = () => {
      o.payment = { method: m.querySelector('#mt').value, amount: parseFloat(m.querySelector('#am').value.replace(',', '.')) || 0, date: dayStr(0) };
      save(); m.remove(); toast('Ödeme kaydedildi.'); viewOffer(o.id);
    };
  });
}

function makeInvoice(o) {
  const c = cust(o.c);
  modal(`<h3>Teklifi faturaya çevir</h3>
    <p class="small muted" style="margin-bottom:10px">Fatura acenteye değil, teknenin müşterisine kesilir.</p>
    <div class="sumrow"><span class="muted">Müşteri</span><b>${esc(c.name)}</b></div>
    <div class="sumrow"><span class="muted">T.C. / vergi no</span><span>${esc(c.taxNo) || '<span class="muted">Girilmemiş</span>'}</span></div>
    <div class="sumrow"><span class="muted">E-posta</span><span>${esc(c.email) || '-'}</span></div>
    <div class="sumrow tot"><span>Tutar (KDV dahil)</span><span class="num">${money(total(o))}</span></div>
    <label class="f" style="margin-top:12px"><span>Fatura türü</span><select class="inp" id="ty"><option>e-Arşiv</option><option>e-Fatura</option></select></label>
    <p class="small muted">Müşteri e-Fatura mükellefiyse sistem bunu entegratörden sorgulayıp e-Fatura seçer.</p>
    <div class="acts"><button class="btn alt" data-close>Vazgeç</button><button class="btn flag" id="sv">Faturayı kes</button></div>`, m => {
    m.querySelector('#sv').onclick = () => {
      const f = { id: 'f' + Date.now(), no: 'MKU2026' + String(S.seq.invoice++).padStart(9, '0'), orderId: o.id, date: dayStr(0), type: m.querySelector('#ty').value, amount: total(o) };
      S.invoices.push(f); o.invoiceId = f.id; o.status = 'faturalandi';
      if (!o.payment) o.payment = null;
      save(); m.remove();
      modal(`<h3>Fatura kesildi</h3><p>${esc(f.type)} fatura <b>${f.no}</b> oluşturuldu ve ${esc(c.email || 'müşteriye')} adresine gönderildi.</p>
        <p class="small muted" style="margin-top:8px">Demoda gerçek fatura kesilmez. Gerçek sistemde bu adımda fatura özel entegratör üzerinden GİB'e iletilir.</p>
        <div class="acts"><button class="btn alt" data-close>Kapat</button><a class="btn" href="belge.html?tip=fatura&id=${o.id}">Faturayı gör</a></div>`);
      viewOffer(o.id);
    };
  });
}

/* --- barkodla hazırlık --- */
function viewPrep(id) {
  const o = order(id);
  if (o.status === 'yeni') { o.status = 'hazirlaniyor'; save(); }
  const done = o.lines.filter(l => l.done).length, all = o.lines.length;
  view.innerHTML = `
    <div class="hd"><div><a href="#teklif/${o.id}" class="small">Teklife dön</a><h1 style="margin-top:4px">Hazırlık: ${esc(boat(o.b).name)}</h1>
      <p>Teklif ${o.no}, teslim ${dayLabel(o.date)} ${o.time}</p></div></div>
    <div class="card" style="margin-bottom:14px">
      <div class="scanbox">
        <input class="inp" id="bc" placeholder="Barkodu okutun veya yazın" inputmode="numeric" autocomplete="off" aria-label="Barkod">
        <button class="btn" id="cam">Kamerayla okut</button>
        <button class="btn alt" id="demo">Sıradaki ürünü okut (demo)</button>
      </div>
      <div class="sumrow small"><span>${done} / ${all} ürün hazır</span><span class="muted">Barkodu olmayan ürünü tartıp elle işaretleyin</span></div>
      <div class="prog"><div style="width:${all ? done / all * 100 : 0}%"></div></div>
    </div>
    <div id="pls">${o.lines.map((l, i) => { const p = prod(l.pid); return `
      <div class="pl ${l.done ? 'ok' : ''}" id="pl${i}">
        <div class="tick">${l.done ? '✓' : ''}</div>
        <div class="nm"><b>${esc(p.name)}</b><small>${qtyTxt(l.qty, p.unit)} istendi${p.barcode ? ', barkodlu' : ', barkodsuz'}</small></div>
        ${p.unit === 'kg' ? `<label class="w">Tartılan <input class="inp num" data-w="${i}" value="${String(l.actual != null ? l.actual : l.qty).replace('.', ',')}"> kg</label>` : ''}
        ${l.done ? `<button class="linkbtn" data-un="${i}">Geri al</button>` : `<button class="btn sm alt" data-mk="${i}">Elle işaretle</button>`}
      </div>`; }).join('')}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
      <button class="btn flag" id="fin" ${done === all ? '' : 'disabled'}>Hazırlık tamam, teklife dön</button>
      <span class="small muted" style="align-self:center">${done === all ? 'Tüm ürünler hazır.' : 'Eksik ürünler bitince etkinleşir; eksikle göndermek için teklif ekranından PDF\'i gönderebilirsiniz.'}</span></div>`;

  const mark = (i, how) => {
    const l = o.lines[i]; if (l.done) return;
    l.done = true; if (prod(l.pid).unit === 'kg' && l.actual == null) l.actual = l.qty;
    o.dirty = true; save(); viewPrep(id);
    const el = $('#pl' + i); if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    if (how) toast(how);
  };
  const scan = code => {
    code = code.trim(); if (!code) return;
    const i = o.lines.findIndex(l => prod(l.pid).barcode === code);
    if (i < 0) return toast('Bu barkod siparişte yok: ' + code);
    if (o.lines[i].done) return toast(prod(o.lines[i].pid).name + ' zaten okutuldu.');
    mark(i, prod(o.lines[i].pid).name + ' okutuldu.');
  };
  $('#bc').onkeydown = e => { if (e.key === 'Enter') { scan(e.target.value); } };
  $('#demo').onclick = () => {
    const i = o.lines.findIndex(l => !l.done && prod(l.pid).barcode);
    if (i < 0) return toast('Barkodlu ürünlerin hepsi okutuldu. Barkodsuzları elle işaretleyin.');
    scan(prod(o.lines[i].pid).barcode);
  };
  $('#cam').onclick = () => camera(scan);
  view.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => mark(+b.dataset.mk, 'Elle işaretlendi.'));
  view.querySelectorAll('[data-un]').forEach(b => b.onclick = () => { o.lines[+b.dataset.un].done = false; save(); viewPrep(id); });
  view.querySelectorAll('[data-w]').forEach(i => i.onchange = () => { o.lines[+i.dataset.w].actual = parseFloat(i.value.replace(',', '.')) || 0; o.dirty = true; save(); viewPrep(id); });
  $('#fin').onclick = () => { location.hash = 'teklif/' + o.id; toast('Hazırlık tamam. Tartılan gramajlarla teklif güncellendi.'); };
  if (matchMedia('(min-width:900px)').matches) $('#bc').focus();
}

async function camera(onCode) {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices) {
    return toast('Bu tarayıcı demoda kamerayla okumayı desteklemiyor; "Sıradaki ürünü okut" düğmesini kullanın. Gerçek sistem tüm telefonlarda çalışır.');
  }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); }
  catch (e) { return toast('Kamera izni verilmedi.'); }
  const box = document.createElement('div'); box.className = 'cam';
  box.innerHTML = '<video playsinline muted></video><p>Barkodu kameraya gösterin</p><button class="btn alt">Kapat</button>';
  document.body.appendChild(box);
  const v = box.querySelector('video'); v.srcObject = stream; await v.play();
  const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'upc_a'] });
  let on = true;
  const stop = () => { on = false; stream.getTracks().forEach(t => t.stop()); box.remove(); };
  box.querySelector('button').onclick = stop;
  (async function loop() {
    if (!on) return;
    try { const r = await det.detect(v); if (r.length) { stop(); onCode(r[0].rawValue); return; } } catch (e) {}
    setTimeout(loop, 250);
  })();
}

/* --- faturalar --- */
function viewInvoices() {
  view.innerHTML = `
    <div class="hd"><div><h1>Faturalar</h1><p>Tekliften tek tuşla kesilen e-Arşiv ve e-Fatura belgeleri.</p></div>
      <button class="btn alt" id="xl">Excel'e aktar (mali müşavir)</button></div>
    <div class="card"><div class="tw"><table class="t resp"><thead><tr><th>Fatura no</th><th>Tarih</th><th>Tür</th><th>Müşteri</th><th>Tekne</th><th class="r">Tutar</th></tr></thead><tbody>
    ${S.invoices.slice().reverse().map(f => { const o = order(f.orderId); return `<tr class="click" data-o="${o.id}">
      <td data-l="Fatura no"><b>${f.no}</b></td><td data-l="Tarih">${trDate(f.date)}</td><td data-l="Tür">${esc(f.type)}</td>
      <td data-l="Müşteri">${esc(cust(o.c).name)}</td><td data-l="Tekne">${esc(boat(o.b).name)}</td><td data-l="Tutar" class="r num">${money(f.amount)}</td></tr>`; }).join('')}
    </tbody></table></div></div>`;
  view.querySelectorAll('tr[data-o]').forEach(tr => tr.onclick = () => location.href = 'belge.html?tip=fatura&id=' + tr.dataset.o);
  $('#xl').onclick = () => toast('Gerçek sistemde seçilen dönemin faturaları Excel dosyası olarak iner.');
}

/* --- ürünler --- */
function viewProducts() {
  let q = '';
  const draw = () => {
    const ql = q.toLocaleLowerCase('tr');
    const list = S.products.filter(p => !ql || p.name.toLocaleLowerCase('tr').includes(ql) || p.barcode.includes(q));
    $('#tb').innerHTML = list.map(p => `<tr><td data-l="Ürün"><b>${esc(p.name)}</b></td><td data-l="Kategori">${esc(p.cat)}</td><td data-l="Birim">${p.unit}</td>
      <td data-l="Barkod" class="num">${p.barcode || '<span class="muted">Yok</span>'}</td><td data-l="KDV">%${p.kdv}</td><td data-l="Fiyat" class="r num">${money(p.price)}</td></tr>`).join('');
  };
  view.innerHTML = `
    <div class="hd"><div><h1>Ürünler</h1><p>${S.products.length} ürün. Gerçek listeniz Excel'den toplu yüklenir, fiyatlar toplu güncellenir.</p></div>
      <div class="acts"><button class="btn alt" id="im">Excel'den yükle</button><button class="btn" id="np">Yeni ürün</button></div></div>
    <div class="card"><input class="inp" id="pq" placeholder="Ürün adı veya barkod ara" style="max-width:360px;margin-bottom:10px">
      <div class="tw"><table class="t resp"><thead><tr><th>Ürün</th><th>Kategori</th><th>Birim</th><th>Barkod</th><th>KDV</th><th class="r">Fiyat</th></tr></thead><tbody id="tb"></tbody></table></div>
      <p class="small muted" style="margin-top:10px">Fiyat ve KDV oranları örnektir.</p></div>`;
  $('#pq').oninput = e => { q = e.target.value; draw(); };
  $('#im').onclick = () => toast('Gerçek sistemde Excel dosyanız seçilir; hatalı satırlar ayrı listelenir.');
  $('#np').onclick = () => toast('Demoda ürün ekleme kapalı; liste örnek verilerle gelir.');
  draw();
}

/* --- acenteler --- */
function viewAgencies() {
  view.innerHTML = `
    <div class="hd"><div><h1>Acenteler ve tekneler</h1><p>Her acentenin kendi girişi ve tekneleri vardır.</p></div></div>
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${S.agencies.map(a => `
      <div class="card"><h2>${esc(a.name)}</h2><p class="small muted">${esc(a.person)}, ${esc(a.phone)}<br>Kullanıcı adı: ${esc(a.user)}</p>
        <p style="margin-top:10px"><b>Tekneler:</b> ${S.boats.filter(b => b.a === a.id).map(b => esc(b.name)).join(', ')}</p>
        <p class="small" style="margin-top:6px"><b>Müşteriler:</b> ${S.customers.filter(c => c.a === a.id).map(c => esc(c.name)).join(', ')}</p>
        <p class="small muted" style="margin-top:6px">${S.orders.filter(o => o.a === a.id).length} sipariş</p></div>`).join('')}</div>`;
}

/* --- raporlar --- */
function viewReports() {
  const rows = S.agencies.map(a => {
    const os = S.orders.filter(o => o.a === a.id);
    const sales = os.filter(o => FLOW.indexOf(o.status) >= 4).reduce((t, o) => t + total(o), 0);
    const paid = os.filter(o => o.payment).reduce((t, o) => t + o.payment.amount, 0);
    return { a, n: os.length, sales, paid, open: Math.max(0, sales - paid) };
  });
  const qty = {};
  S.orders.forEach(o => o.lines.forEach(l => { qty[l.pid] = (qty[l.pid] || 0) + lineTotal(l); }));
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 8);
  view.innerHTML = `
    <div class="hd"><div><h1>Raporlar</h1><p>Acente ve tekne bazında satış, tahsilat ve açık bakiye.</p></div><button class="btn alt" id="xl">Excel'e aktar</button></div>
    <div class="grid2">
      <div class="card"><h2 style="margin-bottom:10px">Acente bazında</h2><div class="tw"><table class="t resp"><thead><tr><th>Acente</th><th class="r">Sipariş</th><th class="r">Teslim edilen</th><th class="r">Tahsil edilen</th><th class="r">Açık</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td data-l="Acente"><b>${esc(r.a.name)}</b></td><td data-l="Sipariş" class="r">${r.n}</td><td data-l="Teslim edilen" class="r num">${money(r.sales)}</td><td data-l="Tahsil edilen" class="r num">${money(r.paid)}</td><td data-l="Açık" class="r num">${money(r.open)}</td></tr>`).join('')}
      </tbody></table></div></div>
      <div class="card"><h2 style="margin-bottom:10px">En çok satan ürünler</h2>
        ${top.map(([id, v]) => `<div class="sumrow small" style="border-bottom:1px solid var(--line)"><span>${esc(prod(id).name)}</span><span class="num">${money(v)}</span></div>`).join('')}</div>
    </div>`;
  $('#xl').onclick = () => toast('Gerçek sistemde rapor Excel dosyası olarak iner.');
}

route();
