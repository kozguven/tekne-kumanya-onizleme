/* Acente ekranı: giriş, siparişlerim, yeni sipariş, sipariş ayrıntısı */
let me = null;
try { me = sessionStorage.getItem('acente'); } catch (e) {}
let draft = null;

const view = $('#view');
const setTitle = (t, sub) => { $('#title').innerHTML = esc(t) + (sub ? `<div class="sub">${esc(sub)}</div>` : ''); };

function go(h) { if (location.hash === '#' + h) route(); else location.hash = h; }
window.addEventListener('hashchange', route);
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
$('#back').onclick = () => history.length > 1 ? history.back() : go('liste');
$('#logout').onclick = () => { me = null; try { sessionStorage.removeItem('acente'); } catch (e) {} go('giris'); };

function route() {
  const [r, id] = location.hash.slice(1).split('/');
  if (!me) return viewLogin();
  $('#tabs').classList.remove('hide'); $('#logout').classList.remove('hide');
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === (r || 'liste')));
  $('#back').classList.toggle('hide', !(r === 'siparis'));
  if (r === 'yeni') return viewNew();
  if (r === 'siparis' && order(id)) return viewOrder(id);
  viewList();
}

/* --- giriş --- */
const ROLES = { acente: 'Acente', tekne: 'Tekne sahibi', bireysel: 'Bireysel müşteri' };
const typeOf = a => a.type || 'acente';
let role = 'acente';
function viewLogin() {
  $('#tabs').classList.add('hide'); $('#logout').classList.add('hide'); $('#back').classList.add('hide');
  setTitle('Mavi Kumanya', ROLES[role] + ' girişi');
  const list = S.agencies.filter(a => typeOf(a) === role);
  view.innerHTML = `
    <h2 style="margin:6px 0 4px">Hoş geldiniz</h2>
    <p class="muted" style="margin-bottom:14px">Kumanya siparişinizi buradan verin, teklif ve teslim durumunu takip edin.</p>
    <div class="roles" role="tablist">${Object.entries(ROLES).map(([k, v]) => `<button type="button" role="tab" aria-selected="${k === role}" data-role="${k}" class="${k === role ? 'on' : ''}">${v}</button>`).join('')}</div>
    <label class="f"><span>Hesap (demo için seçin)</span>
      <select class="inp" id="ag">${list.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label>
    <label class="f"><span>Kullanıcı adı veya telefon</span><input class="inp" id="u" value="${esc(list[0].user)}" autocomplete="off"></label>
    <label class="f"><span>Şifre</span><input class="inp" type="password" value="demo1234" autocomplete="off"></label>
    <button class="btn block" id="in">Giriş yap</button>
    ${role === 'bireysel' ? `<button class="btn alt block" id="su" style="margin-top:10px">Üye ol</button>` : ''}
    <p class="small muted" style="margin-top:14px">${{
      acente: 'Acente hesaplarını Mavi Kumanya açar; acente yalnız kendi siparişlerini görür ve faturayı teknenin müşterisi adına ister.',
      tekne: 'Tekne sahipleri kendi teknelerine sipariş verir; fatura kendi firmalarına ya da misafirlerine kesilebilir.',
      bireysel: 'Bireysel müşteri kendisi üye olur; fatura doğrudan kendi adına kesilir. İsterseniz yeni üyeler onayınızdan sonra sipariş verebilir.'
    }[role]}</p>`;
  view.querySelectorAll('[data-role]').forEach(b => b.onclick = () => { role = b.dataset.role; viewLogin(); });
  $('#ag').onchange = e => { $('#u').value = agency(e.target.value).user; };
  $('#in').onclick = () => login($('#ag').value);
  const su = $('#su'); if (su) su.onclick = signUp;
}
function login(id) { me = id; try { sessionStorage.setItem('acente', me); } catch (e) {} go('liste'); }
function signUp() {
  modal(`<h3>Üye ol</h3>
    <label class="f"><span>Ad soyad veya firma unvanı</span><input class="inp" id="n" value="Selim Arslan"></label>
    <label class="f"><span>Cep telefonu</span><input class="inp" id="t" inputmode="tel" value="0537 000 99 00"></label>
    <label class="f"><span>E-posta</span><input class="inp" id="e" type="email" value="selim@ornek.com"></label>
    <label class="f"><span>T.C. kimlik no / vergi no</span><input class="inp" inputmode="numeric" value="5678901••••"></label>
    <label style="display:flex;gap:8px;align-items:flex-start;font-size:14px"><input type="checkbox" checked style="margin-top:4px"> Aydınlatma metnini okudum, bilgilerimin sipariş ve fatura için kullanılmasını onaylıyorum.</label>
    <div class="acts"><button class="btn alt" data-close>Vazgeç</button><button class="btn" id="sv">Üyeliği tamamla</button></div>`, m => {
    m.querySelector('#sv').onclick = () => { m.remove(); toast('Demo: telefonunuza gelen kodla üyelik doğrulanır.'); login('a5'); };
  });
}

