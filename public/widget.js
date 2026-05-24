/* Neurobots.io – Embeddable AI Lead Capture Widget v1.0 */
(function () {
  'use strict';

  var scriptEl = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  var src = scriptEl ? scriptEl.src : '';
  var idMatch = src.match(/[?&]id=([^&]+)/);
  var businessId = idMatch ? decodeURIComponent(idMatch[1]) : null;
  if (!businessId) return;

  // Derive base URL so the widget talks back to the same domain it was served from
  var baseUrl = src.replace(/\/widget\.js.*$/, '');

  var cfg = { ai_name: 'AI Assistant', ai_greeting: 'Hi! How can I help you today?', accent_color: '#0EA5FF' };
  var history = []; // { role: 'user'|'assistant', content: string }
  var isOpen = false;
  var isLoading = false;
  var leadCaptured = false;

  // ── Shadow DOM host ──────────────────────────────────────────────────────
  var host = document.createElement('div');
  host.setAttribute('id', 'nb-host');
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;';
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });

  function makeStyles(accent) {
    var el = document.createElement('style');
    el.textContent = [
      '*{box-sizing:border-box;margin:0;padding:0;}',

      // Button
      '#nb-btn{width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;',
      'background:', accent, ';box-shadow:0 4px 24px ', accent, '55;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:transform .2s,box-shadow .2s;position:relative;}',
      '#nb-btn:hover{transform:scale(1.08);box-shadow:0 8px 32px ', accent, '77;}',
      '#nb-btn svg{width:26px;height:26px;}',
      '#nb-badge{position:absolute;top:-2px;right:-2px;width:13px;height:13px;',
      'border-radius:50%;background:#22C55E;border:2px solid #fff;}',

      // Panel
      '#nb-panel{position:absolute;bottom:72px;right:0;width:380px;',
      'background:#06080F;border-radius:20px;',
      'border:1px solid rgba(255,255,255,.1);',
      'box-shadow:0 24px 80px rgba(0,0,0,.65);',
      'display:flex;flex-direction:column;overflow:hidden;',
      'transform-origin:bottom right;',
      'transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;',
      'opacity:0;transform:scale(.82) translateY(12px);pointer-events:none;max-height:560px;}',
      '#nb-panel.nb-open{opacity:1;transform:scale(1) translateY(0);pointer-events:all;}',

      // Header
      '#nb-hd{padding:14px 16px;display:flex;align-items:center;gap:10px;',
      'background:linear-gradient(180deg,', accent, '1a,transparent);',
      'border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}',
      '#nb-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;position:relative;',
      'background:linear-gradient(135deg,', accent, ',', accent, '88);}',
      '#nb-dot{position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;',
      'border-radius:50%;background:#22C55E;border:2px solid #06080F;}',
      '#nb-nm{font-size:14px;font-weight:600;color:#EEF0FF;font-family:inherit;}',
      '#nb-sub{font-size:11px;color:rgba(238,240,255,.45);margin-top:2px;}',
      '#nb-x{margin-left:auto;width:28px;height:28px;border-radius:8px;',
      'background:none;border:none;cursor:pointer;color:rgba(238,240,255,.35);',
      'display:flex;align-items:center;justify-content:center;',
      'transition:background .15s,color .15s;}',
      '#nb-x:hover{background:rgba(255,255,255,.08);color:#EEF0FF;}',

      // Messages
      '#nb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;',
      'gap:10px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent;}',
      '#nb-msgs::-webkit-scrollbar{width:3px;}',
      '#nb-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}',

      '.nb-m{max-width:83%;padding:10px 13px;border-radius:14px;',
      'font-size:13px;line-height:1.5;word-break:break-word;',
      'animation:nb-in .22s ease;}',
      '.nb-bot{align-self:flex-start;background:rgba(255,255,255,.07);color:#EEF0FF;',
      'border-bottom-left-radius:3px;}',
      '.nb-usr{align-self:flex-end;background:', accent, ';color:#06080F;font-weight:500;',
      'border-bottom-right-radius:3px;}',

      // Typing indicator
      '.nb-typing{align-self:flex-start;padding:12px 16px;',
      'background:rgba(255,255,255,.07);border-radius:14px;border-bottom-left-radius:3px;',
      'display:flex;gap:5px;align-items:center;}',
      '.nb-typing span{width:6px;height:6px;border-radius:50%;',
      'background:rgba(238,240,255,.35);animation:nb-bounce 1.2s infinite;}',
      '.nb-typing span:nth-child(2){animation-delay:.2s;}',
      '.nb-typing span:nth-child(3){animation-delay:.4s;}',

      // Success
      '#nb-ok{flex:1;display:none;flex-direction:column;align-items:center;',
      'justify-content:center;padding:28px;gap:14px;text-align:center;}',
      '#nb-ok .nb-ok-ico{font-size:52px;animation:nb-pop .4s cubic-bezier(.34,1.56,.64,1);}',
      '#nb-ok h3{font-size:17px;font-weight:700;color:#EEF0FF;}',
      '#nb-ok p{font-size:13px;color:rgba(238,240,255,.5);line-height:1.55;}',

      // Input
      '#nb-ia{padding:12px 14px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;}',
      '#nb-frm{display:flex;align-items:center;gap:8px;}',
      '#nb-inp{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);',
      'border-radius:10px;padding:9px 12px;font-size:13px;color:#EEF0FF;outline:none;',
      'resize:none;font-family:inherit;line-height:1.4;transition:border-color .15s;',
      'scrollbar-width:none;}',
      '#nb-inp:focus{border-color:', accent, '66;}',
      '#nb-inp::placeholder{color:rgba(238,240,255,.3);}',
      '#nb-snd{width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;',
      'background:', accent, ';display:flex;align-items:center;justify-content:center;',
      'flex-shrink:0;transition:opacity .15s,transform .15s;}',
      '#nb-snd:hover{opacity:.85;transform:scale(1.06);}',
      '#nb-snd:disabled{opacity:.35;cursor:default;transform:none;}',

      '#nb-pw{text-align:center;font-size:10px;color:rgba(238,240,255,.18);',
      'padding:4px 0 8px;flex-shrink:0;}',
      '#nb-pw a{color:rgba(238,240,255,.28);text-decoration:none;}',

      '@keyframes nb-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '@keyframes nb-bounce{0%,60%,100%{transform:none}30%{transform:translateY(-5px)}}',
      '@keyframes nb-pop{from{transform:scale(0)}to{transform:scale(1)}}',

      '@media(max-width:440px){#nb-panel{width:calc(100vw - 32px);right:-12px;}}',
    ].join('');
    return el;
  }

  function buildDOM() {
    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div id="nb-panel">',
        '<div id="nb-hd">',
          '<div id="nb-av"><div id="nb-dot"></div></div>',
          '<div>',
            '<div id="nb-nm"></div>',
            '<div id="nb-sub"><span style="color:#22C55E">●</span> replies in seconds</div>',
          '</div>',
          '<button id="nb-x" aria-label="Close">',
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">',
              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
            '</svg>',
          '</button>',
        '</div>',
        '<div id="nb-msgs"></div>',
        '<div id="nb-ok">',
          '<div class="nb-ok-ico">✅</div>',
          '<h3>We\'ve got your info!</h3>',
          '<p>Our team will be in touch with you shortly.</p>',
        '</div>',
        '<div id="nb-ia">',
          '<form id="nb-frm">',
            '<textarea id="nb-inp" rows="1" placeholder="Type your message…"></textarea>',
            '<button type="submit" id="nb-snd" aria-label="Send">',
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06080F" stroke-width="2.5" stroke-linecap="round">',
                '<line x1="22" y1="2" x2="11" y2="13"/>',
                '<polygon points="22 2 15 22 11 13 2 9 22 2"/>',
              '</svg>',
            '</button>',
          '</form>',
        '</div>',
        '<div id="nb-pw">Powered by <a href="https://neurobots.io" target="_blank" rel="noopener">Neurobots</a></div>',
      '</div>',

      '<button id="nb-btn" aria-label="Chat with us">',
        '<div id="nb-badge"></div>',
        '<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">',
          '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
        '</svg>',
      '</button>',
    ].join('');
    return wrap;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  var $ = function (id) { return shadow.getElementById(id); };

  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'nb-m ' + (role === 'user' ? 'nb-usr' : 'nb-bot');
    div.textContent = text;
    $('nb-msgs').appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'nb-typing';
    el.id = 'nb-typing-ind';
    el.innerHTML = '<span></span><span></span><span></span>';
    $('nb-msgs').appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    var el = $('nb-typing-ind');
    if (el) el.remove();
  }

  function scrollToBottom() {
    var msgs = $('nb-msgs');
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setLoading(val) {
    isLoading = val;
    var snd = $('nb-snd');
    if (snd) snd.disabled = val;
  }

  function showSuccess() {
    leadCaptured = true;
    $('nb-msgs').style.display = 'none';
    $('nb-ia').style.display = 'none';
    var ok = $('nb-ok');
    ok.style.display = 'flex';
    // Show badge on button
    $('nb-badge').style.display = 'block';
  }

  // ── API ───────────────────────────────────────────────────────────────────
  function fetchConfig() {
    fetch(baseUrl + '/api/widget/' + businessId, { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        cfg = data;
        // Re-inject updated styles
        var oldStyle = shadow.querySelector('style');
        if (oldStyle) oldStyle.replaceWith(makeStyles(cfg.accent_color));
        // Update AI name in header
        var nm = $('nb-nm');
        if (nm) nm.textContent = cfg.ai_name;
      })
      .catch(function () {}); // fail silently — defaults stay
  }

  function sendMessage(userText) {
    if (!userText.trim() || isLoading || leadCaptured) return;

    history.push({ role: 'user', content: userText });
    addMessage('user', userText);

    setLoading(true);
    showTyping();

    fetch(baseUrl + '/api/widget/' + businessId + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then(function (data) {
        hideTyping();
        history.push({ role: 'assistant', content: data.message });
        addMessage('assistant', data.message);
        if (data.leadCaptured) {
          setTimeout(showSuccess, 1200);
        }
      })
      .catch(function () {
        hideTyping();
        addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      })
      .finally(function () {
        setLoading(false);
      });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  shadow.appendChild(makeStyles(cfg.accent_color));
  var domWrap = buildDOM();
  while (domWrap.firstChild) shadow.appendChild(domWrap.firstChild);

  // Set initial AI name
  var nmEl = $('nb-nm');
  if (nmEl) nmEl.textContent = cfg.ai_name;

  // Fetch real config
  fetchConfig();

  // Show initial greeting after short delay when opened for first time
  var greetingShown = false;
  function showGreeting() {
    if (greetingShown) return;
    greetingShown = true;
    setTimeout(function () {
      showTyping();
      setTimeout(function () {
        hideTyping();
        var greeting = cfg.ai_greeting || 'Hi! How can I help you today?';
        history.push({ role: 'assistant', content: greeting });
        addMessage('assistant', greeting);
      }, 900);
    }, 350);
  }

  // Toggle panel
  function toggleOpen() {
    isOpen = !isOpen;
    var panel = $('nb-panel');
    if (isOpen) {
      panel.classList.add('nb-open');
      showGreeting();
      setTimeout(function () {
        var inp = $('nb-inp');
        if (inp) inp.focus();
      }, 320);
    } else {
      panel.classList.remove('nb-open');
    }
  }

  $('nb-btn').addEventListener('click', toggleOpen);
  $('nb-x').addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen = true;
    toggleOpen();
  });

  // Form submit
  $('nb-frm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('nb-inp');
    var val = inp.value.trim();
    if (!val) return;
    inp.value = '';
    inp.style.height = 'auto';
    sendMessage(val);
  });

  // Auto-resize textarea
  $('nb-inp').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Enter to send (Shift+Enter for newline)
  $('nb-inp').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('nb-frm').dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  // Expose minimal public API
  window.NeuroBots = window.NeuroBots || {};
  window.NeuroBots.open = function () { if (!isOpen) toggleOpen(); };
  window.NeuroBots.close = function () { if (isOpen) toggleOpen(); };
})();
