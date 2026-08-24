/* ═══════════════════════════════════════════════════════════
   NOVO MUNDO CARRÃO II — 2.0
   Interações, simulador MCMV e validação de formulário
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';

/* ── Configuração ───────────────────────────────────────────
   Preencha `whatsapp` com o número no formato internacional
   (ex.: '5511987654321') para que o formulário abra a conversa
   já preenchida. Vazio = apenas mensagem de sucesso na tela.
   `endpoint` aceita uma URL de POST (CRM, Formspree, n8n…).
──────────────────────────────────────────────────────────── */
const CONFIG = {
  whatsapp: '',
  endpoint: ''
};

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BRL = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });

/* ═══ 1. Preloader ═══════════════════════════════════════ */
(() => {
  const el = $('#preloader');
  if (!el) return;
  const hide = () => el.classList.add('is-done');

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', () => setTimeout(hide, 250));
  else
    setTimeout(hide, 250);

  // trava de segurança: nunca segura a tela além de 2,5s, mesmo se
  // uma fonte externa ou o mapa do Google nunca responderem
  setTimeout(hide, 2500);
})();

/* ═══ 2. Cursor customizado ══════════════════════════════ */
(() => {
  if (reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const cur = $('#cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  }, { passive:true });

  (function loop(){
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  const hot = 'a,button,input,select,label,.tile,[data-magnetic]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hot)) cur.classList.add('is-hot');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hot)) cur.classList.remove('is-hot');
  });
})();

/* ═══ 3. Barra de progresso + header ═════════════════════ */
(() => {
  const bar = $('#progress'), nav = $('#nav'), dock = $('.dock');
  let last = 0, ticking = false;

  const update = () => {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 420 && y > last && !$('#drawer').classList.contains('is-open'));
    dock?.classList.toggle('is-up', y > innerHeight * 0.7);

    last = y;
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive:true });
  update();
})();