/* --- siparişlerim --- */
function viewList() {
  const a = agency(me);
  setTitle('Siparişlerim', a.name + (typeOf(a) === 'acente' ? '' : ', ' + ROLES[typeOf(a)].toLocaleLowerCase('tr')));
  const mine = S.orders.filter(o => o.a === me).sort((x, y) => y.no - x.no);
  view.innerHTML = `
    <div class="olist">${mine.map(o => `
      <button type="button" class="o" data-id="${o.id}">
        <div class="l1"><span class="boat">${esc(boat(o.b).name)}</span>${stTag(o.status)}</div>
        <div class="l2">${esc(cust(o.c).name)}, teslim ${dayLabel(o.date)} ${o.time}</div>
        <div class="l3"><span class="muted">No ${o.no}</span><span class="num">${money(total(o))}</span></div>
      </button>`).join('') || '<p class="muted">Henüz siparişiniz yok.</p>'}
    </div>
    <button class="btn flag block" style="margin-top:6px" data-new>Yeni sipariş ver</button>`;
  view.querySelectorAll('.o').forEach(b => b.onclick = () => go('siparis/' + b.dataset.id));
  $('[data-new]').onclick = () => go('yeni');
}

/* --- yeni sipariş: 3 adım --- */
function viewNew() {
  if (!draft || draft.a !== me) draft = { a: me, step: 1, b: '', c: '', items: {}, cat: CATS[0], q: '', date: dayStr(1), time: '09:00', place: PLACES[0], note: '' };
  setTitle('Yeni sipariş', agency(me).name);
  const bar = `<div class="wiz">${[1, 2, 3].map(i => `<div class="${i <= draft.step ? 'on' : ''}"></div>`).join('')}</div>`;
  if (draft.step === 1) return step1(bar);
  if (draft.step === 2) return step2(bar);
  step3(bar);
}

