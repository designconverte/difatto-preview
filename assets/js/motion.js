/* ==========================================================================
   DIFATTO · movimento
   Discreto e rápido (styleguide, seção 07), sem biblioteca:
   · reveal ao rolar: 600 ms, opacity 0→1, Y 24→0, IntersectionObserver com
     limiar .15 e stagger de 80 ms entre vizinhos (o CSS faz a transição);
   · título do hero: linhas saindo de uma máscara, uma vez;
   · palavra rotativa do hero: 2,4 s, fade + 8 px. Para depois de três
     voltas no "estilosa" (conteúdo que se move sozinho por mais de 5 s
     precisa parar: WCAG 2.2.2) e pausa fora da tela;
   · contadores da faixa de prova;
   · profundidade leve na mídia do hero, só desktop com mouse.
   O app.js dá a partida depois de montar a página. Com movimento reduzido
   tudo aparece na hora (o CSS garante) e nada aqui roda.
   ========================================================================== */

(() => {
  'use strict';

  const raiz = document.documentElement;
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Entradas ─────────────────────────────────────────────────────────── */

  const STAGGER = 80;
  let observador = null;

  function revelar(escopo = document) {
    const alvos = Array.from(escopo.querySelectorAll('[data-anima]:not(.is-visivel)'));
    if (semMovimento || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('is-visivel'));
      return;
    }
    if (!observador) {
      observador = new IntersectionObserver((entradas) => {
        // Quem entra no mesmo quadro ganha atraso em escada, por pai.
        const porPai = new Map();
        entradas.filter((e) => e.isIntersecting).forEach((e) => {
          const pai = e.target.parentElement;
          porPai.set(pai, (porPai.get(pai) || 0) + 1);
          const ordem = porPai.get(pai) - 1;
          e.target.style.setProperty('--atraso', `${Math.min(ordem * STAGGER, 480)}ms`);
          e.target.classList.add('is-visivel');
          observador.unobserve(e.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    }
    alvos.forEach((el) => observador.observe(el));
  }

  /* ── Hero ─────────────────────────────────────────────────────────────── */

  function linhasDoTitulo() {
    const titulo = document.querySelector('[data-anima-linhas]');
    if (!titulo) return;
    /* Cada linha (separada por <br>) vira uma máscara. O split é por <br>,
       nunca dentro de tag, então a palavra rotativa sobrevive inteira. */
    titulo.innerHTML = titulo.innerHTML
      .split(/<br\s*\/?>/i)
      .map((l, i) => `<span class="hero__linha" style="--l:${i}"><span>${l.trim()}</span></span>`)
      .join('');
  }

  function palavraRotativa() {
    const caixa = document.querySelector('[data-rotativa]');
    if (!caixa) return;
    const palavras = Array.from(caixa.children);
    if (palavras.length < 2) return;

    const INTERVALO = 2400;
    const PASSOS = palavras.length * 3; // três voltas e para na primeira
    let atual = 0;
    let dados = 0;
    let visivel = true;
    let relogio = null;

    const trocar = () => {
      if (!visivel || document.hidden) return;
      const saindo = palavras[atual];
      atual = (atual + 1) % palavras.length;
      dados += 1;
      saindo.classList.remove('is-ativa');
      saindo.classList.add('is-saindo');
      setTimeout(() => saindo.classList.remove('is-saindo'), 400);
      palavras[atual].classList.add('is-ativa');
      if (dados >= PASSOS) clearInterval(relogio);
    };

    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(caixa);
    setTimeout(() => { relogio = setInterval(trocar, INTERVALO); }, 1200);
  }

  /* ── Contadores ───────────────────────────────────────────────────────── */

  function contadores() {
    const alvos = document.querySelectorAll('[data-contador]');
    const obs = new IntersectionObserver((entradas, o) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        o.unobserve(e.target);
        const alvo = Number(e.target.dataset.contador);
        if (!Number.isFinite(alvo) || alvo <= 1) return;
        const inicio = performance.now();
        const DURACAO = 1200;
        const passo = (agora) => {
          const t = Math.min(1, (agora - inicio) / DURACAO);
          const suave = 1 - (1 - t) ** 3;
          e.target.textContent = String(Math.round(alvo * suave));
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.6 });
    alvos.forEach((el) => obs.observe(el));
  }

  /* ── Profundidade no hero (desktop com mouse) ─────────────────────────── */

  function profundidade() {
    if (!matchMedia('(min-width: 1025px) and (pointer: fine)').matches) return;
    const midia = document.querySelector('.hero__midia');
    const hero = document.querySelector('.hero');
    if (!midia || !hero) return;
    let pendente = false;
    const aplicar = () => {
      pendente = false;
      const altura = hero.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / altura));
      midia.style.transform = `translate3d(0, ${(p * 8).toFixed(2)}%, 0) scale(${(1 + p * 0.06).toFixed(4)})`;
    };
    addEventListener('scroll', () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(aplicar);
    }, { passive: true });
  }

  /* ── Seção atual no menu ──────────────────────────────────────────────── */

  function menuAtivo() {
    const links = Array.from(document.querySelectorAll('.header__link'));
    const secoes = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const link = links.find((l) => l.getAttribute('href') === `#${e.target.id}`);
        if (!link) return;
        if (e.isIntersecting) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secoes.forEach((s) => obs.observe(s));
  }

  let iniciado = false;
  function iniciar() {
    if (iniciado) return;
    iniciado = true;

    if (!semMovimento) linhasDoTitulo();
    raiz.classList.add('motion-ok');
    revelar();
    menuAtivo();
    if (semMovimento) return;
    palavraRotativa();
    contadores();
    profundidade();
  }

  // API usada pelo app.js. `recalcular` e `travarScroll` ficam por
  // compatibilidade com o framework (sem Lenis/ScrollTrigger, não há o que fazer).
  window.DF_MOTION = { iniciar, revelar, recalcular: () => {}, travarScroll: () => {} };

  // Se o app.js já terminou (ordem de carga inesperada), parte agora.
  if (window.DF_APP_PRONTO) iniciar();
})();
