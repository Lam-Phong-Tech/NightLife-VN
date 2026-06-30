/* eslint-disable */
/* nightlife.hn — Theme engine (Sáng/Tối) dùng chung cho prototype.
   Mọi màn chỉ dùng inline style; engine remap màu nền/chữ/viền theo bảng tối.
   Thiết kế: HAI phép biến đổi THUẦN & idempotent (sáng→tối và tối→sáng qua bản đồ nghịch đảo),
   không lưu "bản gốc" -> không thể kẹt màu khi toggle qua lại, và highlight động vẫn đổi đúng.
   - Khớp CẢ #hex LẪN rgb(...) (framework chuẩn hoá style thành rgb).
   - Giữ nguyên: tím #6d28d9, chữ trắng, gradient hero, ảnh, rgba overlay, màu trạng thái lạ.
   Nạp SAU support.js: <script src="<path>/theme.js"></script> */
(function () {
  var BG = {
    '#e7e5df': '#0f0d15', '#fff': '#1b1726', '#ffffff': '#1b1726', '#fafafa': '#1b1726',
    '#f5f4f2': '#15121e', '#f3f2f5': '#262131', '#faf9fc': '#201b2c', '#f9f8fb': '#201b2c',
    '#f1ebff': '#2a2342', '#f6f4fb': '#241f33', '#f6f1ff': '#241f33', '#fdeef5': '#2e1f2a',
    '#f1f0f3': '#2a2436', '#f4f3f6': '#2a2436',
    '#e6f7ee': '#11301e', '#fdefd6': '#362a12', '#fde7ea': '#371b20', '#fff7ed': '#2f2614',
    '#fde3c4': '#463614', '#fce4ef': '#34182a', '#e0f2f5': '#103036'
  };
  var TX = {
    '#1f1d29': '#ece9f4', '#2b2a26': '#ece9f4', '#2b2a33': '#ece9f4', '#1a1030': '#ece9f4',
    '#5b5870': '#aaa5bd', '#6e6b64': '#aaa5bd', '#5a5870': '#aaa5bd',
    '#8a879a': '#938fa6', '#8a8780': '#938fa6', '#6b6b6b': '#938fa6',
    '#a8a5b4': '#7c798c', '#a8a59d': '#7c798c', '#9a98a6': '#7c798c', '#b6b3c0': '#6d6a7c'
  };
  var BD = {
    '#ececec': '#322c40', '#e2e0e8': '#322c40', '#e0d6f7': '#3b3060', '#e3e0da': '#2a2638',
    '#f1f0f3': '#2a2436', '#f4f3f6': '#2a2436', '#f1cdd3': '#5a2f37', '#ece4fb': '#2f2747',
    '#eee': '#322c40', '#eeeeee': '#322c40', '#fde3c4': '#463614'
  };

  function hexKey(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length < 6) return null;
    return parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16);
  }
  function fwd(map) { var c = {}; for (var k in map) { var key = hexKey(k); if (key) c[key] = map[k]; } return c; }   // light(rgbkey) -> dark hex
  function inv(map) { var c = {}; for (var k in map) { var key = hexKey(map[k]); if (key && !(key in c)) c[key] = k; } return c; } // dark(rgbkey) -> light hex (first wins)
  var BGc = fwd(BG), TXc = fwd(TX), BDc = fwd(BD);
  var BGi = inv(BG), TXi = inv(TX), BDi = inv(BD);

  function tokKey(tok) {
    if (tok.charAt(0) === '#') return hexKey(tok);
    var m = tok.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return m ? (+m[1]) + ',' + (+m[2]) + ',' + (+m[3]) : null;
  }
  function mapColors(val, c) {
    return val.replace(/#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi, function (tok) {
      var k = tokKey(tok); return (k && c[k]) ? c[k] : tok;
    });
  }
  function transform(s, dark) {
    if (!s) return s;
    return s.split(';').map(function (decl) {
      var i = decl.indexOf(':'); if (i < 0) return decl;
      var prop = decl.slice(0, i), val = decl.slice(i + 1), p = prop.trim().toLowerCase();
      if (/gradient|url\(/i.test(val)) return decl;
      var c = p.indexOf('background') >= 0 ? (dark ? BGc : BGi)
        : p === 'color' ? (dark ? TXc : TXi)
        : p.indexOf('border') >= 0 ? (dark ? BDc : BDi) : null;
      if (c) val = mapColors(val, c);
      return prop + ':' + val;
    }).join(';');
  }

  var applying = false, scheduled = false, btn = null, observer = null;
  function isDark() { try { return localStorage.getItem('nl_theme') === 'dark'; } catch (e) { return false; } }

  // Tắt transition trong lúc đổi theme -> chuyển màu tức thì, không fade .14s.
  var notrans = null, notransTimer = null;
  function freezeTransitions() {
    if (!notrans) { notrans = document.createElement('style'); notrans.textContent = '*{transition:none !important;}'; }
    if (!notrans.parentNode) (document.head || document.documentElement).appendChild(notrans);
    if (notransTimer) clearTimeout(notransTimer);
    notransTimer = setTimeout(function () { if (notrans && notrans.parentNode) notrans.parentNode.removeChild(notrans); }, 160);
  }

  function walk() {
    var dark = isDark();
    var els = document.body.querySelectorAll('[style]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (btn && (el === btn || btn.contains(el))) continue;
      var cur = el.getAttribute('style');
      var want = transform(cur, dark);   // thuần & idempotent theo cả 2 chiều
      if (cur !== want) el.setAttribute('style', want);
    }
    if (dark) { document.documentElement.style.background = '#0f0d15'; document.body.style.background = '#0f0d15'; }
    else { document.documentElement.style.background = ''; document.body.style.background = ''; }
  }

  function apply() {
    applying = true;
    freezeTransitions();
    if (observer) observer.disconnect();
    try { walk(); } catch (e) {}
    styleBtn();
    if (observer) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    applying = false;
  }
  function schedule() { if (scheduled) return; scheduled = true; setTimeout(function () { scheduled = false; apply(); }, 60); }

  function styleBtn() {
    if (!btn) return;
    var dark = isDark();
    btn.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:99999;display:flex;align-items:center;gap:8px;cursor:pointer;' +
      'font-family:var(--nl-font-sans);font-size:13px;font-weight:600;border-radius:24px;padding:10px 16px;user-select:none;' +
      'box-shadow:0 6px 20px rgba(0,0,0,.22);transition:transform .14s ease;' +
      (dark ? 'background:#2a2342;color:#f0ecfb;border:1px solid #3b3060;' : 'background:#fff;color:#5b5870;border:1px solid #ececec;');
    btn.innerHTML = '<img src="https://img.icons8.com/ios-filled/100/' + (dark ? 'FFD66B/sun--v1' : '6D28D9/crescent-moon') +
      '.png" style="width:17px;height:17px;" alt=""><span>' + (dark ? 'Sáng' : 'Tối') + '</span>';
  }

  function makeBtn() {
    btn = document.getElementById('nl-theme-btn');
    if (btn) return;
    btn = document.createElement('div');
    btn.id = 'nl-theme-btn';
    btn.title = 'Chuyển chế độ Sáng / Tối';
    btn.addEventListener('mouseenter', function () { btn.style.transform = 'translateY(-2px)'; });
    btn.addEventListener('mouseleave', function () { btn.style.transform = 'none'; });
    btn.addEventListener('click', function () {
      try { localStorage.setItem('nl_theme', isDark() ? 'light' : 'dark'); } catch (e) {}
      apply();
    });
    document.body.appendChild(btn);
    styleBtn();
  }

  function init() {
    if (!document.body) { setTimeout(init, 30); return; }
    makeBtn();
    observer = new MutationObserver(function () {
      if (applying) return;
      if (!document.getElementById('nl-theme-btn')) document.body.appendChild(btn);
      schedule();   // re-áp sau mỗi render; ở chế độ sáng đây là no-op (transform idempotent)
    });
    apply();
    setTimeout(apply, 120); setTimeout(apply, 400); setTimeout(apply, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