/* ═══ 4. Menu mobile ═════════════════════════════════════ */
(() => {
  const burger = $('#burger'), drawer = $('#drawer');
  const toggle = force => {
    const open = force ?? !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle());
  $$('#drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
})();

/* ═══ 5. Reveal on scroll ════════════════════════════════ */
(() => {
  const items = $$('.reveal');
  $$('.gallery .reveal').forEach((el, i) => el.style.setProperty('--i', i));

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
})();

/* ═══ 6. Contadores ══════════════════════════════════════ */
(() => {
  const nums = $$('[data-count]');
  if (!nums.length) return;

  const run = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    const dur = 1400, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((es, obs) => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
  }, { threshold:0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ═══ 7. Parallax ════════════════════════════════════════ */
(() => {
  const els = $$('[data-parallax]');
  if (reduced || !els.length) return;
  let ticking = false;

  const move = () => {
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const center = r.top + r.height / 2 - innerHeight / 2;
      el.style.translate = `0 ${(-center * +el.dataset.parallax).toFixed(1)}px`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(move); ticking = true; }
  }, { passive:true });
  move();
})();

/* ═══ 8. Botões magnéticos ═══════════════════════════════ */
(() => {
  if (reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.34;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ═══ 9. Lightbox da galeria ═════════════════════════════ */
(() => {
  const tiles = $$('.tile');
  const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap');
  if (!tiles.length || !lb) return;
  let idx = 0;

  const show = i => {
    idx = (i + tiles.length) % tiles.length;
    img.src = tiles[idx].dataset.img;
    img.alt = tiles[idx].dataset.cap;
    cap.textContent = tiles[idx].dataset.cap;
  };
  const open = i => {
    show(i); lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    tiles[idx].focus();
  };

  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft')  show(idx - 1);
  });
})();

/* ═══ 10. Simulador Minha Casa Minha Vida ════════════════
   Modelo SAC. Faixas e juros conforme regras do programa
   (aproximação educativa — a proposta oficial é da Caixa).
──────────────────────────────────────────────────────────── */
(() => {
  const renda = $('#renda'), valor = $('#valor'), fgts = $('#fgts'), prazo = $('#prazo');
  if (!renda) return;

  const out = {
    renda: $('#rendaOut'), valor: $('#valorOut'), fgts: $('#fgtsOut'),
    parcela: $('#parcela'), faixa: $('#faixa'), subsidio: $('#subsidio'),
    juros: $('#juros'), financiado: $('#financiado'),
    alerta: $('#alerta'), ring: $('#ring'), ringPct: $('#ringPct')
  };

  // faixa → { nome, juros a.a., subsídio máximo }
  const faixaDe = r => {
    if (r <= 2640)  return { nome:'Faixa 1', juros:0.0425, subMax:55000 };
    if (r <= 4400)  return { nome:'Faixa 2', juros:0.0625, subMax:20000 };
    if (r <= 8000)  return { nome:'Faixa 3', juros:0.0825, subMax:0 };
    return              { nome:'Faixa 4', juros:0.1050, subMax:0 };
  };

  // subsídio decai conforme a renda avança dentro da faixa
  const subsidioDe = (r, f) => {
    if (!f.subMax) return 0;
    const piso = f.nome === 'Faixa 1' ? 1600 : 2640;
    const teto = f.nome === 'Faixa 1' ? 2640 : 4400;
    const t = Math.min(Math.max((r - piso) / (teto - piso), 0), 1);
    return Math.round((f.subMax * (1 - t * 0.75)) / 500) * 500;
  };

  const fill = el => {
    const p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--fill', p + '%');
  };

  const calc = () => {
    const r  = +renda.value;
    const v  = +valor.value;
    const e  = +fgts.value;
    const n  = +prazo.value;

    const f   = faixaDe(r);
    const sub = subsidioDe(r, f);

    // valor efetivamente financiado
    let pv = Math.max(v - e - sub, 0);
    // teto usual de financiamento: 80% do valor do imóvel
    pv = Math.min(pv, v * 0.8);

    const i = Math.pow(1 + f.juros, 1 / 12) - 1;   // juros mensal equivalente
    const amort = pv / n;
    const parcela = Math.round(amort + pv * i);     // 1ª parcela no SAC

    const pct = r > 0 ? (parcela / r) * 100 : 0;

    out.renda.textContent = BRL.format(r);
    out.valor.textContent = BRL.format(v);
    out.fgts.textContent  = BRL.format(e);

    out.parcela.textContent    = BRL.format(parcela);
    out.faixa.textContent      = f.nome;
    out.subsidio.textContent   = sub ? BRL.format(sub) : 'Não se aplica';
    out.juros.textContent      = (f.juros * 100).toFixed(2).replace('.', ',') + '% a.a.';
    out.financiado.textContent = BRL.format(pv);

    const shown = Math.min(pct, 100);
    out.ring.style.setProperty('--pct', shown.toFixed(0));
    out.ringPct.textContent = Math.round(pct) + '%';

    out.alerta.classList.remove('is-warn', 'is-ok');
    if (pct > 30) {
      out.alerta.classList.add('is-warn');
      out.alerta.textContent = `A parcela ficaria em ${Math.round(pct)}% da renda — acima dos 30% aceitos pela Caixa. Aumente a entrada, o prazo, ou some a renda de um cônjuge.`;
    } else if (pct > 0) {
      out.alerta.classList.add('is-ok');
      out.alerta.textContent = `Comprometimento de ${Math.round(pct)}% da renda — dentro do limite de 30% da Caixa.`;
    }
  };

  [renda, valor, fgts].forEach(el => {
    fill(el);
    el.addEventListener('input', () => { fill(el); calc(); });
  });
  prazo.addEventListener('change', calc);
  calc();
})();

/* ═══ 11. Formulário ═════════════════════════════════════ */
(() => {
  const form = $('#form');
  if (!form) return;

  const nome  = $('#f-nome'), fone = $('#f-fone'),
        email = $('#f-email'), rnd = $('#f-renda'), lgpd = $('#f-lgpd');

  /* máscara de telefone */
  fone.addEventListener('input', () => {
    let d = fone.value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 6)      d = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    else if (d.length > 2) d = `(${d.slice(0,2)}) ${d.slice(2)}`;
    else if (d.length)     d = `(${d}`;
    fone.value = d;
  });

  const setErr = (el, msg) => {
    el.classList.toggle('is-bad', !!msg);
    const slot = $(`.err[data-for="${el.id}"]`);
    if (slot) slot.textContent = msg || '';
    return !msg;
  };

  const check = () => {
    const digits = fone.value.replace(/\D/g, '');
    const ok = [
      setErr(nome,  nome.value.trim().length < 3 ? 'Informe seu nome completo.' : ''),
      setErr(fone,  digits.length < 10 ? 'Informe um WhatsApp com DDD.' : ''),
      setErr(email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.value.trim()) ? '' : 'Informe um e-mail válido.'),
      setErr(rnd,   rnd.value ? '' : 'Selecione a faixa de renda.')
    ].every(Boolean);

    if (!lgpd.checked) { lgpd.focus(); return false; }
    return ok;
  };

  [nome, fone, email, rnd].forEach(el =>
    el.addEventListener('blur', () => { if (el.value) check(); })
  );

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!check()) { form.querySelector('.is-bad')?.focus(); return; }

    const data = {
      nome: nome.value.trim(),
      whatsapp: fone.value,
      email: email.value.trim(),
      renda: rnd.value,
      origem: 'Site Novo Mundo Carrão II 2.0'
    };

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Enviando…';

    if (CONFIG.endpoint) {
      try {
        await fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch { /* segue para o fallback visual */ }
    }

    form.reset();
    $('#formOk').hidden = false;
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Receber informações';

    if (CONFIG.whatsapp) {
      const msg = encodeURIComponent(
        `Olá! Sou ${data.nome} e tenho interesse no Novo Mundo Carrão II. ` +
        `Renda familiar: ${data.renda}. E-mail: ${data.email}.`
      );
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, '_blank', 'noopener');
    }
  });
})();

/* ═══ 12. Miscelânea ═════════════════════════════════════ */
$('#ano').textContent = new Date().getFullYear();

})();