function step1(bar) {
  const boats = S.boats.filter(b => b.a === me), custs = S.customers.filter(c => c.a === me);
  const solo = typeOf(agency(me)) === 'bireysel';
  if (solo) draft.c = custs[0].id;
  view.innerHTML = bar + `
    <h2 style="margin-bottom:4px">${solo ? 'Tekne' : 'Tekne ve müşteri'}</h2>
    <p class="muted small" style="margin-bottom:14px">${solo ? 'Fatura sizin adınıza kesilir: ' + esc(custs[0].name) + '.' : typeOf(agency(me)) === 'acente' ? 'Fatura acenteye değil, seçtiğiniz müşteriye kesilir.' : 'Fatura seçtiğiniz kişi veya firma adına kesilir.'}</p>
    <label class="f"><span>Tekne</span><select class="inp" id="b"><option value="">Tekne seçin</option>
      ${boats.map(b => `<option value="${b.id}" ${draft.b === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></label>
    <button type="button" class="linkbtn" id="nb">Tekne ekle</button>
    ${solo ? '' : `<label class="f" style="margin-top:10px"><span>Fatura kesilecek müşteri</span><select class="inp" id="c"><option value="">Müşteri seçin</option>
      ${custs.map(c => `<option value="${c.id}" ${draft.c === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
    <button type="button" class="linkbtn" id="nc">Yeni müşteri ekle</button>`}
    <button class="btn block" id="nx" style="margin-top:18px">Ürünleri seç</button>`;
  $('#b').onchange = e => draft.b = e.target.value;
  if (!solo) { $('#c').onchange = e => draft.c = e.target.value; $('#nc').onclick = newCustomer; }
  $('#nb').onclick = () => modal(`<h3>Tekne ekle</h3><label class="f"><span>Tekne adı</span><input class="inp" id="bn"></label>
    <div class="acts"><button class="btn alt" data-close>Vazgeç</button><button class="btn" id="sv">Kaydet</button></div>`, m => {
    m.querySelector('#sv').onclick = () => { const n = m.querySelector('#bn').value.trim(); if (!n) return toast('Tekne adını yazın.');
      const id = 'b' + (S.seq.boat++); S.boats.push({ id, a: me, name: n }); save(); draft.b = id; m.remove(); viewNew(); };
  });
  $('#nx').onclick = () => {
    if (!draft.b || !draft.c) return toast('Tekne ve fatura kesilecek müşteriyi seçin.');
    draft.step = 2; viewNew();
  };
}

function newCustomer() {
  modal(`<h3>Yeni müşteri</h3>
    <label class="f"><span>Ad soyad veya firma unvanı</span><input class="inp" id="n"></label>
    <label class="f"><span>T.C. kimlik no / vergi no (yabancı uyruklu için pasaport)</span><input class="inp" id="t" inputmode="numeric"></label>
    <label class="f"><span>E-posta (fatura buraya gider)</span><input class="inp" id="e" type="email"></label>
    <label class="f"><span>Adres</span><input class="inp" id="ad"></label>
    <div class="acts"><button class="btn alt" data-close>Vazgeç</button><button class="btn" id="sv">Kaydet</button></div>`, m => {
    m.querySelector('#sv').onclick = () => {
      const n = m.querySelector('#n').value.trim();
      if (!n) return toast('Müşteri adını yazın.');
      const id = 'c' + (S.seq.customer++);
      S.customers.push({ id, a: me, name: n, taxNo: m.querySelector('#t').value.trim(), email: m.querySelector('#e').value.trim(), addr: m.querySelector('#ad').value.trim() });
      save(); draft.c = id; m.remove(); viewNew(); toast('Müşteri eklendi.');
    };
  });
}

function step2(bar) {
  const q = draft.q.toLocaleLowerCase('tr');
  const list = S.products.filter(p => q ? p.name.toLocaleLowerCase('tr').includes(q) : p.cat === draft.cat);
  const cnt = Object.keys(draft.items).length;
  const sum = Object.entries(draft.items).reduce((t, [id, n]) => t + n * prod(id).price, 0);
  view.innerHTML = bar + `
    <h2 style="margin-bottom:8px">Ürünler</h2>
    <input class="inp" id="q" placeholder="Ürün ara (ör. yoğurt)" value="${esc(draft.q)}">
    <div class="cats">${CATS.map(c => `<button type="button" data-c="${esc(c)}" class="${!q && draft.cat === c ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>
    <div id="pl">${list.map(p => {
      const n = draft.items[p.id] || 0, step = p.unit === 'kg' ? 0.5 : 1;
      return `<div class="prod"><div class="nm"><b>${esc(p.name)}</b><small>${money(p.price)} / ${p.unit}</small></div>
        <div class="step"><button type="button" data-m="${p.id}" data-s="${step}" aria-label="${esc(p.name)} azalt">−</button>
        <input value="${n ? String(n).replace('.', ',') : ''}" placeholder="0" inputmode="decimal" data-i="${p.id}" aria-label="${esc(p.name)} miktarı">
        <button type="button" data-p="${p.id}" data-s="${step}" aria-label="${esc(p.name)} artır">+</button></div></div>`;
    }).join('') || '<p class="muted" style="padding:12px 0">Ürün bulunamadı.</p>'}</div>
    <div class="cartbar"><span>${cnt} ürün, <b class="num">${money(sum)}</b></span>
      <span style="display:flex;gap:8px"><button class="btn sm alt" id="pv">Geri</button><button class="btn sm flag" id="nx" ${cnt ? '' : 'disabled'}>Devam</button></span></div>`;
  const qi = $('#q');
  qi.oninput = e => { draft.q = e.target.value; const pos = e.target.selectionStart; viewNew(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
  view.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { draft.cat = b.dataset.c; draft.q = ''; viewNew(); });
  const setN = (id, n) => { n = Math.max(0, Math.round(n * 100) / 100); if (n) draft.items[id] = n; else delete draft.items[id]; viewNew(); };
  view.querySelectorAll('[data-p]').forEach(b => b.onclick = () => setN(b.dataset.p, (draft.items[b.dataset.p] || 0) + +b.dataset.s));
  view.querySelectorAll('[data-m]').forEach(b => b.onclick = () => setN(b.dataset.m, (draft.items[b.dataset.m] || 0) - +b.dataset.s));
  view.querySelectorAll('[data-i]').forEach(i => i.onchange = () => setN(i.dataset.i, parseFloat(i.value.replace(',', '.')) || 0));
  $('#pv').onclick = () => { draft.step = 1; viewNew(); };
  $('#nx').onclick = () => { draft.step = 3; draft.q = ''; viewNew(); };
}

function step3(bar) {
  const items = Object.entries(draft.items);
  const sum = items.reduce((t, [id, n]) => t + n * prod(id).price, 0);
  view.innerHTML = bar + `
    <h2 style="margin-bottom:10px">Teslim ve özet</h2>
    <label class="f"><span>Teslim tarihi</span><input class="inp" type="date" id="d" value="${draft.date}"></label>
    <label class="f"><span>Saat</span><input class="inp" type="time" id="tm" value="${draft.time}"></label>
    <label class="f"><span>Teslim yeri</span><select class="inp" id="pl">${PLACES.map(p => `<option ${p === draft.place ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></label>
    <label class="f"><span>Not</span><textarea class="inp" id="nt" rows="2" placeholder="Ör. alerjisi olan misafir, ayrı paketleme">${esc(draft.note)}</textarea></label>
    <div class="card">
      <b>${esc(boat(draft.b).name)}</b>, ${esc(cust(draft.c).name)}
      <div style="margin-top:8px">${items.map(([id, n]) => `<div class="sumrow small"><span>${esc(prod(id).name)}, ${qtyTxt(n, prod(id).unit)}</span><span class="num">${money(n * prod(id).price)}</span></div>`).join('')}</div>
      <div class="sumrow tot"><span>Tahmini tutar</span><span class="num">${money(sum)}</span></div>
      <p class="small muted">Gramajlı ürünlerde kesin tutar tartımdan sonra teklifte netleşir.</p>
    </div>
    <p class="small muted" style="margin:14px 0 8px">İsterseniz önce müşterinize tahmini teklif PDF'ini gönderin; müşteri kabul edince siparişi tek tuşla Mavi Kumanya'ya iletirsiniz.</p>
    <button class="btn block" id="cust">Müşteriye tahmini teklif gönder</button>
    <div style="display:flex;gap:10px;margin-top:10px"><button class="btn alt" id="pv">Geri</button><button class="btn flag" style="flex:1" id="send">Siparişi doğrudan gönder</button></div>`;
  $('#d').onchange = e => draft.date = e.target.value;
  $('#tm').onchange = e => draft.time = e.target.value;
  $('#pl').onchange = e => draft.place = e.target.value;
  $('#nt').oninput = e => draft.note = e.target.value;
  $('#pv').onclick = () => { draft.step = 2; viewNew(); };
  const create = status => {
    const id = 'o' + Date.now();
    S.orders.push({ id, no: S.seq.order++, a: me, b: draft.b, c: draft.c, date: draft.date, time: draft.time, place: draft.place, note: draft.note,
      status, version: 1, created: dayStr(0), lines: items.map(([pid, n]) => L(pid, n)) });
    save(); draft = null; return id;
  };
  $('#send').onclick = () => { const id = create('yeni'); toast('Siparişiniz iletildi. Teklif hazır olunca burada görünecek.'); go('siparis/' + id); };
  $('#cust').onclick = () => { const id = create('musteri'); go('siparis/' + id); custPdf(id); };
}

/* --- sipariş ayrıntısı --- */
function viewOrder(id) {
  const o = order(id), idx = FLOW.indexOf(o.status);
  setTitle(boat(o.b).name, 'Sipariş ' + o.no);
  const canApprove = o.status === 'teklif', atCust = o.status === 'musteri';
  view.innerHTML = `
    <div style="margin-bottom:12px">${stTag(o.status)}</div>
    ${atCust ? `<div class="card" style="margin-bottom:12px;border-color:var(--sea)">
      <b>Müşteri onayı bekleniyor</b><p class="small muted" style="margin:4px 0 10px">Tahmini teklif PDF'ini müşterinize gönderin. Müşteri kabul edince siparişi Mavi Kumanya'ya iletin; hazırlık o zaman başlar.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt sm" id="pdfc">Tahmini teklifi gönder</button><button class="btn sm okb" id="acc">Müşteri kabul etti, siparişi gönder</button></div></div>` : ''}
    <div class="card" style="margin-bottom:12px">
      <div class="sumrow"><span class="muted">Müşteri</span><b>${esc(cust(o.c).name)}</b></div>
      <div class="sumrow"><span class="muted">Teslim</span><span>${dayLabel(o.date)} ${o.time}</span></div>
      <div class="sumrow"><span class="muted">Yer</span><span>${esc(o.place)}</span></div>
      ${o.note ? `<div class="sumrow"><span class="muted">Not</span><span>${esc(o.note)}</span></div>` : ''}
    </div>
    ${canApprove ? `<div class="card" style="margin-bottom:12px;border-color:var(--sea)">
      <b>Teklif hazır (sürüm ${o.version})</b><p class="small muted" style="margin:4px 0 10px">Ürünler tartıldı, kesin tutar aşağıda. Onayladığınızda hazırlık tekneye yüklenmek üzere planlanır.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn alt sm" href="belge.html?tip=teklif&id=${o.id}">Teklif PDF'ini gör</a><button class="btn sm okb" id="ok">Teklifi onayla</button></div></div>` : ''}
    <div class="card" style="margin-bottom:12px">
      ${o.lines.map(l => `<div class="sumrow small"><span>${esc(prod(l.pid).name)}, ${qtyTxt(lineQty(l), prod(l.pid).unit)}</span><span class="num">${money(lineTotal(l))}</span></div>`).join('')}
      <div class="sumrow tot"><span>${idx >= 2 ? 'Teklif tutarı' : 'Tahmini tutar'}</span><span class="num">${money(total(o))}</span></div>
    </div>
    <div class="card">
      <b>Durum</b>
      <ul class="timeline"><li class="${atCust || o.wasCust ? 'done' : ''}">Müşteri onayı (isteğe bağlı)</li>${FLOW.map((s, i) => `<li class="${i <= idx ? 'done' : ''}">${STATUS[s]}</li>`).join('')}</ul>
      ${o.invoiceId ? `<a class="btn alt sm" style="margin-top:10px" href="belge.html?tip=fatura&id=${o.id}">Faturayı gör</a>` : ''}
    </div>`;
  if (atCust) {
    $('#pdfc').onclick = () => custPdf(o.id);
    $('#acc').onclick = () => { o.status = 'yeni'; o.wasCust = true; save(); toast('Müşteri kabul etti. Sipariş Mavi Kumanya\'ya iletildi.'); route(); };
  }
  if (canApprove) $('#ok').onclick = () => { o.status = 'onaylandi'; save(); toast('Teklif onaylandı.'); route(); };
}

function custPdf(id) {
  modal(`<h3>Tahmini teklif hazır</h3>
    <p>${esc(cust(order(id).c).name)} için tahmini tutarlı teklif PDF'i oluşturuldu. Müşterinize WhatsApp'tan gönderebilirsiniz; kabul edince siparişi bize iletirsiniz.</p>
    <div class="acts" style="justify-content:flex-start"><button class="btn" data-wa>WhatsApp'tan paylaş</button><a class="btn alt" href="belge.html?tip=teklif&id=${id}">PDF'i gör</a></div>
    <div class="acts"><button class="btn alt" data-close>Kapat</button></div>`, m => {
    m.querySelector('[data-wa]').onclick = () => toast('Gerçek sistemde telefonun paylaşım menüsü açılır ve PDF müşteriye gider.');
  });
}

route();
