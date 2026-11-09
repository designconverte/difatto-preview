/* ==========================================================================
   DIFATTO · comportamento da página
   Framework estático (Green/KOM) com a realidade da DiFatto: preço e selo
   legal no card, modelo em mais de uma categoria, amostra de cor que leva à
   foto (como no popup do WordPress), mapa sob demanda e JSON-LD escrito a
   partir do mesmo dado que desenha a página.
   Sem dependências. O movimento vive em motion.js; nada aqui depende dele.
   ========================================================================== */

(() => {
  'use strict';

  const cfg = window.DF_CONFIG;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /** Lê 'endereco.completo' dentro do config, inclusive getters. */
  const pegar = (caminho) => caminho.split('.').reduce((o, k) => (o == null ? o : o[k]), cfg);

  const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* `**trecho**` vira <strong>. SEGURANÇA: escapa o texto inteiro ANTES; o par
     de asteriscos é a única marcação aceita, então nada do dado vira HTML. */
  const comNegrito = (texto) => escapar(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const semMarcacao = (texto) => String(texto).replace(/\*\*(.+?)\*\*/g, '$1');

  const semMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const ICONE_WHATS = '<svg aria-hidden="true"><use href="#i-whats"></use></svg>';
  const ICONE_CHECK = '<svg aria-hidden="true"><use href="#i-check"></use></svg>';
  const ICONE_ALERTA = '<svg aria-hidden="true"><use href="#i-alerta"></use></svg>';

  /* Avisa o tracking sem depender dele. Sem tracking.js o evento cai no vazio. */
  function emitir(nome, params = {}, opcoes = {}) {
    dispatchEvent(new CustomEvent('df:evento', { detail: { nome, params, opcoes } }));
  }

  /* Nome de evento do GA4: minúsculo, sem acento, só letra, número e
     underscore, no máximo 40 caracteres. Fora disso o GA4 descarta. */
  function slugEvento(texto) {
    return texto
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
  }

  /* Modelo com `oculto: true` no catalogo.js some de tudo que o visitante vê
     (vitrine, contagens, modal, JSON-LD); o dado e as fotos continuam lá. */
  const modelosAtivos = () => (window.DF_MODELOS || []).filter((m) => !m.oculto);

  const nomeCompleto = (m) => [m.fabricante, m.nome].filter(Boolean).join(' ');
  const categoriasDe = (m) => m.categorias || [];
  const cardDe = (m) => (window.DF_CARDS || {})[m.id] || { src: '', alt: m.nome, w: 640, h: 536 };

  /* Todo caminho para o WhatsApp de um modelo passa por aqui:
     1. `generate_lead`, a conversão (uma só, com o modelo em parâmetro);
     2. `btn_interesse_{modelo}`, só para segmentar no GA4. */
  function interesseNoModelo(modelo, origem, extras = {}) {
    if (!modelo) return;
    const dados = {
      origem,
      item_id: modelo.id,
      item_name: nomeCompleto(modelo),
      item_brand: modelo.fabricante || undefined,
      item_category: categoriasDe(modelo)[0],
      value: modelo.preco?.valor || undefined,
      currency: modelo.preco?.valor ? 'BRL' : undefined,
      ...extras,
    };
    emitir('generate_lead', dados);
    emitir(slugEvento(`btn_interesse_${nomeCompleto(modelo)}`), dados, { somenteGa4: true });
  }

  /** Monta o link do WhatsApp com a mensagem já preenchida. */
  function linkWhats(chave, trocas = {}) {
    let texto = cfg.mensagens[chave] || cfg.mensagens.geral;
    for (const [k, v] of Object.entries(trocas)) {
      texto = texto.replaceAll(`{${k}}`, v);
    }
    const prefixo = cfg.prefixoMensagem;
    if (prefixo && !texto.toLowerCase().startsWith(prefixo.toLowerCase())) texto = `${prefixo}. ${texto}`;
    const numero = chave === 'assistencia' ? (cfg.assistencia?.e164 || cfg.whatsapp.e164) : cfg.whatsapp.e164;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  }

  /* ── 1. Dados da loja no HTML ─────────────────────────────────────────── */

  function aplicarConfig() {
    $$('[data-config]').forEach((el) => { el.textContent = pegar(el.dataset.config) ?? ''; });
    $$('[data-config-href]').forEach((el) => { el.href = pegar(el.dataset.configHref) ?? '#'; });

    $$('[data-whats]').forEach((el) => {
      el.href = linkWhats(el.dataset.whats);
      el.target = '_blank';
      el.rel = 'noopener';
    });

    const rota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cfg.endereco.busca)}`;
    $$('[data-rota]').forEach((el) => { el.href = rota; });

    // Consentimento tem que ser tão fácil de retirar quanto de dar (LGPD).
    $('#rever-cookies')?.addEventListener('click', () => window.DF_CONSENTIMENTO?.reabrir());

    $$('[data-horarios]').forEach((el) => {
      el.textContent = cfg.horarios.confirmado
        ? (cfg.horarios[el.dataset.horarios] || cfg.horarios.vendas)
        : 'Horário de atendimento: consulte pelo WhatsApp';
    });

    // Números da faixa de prova contados do próprio dado: nunca envelhecem.
    const modelos = modelosAtivos();
    const totais = {
      modelos: modelos.length,
      'sem-cnh': modelos.filter((m) => m.classificacao === 'autopropelido').length,
    };
    $$('[data-total]').forEach((el) => {
      const valor = totais[el.dataset.total];
      if (valor == null) return;
      el.dataset.contador = String(valor);
      el.textContent = String(valor);
    });
    $$('[data-ano]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ── 2. Header, botão flutuante e balão ───────────────────────────────── */

  function scrollUI() {
    const header = $('#header');
    const flutuante = $('#flutuante');
    let ticking = false;

    // Sombra depois de 10 px de rolagem (styleguide).
    const atualizar = () => {
      header.classList.toggle('is-fixo', window.scrollY > 10);
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(atualizar);
    }, { passive: true });

    atualizar();
    requestAnimationFrame(() => flutuante?.classList.add('is-visivel'));
  }

  /* O balão de boas-vindas do site atual, com regra: só no desktop, uma vez
     por sessão, 12 s depois da carga, e nunca por cima do modal ou do aviso
     de cookies. O botão redondo continua levando direto ao WhatsApp. */
  function balao() {
    const raiz = $('#balao');
    if (!raiz || !matchMedia('(min-width: 761px)').matches) return;
    const CHAVE = 'df:balao';
    try { if (sessionStorage.getItem(CHAVE)) return; } catch (e) { /* segue */ }

    const fechar = () => {
      raiz.classList.remove('is-visivel');
      setTimeout(() => { raiz.hidden = true; }, 260);
      try { sessionStorage.setItem(CHAVE, '1'); } catch (e) { /* segue */ }
    };
    raiz.addEventListener('click', (e) => {
      if (e.target.closest('[data-fechar-balao]') || e.target.closest('a')) fechar();
    });

    setTimeout(() => {
      const ocupado = $('#modal')?.classList.contains('is-aberto') || $('#consentimento.is-visivel');
      if (ocupado) return;
      raiz.hidden = false;
      requestAnimationFrame(() => raiz.classList.add('is-visivel'));
    }, 12000);
  }

  /* ── 3. Menu mobile ───────────────────────────────────────────────────── */

  function menu() {
    const painel = $('#menu');
    const toggle = $('#menu-toggle');
    if (!painel || !toggle) return;

    $$('.menu__item-wrap', painel).forEach((item, i) => item.style.setProperty('--i', i));
    const corpo = $('.menu__painel', painel);
    const header = $('#header');

    const definir = (aberto) => {
      if (aberto) corpo.style.paddingTop = `${Math.round(header.getBoundingClientRect().bottom) + 24}px`;
      painel.classList.toggle('is-aberto', aberto);
      painel.setAttribute('aria-hidden', String(!aberto));
      toggle.setAttribute('aria-expanded', String(aberto));
      $('.u-visually-hidden', toggle).textContent = aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação';
      document.body.classList.toggle('is-locked', aberto);
      if (aberto) $('.menu__item', painel)?.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => definir(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('.menu__item, .menu__rodape a', painel).forEach((a) => a.addEventListener('click', () => definir(false)));
    painel.addEventListener('click', (e) => { if (!e.target.closest('.menu__painel')) definir(false); });

    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && painel.classList.contains('is-aberto')) {
        definir(false);
        toggle.focus();
      }
    });

    // Voltar para desktop com o menu aberto deixaria o body travado.
    matchMedia('(min-width: 1001px)').addEventListener('change', (e) => { if (e.matches) definir(false); });
  }

  /* ── 4. Carrossel (depoimentos) ───────────────────────────────────────
     Snap e rolagem são do CSS (swipe nativo no toque). O JS entra só para
     arrastar com o mouse, setas, anterior/próximo e pontos por PÁGINA. */

  function carrossel(raiz) {
    const trilho = $('.carrossel__trilho', raiz);
    const pontos = $('.carrossel__pontos', raiz);
    const anterior = $('[data-carrossel-passo="-1"]', raiz);
    const proximo = $('[data-carrossel-passo="1"]', raiz);
    if (!trilho) return;

    const rotulo = raiz.dataset.carrosselRotulo || 'itens';
    const passo = () => {
      const [a, b] = trilho.children;
      if (!a) return trilho.clientWidth;
      return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
    };
    const maximo = () => Math.max(0, trilho.scrollWidth - trilho.clientWidth);
    const porPagina = () => Math.max(1, Math.floor((trilho.clientWidth + 1) / passo()));
    const paginas = () => (maximo() <= 2 ? 1 : Math.ceil(trilho.children.length / porPagina()));

    function paginaAtual() {
      const total = paginas();
      if (total <= 1) return 0;
      if (trilho.scrollLeft >= maximo() - 2) return total - 1;
      return Math.min(total - 1, Math.round(trilho.scrollLeft / (porPagina() * passo())));
    }

    const MAX_PONTOS = 10;

    function desenharPontos() {
      const total = paginas();
      if (!pontos) return;
      pontos.hidden = total <= 1;
      pontos.innerHTML = total > MAX_PONTOS
        ? '<span class="carrossel__contador" aria-hidden="true"></span>'
        : Array.from({ length: total }, (_, i) => `
          <button class="carrossel__ponto" type="button" data-pagina="${i}"
                  aria-label="Página ${i + 1} de ${total} dos ${rotulo}"></button>`).join('');
      marcar();
    }

    function marcar() {
      const atual = paginaAtual();
      const contador = $('.carrossel__contador', raiz);
      if (contador) contador.textContent = `${atual + 1} / ${paginas()}`;
      $$('.carrossel__ponto', pontos || raiz).forEach((b, i) => b.setAttribute('aria-current', String(i === atual)));
      if (anterior) anterior.disabled = trilho.scrollLeft <= 2;
      if (proximo) proximo.disabled = trilho.scrollLeft >= maximo() - 2;
    }

    const rolar = (left) => trilho.scrollTo({ left, behavior: semMovimento() ? 'auto' : 'smooth' });

    let pendente = false;
    trilho.addEventListener('scroll', () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => { pendente = false; marcar(); });
    }, { passive: true });

    pontos?.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-pagina]');
      if (botao) rolar(Number(botao.dataset.pagina) * porPagina() * passo());
    });

    [anterior, proximo].forEach((botao) => botao?.addEventListener('click', () => {
      rolar(trilho.scrollLeft + Number(botao.dataset.carrosselPasso) * passo());
    }));

    trilho.addEventListener('keydown', (e) => {
      if (e.target !== trilho) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); rolar(trilho.scrollLeft + passo()); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rolar(trilho.scrollLeft - passo()); }
    });

    /* Arrasto com mouse: o ponteiro só é CAPTURADO depois de andar alguns
       pixels, e o clique que encerra um arrasto de verdade é engolido. */
    let arrastando = false;
    let capturado = false;
    let inicioX = 0;
    let inicioScroll = 0;

    trilho.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrastando = true;
      capturado = false;
      inicioX = e.clientX;
      inicioScroll = trilho.scrollLeft;
    });
    trilho.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      const delta = e.clientX - inicioX;
      if (!capturado) {
        if (Math.abs(delta) < 6) return;
        capturado = true;
        trilho.setPointerCapture(e.pointerId);
        trilho.classList.add('is-arrastando');
      }
      trilho.scrollLeft = inicioScroll - delta;
    });
    const soltar = (e) => {
      if (!arrastando) return;
      arrastando = false;
      if (!capturado) return;
      capturado = false;
      trilho.classList.remove('is-arrastando');
      if (trilho.hasPointerCapture?.(e.pointerId)) trilho.releasePointerCapture(e.pointerId);
      trilho.addEventListener('click', (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true });
      requestAnimationFrame(() => rolar(Math.round(trilho.scrollLeft / passo()) * passo()));
    };
    trilho.addEventListener('pointerup', soltar);
    trilho.addEventListener('pointercancel', soltar);
    trilho.addEventListener('dragstart', (e) => e.preventDefault());

    let redimensionar = null;
    addEventListener('resize', () => {
      clearTimeout(redimensionar);
      redimensionar = setTimeout(desenharPontos, 150);
    });

    desenharPontos();
  }

  /* ── 5. Vitrine ───────────────────────────────────────────────────────── */

  const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;
  /* Caminho de imagem do próprio site, para entrar em `url()` dentro de um
     atributo style: qualquer outra coisa é descartada, não remendada. */
  const IMAGEM_LOCAL = /^assets\/img\/[a-z0-9/_-]+\.webp$/;

  function selos(m, classe = '') {
    const c = m.classificacao ? window.DF_CLASSIFICACOES[m.classificacao] : null;
    if (!c) return '';
    return `<ul class="selos ${classe}" aria-label="Classificação legal">${c.selos.map((s) => `
      <li class="selo selo--${s.tom}">${s.tom === 'livre' ? ICONE_CHECK : ICONE_ALERTA}${escapar(s.t)}</li>`).join('')}</ul>`;
  }

  const tomDe = (m) => {
    const hex = (window.DF_TONS || {})[m.tom];
    return HEX_VALIDO.test(hex || '') ? hex : '#DEDEDE';
  };

  const vitrine = (() => {
    const grade = $('#vitrine-grade');
    const vazio = $('#vitrine-vazio');
    const barra = $('#filtro');
    const nota = $('#filtro-nota');
    const mais = $('#vitrine-mais');
    const maisBtn = $('#vitrine-mais-btn');
    let ativa = 'todos';
    let expandido = false;

    /* No celular (uma coluna) os 20 cards somam ~11 mil px: mostra os
       primeiros e oferece o resto. Filtrar já reduz a lista, então o corte
       só vale para "Todos". */
    const LIMITE_CELULAR = 6;
    const celular = matchMedia('(max-width: 599.98px)');

    const modelos = () => {
      const todos = modelosAtivos();
      const prioridade = window.DF_ORDEM || [];
      if (!prioridade.length) return todos;
      const posicao = new Map(prioridade.map((id, i) => [id, i]));
      return todos
        .map((m, i) => ({ m, i }))
        .sort((a, b) => {
          const pa = posicao.has(a.m.id) ? posicao.get(a.m.id) : Infinity;
          const pb = posicao.has(b.m.id) ? posicao.get(b.m.id) : Infinity;
          return pa - pb || a.i - b.i;
        })
        .map((x) => x.m);
    };
    const daCategoria = (id) => (id === 'todos' ? modelos() : modelos().filter((m) => categoriasDe(m).includes(id)));
    const contar = (id) => daCategoria(id).length;

    /* No máximo três números, sempre nesta ordem, só os que a loja informa. */
    const ORDEM_NUMEROS = [
      ['velocidade', 'Velocidade'],
      ['potencia', 'Potência'],
      ['autonomia', 'Autonomia'],
    ];
    const numerico = (v) => v && typeof v === 'object' && v.valor != null && v.unidade;

    function numeros(m, classe = '') {
      const s = m.specs;
      const disponiveis = s ? ORDEM_NUMEROS.filter(([campo]) => numerico(s[campo])) : [];
      if (!disponiveis.length) return '';
      return `
        <dl class="specs ${classe}">
          ${disponiveis.map(([campo, rotulo]) => `
            <div class="spec">
              <dt>${rotulo}</dt>
              <dd><b>${escapar(s[campo].valor)}</b><span>${escapar(s[campo].unidade)}</span></dd>
            </div>`).join('')}
        </dl>`;
    }

    function preco(m, classe = '') {
      if (!m.preco?.valor) return '';
      return `
        <div class="preco ${classe}">
          <p class="preco__linha" style="margin:0"><span class="preco__rotulo">Valor</span>
            <span class="preco__valor">${real.format(m.preco.valor)}</span></p>
          <p class="preco__parcelas" style="margin:0">${m.preco.parcelas ? escapar(m.preco.parcelas) : ''}</p>
        </div>`;
    }

    // Linha de cima do nome no modal: "MotoChefe · Scooter elétrica".
    const eyebrow = (m) => [m.fabricante, m.descritivo].filter(Boolean).join(' · ');

    function card(m) {
      const foto = cardDe(m);
      const marca = m.fabricante === 'Di Fatto'
        ? '<p class="card__marca">Di Fatto</p>'
        : `<p class="card__marca card__marca--neutra">${escapar(m.fabricante || m.descritivo)}</p>`;
      return `
        <li data-anima>
          <article class="card" data-id="${escapar(m.id)}" style="--tom:${tomDe(m)}">
            <div class="card__midia">
              <button class="card__foto" type="button" data-detalhes="${escapar(m.id)}" aria-label="Ver detalhes do ${escapar(m.nome)}">
                <img src="${escapar(foto.src)}" alt="${escapar(foto.alt)}" loading="lazy" decoding="async" width="${Number(foto.w)}" height="${Number(foto.h)}">
              </button>
              ${selos(m, 'card__selos')}
            </div>
            <div class="card__corpo">
              <div class="card__cabeca">
                ${marca}
                <h3 class="card__nome">${escapar(m.nome)}</h3>
                ${m.tags?.length ? `<p class="card__tags">${escapar(m.tags.join(', '))}</p>` : ''}
              </div>
              ${numeros(m)}
              ${preco(m, 'card__preco')}
              <div class="card__acoes">
                <a class="btn btn--whats" href="${linkWhats('modelo', { modelo: m.nome })}" target="_blank" rel="noopener">${ICONE_WHATS}<span>Comprar<span class="u-visually-hidden"> o ${escapar(m.nome)} pelo WhatsApp</span></span></a>
                <button class="link-acao" type="button" data-detalhes="${escapar(m.id)}">+ Detalhes<span class="u-visually-hidden"> do ${escapar(m.nome)}</span></button>
              </div>
            </div>
          </article>
        </li>`;
    }

    const visiveisAgora = () => daCategoria(ativa);

    const deveCortar = () => ativa === 'todos' && !expandido && celular.matches && visiveisAgora().length > LIMITE_CELULAR + 2;
    let cortado = null;

    function render() {
      const todos = visiveisAgora();
      const cortar = deveCortar();
      cortado = cortar;
      const visiveis = cortar ? todos.slice(0, LIMITE_CELULAR) : todos;

      grade.innerHTML = visiveis.map(card).join('');
      grade.hidden = visiveis.length === 0;

      mais.hidden = !cortar;
      if (cortar) maisBtn.textContent = `Ver todos os ${todos.length} modelos (+${todos.length - LIMITE_CELULAR})`;

      const meta = window.DF_CATEGORIAS.find((c) => c.id === ativa);
      nota.textContent = meta ? meta.nota : '';

      if (visiveis.length === 0) {
        vazio.hidden = false;
        vazio.innerHTML = `
          <p style="margin:0 0 var(--sp-3);font-weight:700">Estamos atualizando os modelos desta categoria.</p>
          <p style="margin:0 auto var(--sp-6);max-width:52ch">A equipe da DiFatto passa as opções pelo WhatsApp.</p>
          <a class="btn btn--whats" href="${linkWhats('categoria', { categoria: meta ? meta.nome.toLowerCase() : 'modelos' })}" target="_blank" rel="noopener">
            ${ICONE_WHATS}Quero ver as opções
          </a>`;
      } else {
        vazio.hidden = true;
      }

      window.DF_MOTION?.revelar(grade);
    }

    /* Depois de filtrar, traz o visitante de volta ao topo da grade, se ele
       saiu da tela. Se o topo já está visível, não rola. */
    function irParaVitrine() {
      const alturaHeader = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--df-header')) || 84;
      const alturaFiltro = barra ? barra.getBoundingClientRect().height : 0;
      const topo = alturaHeader + alturaFiltro + 16;
      const alvo = nota.textContent ? nota : (grade.hidden ? vazio : grade);
      const r = alvo.getBoundingClientRect();
      if (r.top >= topo && r.top < innerHeight * 0.6) return;
      window.scrollTo({ top: r.top + window.scrollY - topo, behavior: semMovimento() ? 'auto' : 'smooth' });
    }

    function miniatura(id) {
      const src = id === 'todos' ? 'assets/img/brand/icone.svg' : `assets/img/categorias/${id}.webp`;
      return `<span class="filtro__miniatura${id === 'todos' ? ' filtro__miniatura--todos' : ''}" aria-hidden="true">
        <img src="${src}" alt="" width="40" height="40" decoding="async"></span>`;
    }

    function barraFiltro() {
      barra.innerHTML = window.DF_CATEGORIAS.filter((c) => c.id === 'todos' || contar(c.id) > 0).map((c) => `
        <button class="filtro__btn" type="button" data-cat="${c.id}" aria-pressed="${c.id === ativa}">
          ${miniatura(c.id)}
          <span>${escapar(c.nome)}</span>
          <span class="filtro__contagem">${contar(c.id)}<span class="u-visually-hidden"> modelos</span></span>
        </button>`).join('');
    }

    function filtrar(id, rolar = true, origem = 'filtro') {
      if (id !== ativa) emitir('filtrar_categoria', { categoria: id, origem });
      ativa = id;
      $$('.filtro__btn', barra).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === id)));
      render();
      if (rolar) requestAnimationFrame(irParaVitrine);
    }

    /**
     * A barra de filtro gruda embaixo do header. Geometria em vez de
     * IntersectionObserver: `!isIntersecting` é verdade com a sentinela ACIMA
     * e ABAIXO da tela. A margem de baixo absorve a diferença de altura entre
     * barra solta e grudada, para nada abaixo dela dar salto.
     */
    function grudar() {
      const sentinela = $('#filtro-sentinela');
      if (!barra || !sentinela) return;
      let alturaHeader = 84;
      const medirHeader = () => {
        alturaHeader = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--df-header')) || 84;
      };

      let alturaSolta = 0;
      let margemBase = null;
      const medirSolta = () => {
        alturaSolta = barra.getBoundingClientRect().height;
        if (margemBase === null) margemBase = parseFloat(getComputedStyle(barra).marginBottom) || 0;
      };

      let pendente = false;
      const conferir = () => {
        pendente = false;
        const deveGrudar = sentinela.getBoundingClientRect().top < alturaHeader + 10;
        const estaGrudada = barra.classList.contains('is-fixo');
        if (deveGrudar === estaGrudada) return;
        if (deveGrudar) {
          medirSolta();
          barra.classList.add('is-fixo');
          const diferenca = alturaSolta - barra.getBoundingClientRect().height;
          barra.style.marginBottom = `${Math.max(0, margemBase + diferenca)}px`;
        } else {
          barra.classList.remove('is-fixo');
          barra.style.marginBottom = '';
          medirSolta();
        }
      };
      const agendar = () => {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(conferir);
      };

      medirHeader();
      conferir();
      addEventListener('scroll', agendar, { passive: true });
      addEventListener('load', () => { medirHeader(); conferir(); });
      let agendado = null;
      addEventListener('resize', () => {
        clearTimeout(agendado);
        agendado = setTimeout(() => {
          medirHeader();
          if (barra.classList.contains('is-fixo')) {
            barra.classList.remove('is-fixo');
            barra.style.marginBottom = '';
            medirSolta();
          }
          conferir();
        }, 150);
      });
    }

    function iniciar() {
      if (!grade) return;
      barraFiltro();
      render();
      grudar();

      barra.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cat]');
        if (btn) filtrar(btn.dataset.cat);
      });

      maisBtn.addEventListener('click', () => {
        expandido = true;
        const primeiroNovo = LIMITE_CELULAR;
        render();
        emitir('ver_todos_modelos', {});
        // O foco vai para o primeiro card que acabou de aparecer.
        $$('.card__foto', grade)[primeiroNovo]?.focus({ preventScroll: true });
      });
      // Girar o aparelho só re-renderiza se o corte da lista mudar de fato.
      celular.addEventListener('change', () => { if (deveCortar() !== cortado) render(); });

      grade.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-detalhes]');
        if (btn) { modal.abrir(btn.dataset.detalhes, btn); return; }

        const comprar = e.target.closest('.card a[href*="wa.me"]');
        if (comprar) {
          const cartao = comprar.closest('.card');
          comprar.dataset.rastreado = '1'; // já contado aqui, não repetir na delegação
          interesseNoModelo(modelos().find((x) => x.id === cartao?.dataset.id), 'card');
        }
      });
    }

    return { iniciar, visiveis: visiveisAgora, numeros, preco, eyebrow, todos: modelos };
  })();

  /* ── 6. Lightbox da galeria ───────────────────────────────────────────── */

  const lightbox = (() => {
    const raiz = $('#lightbox');
    let fotos = [];
    let indice = 0;
    let voltarPara = null;

    function pintar() {
      const foto = fotos[indice];
      if (!foto) return;
      $('#lightbox-foto').src = foto.src;
      $('#lightbox-foto').alt = foto.alt || '';
      $('#lightbox-contador').textContent = `${indice + 1} / ${fotos.length}`;
      const soUma = fotos.length < 2;
      $$('.lightbox__seta', raiz).forEach((b) => { b.hidden = soUma; });
      $('#lightbox-contador').hidden = soUma;
    }

    function andar(passo) {
      if (!fotos.length) return;
      indice = (indice + passo + fotos.length) % fotos.length;
      pintar();
    }

    function abrir(lista, inicio = 0) {
      if (!raiz || !lista?.length) return;
      fotos = lista;
      indice = Math.max(0, Math.min(inicio, lista.length - 1));
      voltarPara = document.activeElement;
      pintar();
      raiz.classList.add('is-aberto');
      raiz.setAttribute('aria-hidden', 'false');
      $('.lightbox__fechar', raiz).focus({ preventScroll: true });
    }

    function fechar() {
      if (!raiz || !raiz.classList.contains('is-aberto')) return;
      raiz.classList.remove('is-aberto');
      raiz.setAttribute('aria-hidden', 'true');
      voltarPara?.focus?.({ preventScroll: true });
      voltarPara = null;
    }

    const estaAberto = () => Boolean(raiz?.classList.contains('is-aberto'));

    function iniciar() {
      if (!raiz) return;
      raiz.addEventListener('click', (e) => {
        const passo = e.target.closest('[data-lightbox-passo]');
        if (passo) { andar(Number(passo.dataset.lightboxPasso)); return; }
        fechar();
      });
      addEventListener('keydown', (e) => {
        if (!estaAberto()) return;
        if (e.key === 'Escape') { e.stopPropagation(); fechar(); }
        if (e.key === 'ArrowRight') andar(1);
        if (e.key === 'ArrowLeft') andar(-1);
      }, true);
    }

    return { iniciar, abrir, fechar, estaAberto };
  })();

  /* ── 7. Modal de detalhes ─────────────────────────────────────────────
     Três faixas: cabeçalho parado, miolo rolando, base parada com preço,
     cor e as duas saídas (Comprar e Test ride), já com modelo e cor. */

  const modal = (() => {
    const raiz = $('#modal');
    let origem = null;
    let atual = null;
    let corAtiva = null; // nenhuma cor escolhida até a pessoa escolher

    /* Galeria = o recorte do card (sobre o tint do modelo) + as fotos de cor
       que a loja mandou (na ordem das amostras) + as fotos do popup do WP. */
    function fotosDe(m) {
      const c = cardDe(m);
      const vitrineFoto = { src: c.src, alt: c.alt, w: c.w, h: c.h, fundo: tomDe(m), estudio: true, vitrine: true };
      const porCor = (window.DF_FOTOS_COR || {})[m.id] || {};
      const daCor = (m.cores || [])
        .filter((cor) => cor.fotoCor && porCor[cor.fotoCor])
        .map((cor) => ({ ...porCor[cor.fotoCor], cor: cor.fotoCor }));
      return [vitrineFoto, ...daCor, ...((window.DF_GALERIAS || {})[m.id] || [])];
    }

    /* Onde está a foto de uma cor: `fotoCor` (foto própria da cor) ou `foto`
       (posição na galeria do WP, que cada foto carrega em `pos`). */
    function indiceDaCor(m, cor) {
      const fotos = fotosDe(m);
      if (cor?.fotoCor) return fotos.findIndex((f) => f.cor === cor.fotoCor);
      if (cor?.foto) return fotos.findIndex((f) => f.pos === cor.foto);
      return -1;
    }

    /* Foto de estúdio: inteira sobre a cor da própria borda. Foto de
       ambiente: inteira sobre uma cópia desfocada de si mesma. */
    function slide(f, k, total) {
      const fundo = HEX_VALIDO.test(f.fundo || '') ? f.fundo : '#F1F1F2';
      const ambiente = !f.estudio && IMAGEM_LOCAL.test(f.src);
      /* URL ABSOLUTA: `url()` dentro de variável CSS é resolvida a partir da
         folha que a usa (assets/css/), não da página. */
      const estilo = ambiente ? `--fundo:${fundo};--foto:url('${new URL(f.src, document.baseURI).href}')` : `--fundo:${fundo}`;
      const classe = `${ambiente ? ' is-ambiente' : ''}${f.vitrine ? ' is-vitrine' : ''}`;
      return `
        <div class="modal__slide${classe}" role="group" aria-roledescription="slide"
             aria-label="${k + 1} de ${total}" style="${escapar(estilo)}">
          <img src="${escapar(f.src)}" alt="${escapar(f.alt)}" draggable="false" decoding="async"
               ${f.w ? `width="${Number(f.w)}" height="${Number(f.h)}"` : ''}${k > 1 ? ' loading="lazy"' : ''}>
        </div>`;
    }

    function galeria(m) {
      const trilho = $('#modal-slider');
      const fotos = fotosDe(m);
      trilho.innerHTML = fotos.map((f, k) => slide(f, k, fotos.length)).join('');
      $('#modal-miniaturas').hidden = fotos.length < 2;
      $('.modal__galeria').classList.toggle('tem-miniaturas', fotos.length > 1);
      $('#modal-miniaturas').innerHTML = fotos.map((f, k) => `
        <button class="modal__mini${f.vitrine ? ' modal__mini--vitrine' : ''}" type="button" data-foto="${k}" aria-current="${k === 0}"
                aria-label="Ver foto ${k + 1} de ${fotos.length}">
          <img src="${escapar(f.mini || f.src)}" alt="" loading="lazy" decoding="async" width="180" height="135">
        </button>`).join('');
      irPara(0, 'auto');
    }

    /* ── Slider ────────────────────────────────────────────────────────── */

    let houveArrasto = false;

    function slideAtual() {
      const trilho = $('#modal-slider');
      return Math.round(trilho.scrollLeft / (trilho.clientWidth || 1));
    }

    function irPara(indice, comportamento = 'smooth') {
      const trilho = $('#modal-slider');
      const slides = trilho.children.length;
      if (!slides) return;
      const alvo = Math.max(0, Math.min(indice, slides - 1));
      trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior: semMovimento() ? 'auto' : comportamento });
      marcarMiniatura(alvo);
    }

    function marcarMiniatura(indice) {
      $$('#modal-miniaturas .modal__mini').forEach((b, k) => {
        b.setAttribute('aria-current', String(k === indice));
        if (k === indice) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }

    function ligarSlider() {
      const trilho = $('#modal-slider');
      if (!trilho) return;

      let pendente = false;
      trilho.addEventListener('scroll', () => {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(() => { pendente = false; marcarMiniatura(slideAtual()); });
      }, { passive: true });

      trilho.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); irPara(slideAtual() + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(slideAtual() - 1); }
      });

      $$('[data-slide-passo]', raiz).forEach((b) => b.addEventListener('click', () => {
        irPara(slideAtual() + Number(b.dataset.slidePasso));
      }));

      // Arrasto com mouse. No toque o próprio navegador resolve.
      let arrastando = false;
      let inicioX = 0;
      let inicioScroll = 0;
      let moveu = 0;

      trilho.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return;
        arrastando = true;
        moveu = 0;
        inicioX = e.clientX;
        inicioScroll = trilho.scrollLeft;
        trilho.classList.add('is-arrastando');
        trilho.setPointerCapture(e.pointerId);
      });
      trilho.addEventListener('pointermove', (e) => {
        if (!arrastando) return;
        const delta = e.clientX - inicioX;
        moveu = Math.abs(delta);
        trilho.scrollLeft = inicioScroll - delta;
      });
      const soltar = (e) => {
        if (!arrastando) return;
        arrastando = false;
        houveArrasto = moveu > 6;
        setTimeout(() => { houveArrasto = false; }, 0);
        trilho.classList.remove('is-arrastando');
        if (trilho.hasPointerCapture?.(e.pointerId)) trilho.releasePointerCapture(e.pointerId);
        // Passou de um quinto da largura, vai para o próximo; senão, volta.
        const largura = trilho.clientWidth || 1;
        const partiu = Math.round(inicioScroll / largura);
        const delta = trilho.scrollLeft - inicioScroll;
        if (moveu > largura * 0.2) irPara(partiu + (delta > 0 ? 1 : -1));
        else irPara(partiu);
      };
      trilho.addEventListener('pointerup', soltar);
      trilho.addEventListener('pointercancel', soltar);
    }

    function ficha(m) {
      /* A classificação legal já está nos selos e na linha "CONTRAN 996/23" do
         topo: repetida na ficha, era a linha mais longa e quebrava em duas. */
      const specs = m.specs || {};
      /* Campo sem dado não aparece: linhas de "não informado" comunicam
         ausência, não especificação. */
      $('#modal-ficha').innerHTML = window.DF_FICHA_ORDEM
        .filter(([chave]) => specs[chave] != null)
        .map(([chave, rotulo]) => {
          const bruto = specs[chave];
          const valor = typeof bruto === 'object' ? `${bruto.valor} ${bruto.unidade}` : bruto;
          const nota = typeof bruto === 'object' && bruto.nota ? `<small class="ficha__nota">${escapar(bruto.nota)}</small>` : '';
          return `<div><dt>${rotulo}</dt><dd>${escapar(valor)}${nota}</dd></div>`;
        }).join('');
    }

    function equipamentos(m) {
      const bloco = $('#modal-equipamentos');
      const itens = m.equipamentos || [];
      bloco.hidden = !itens.length;
      if (!itens.length) return;
      $('#modal-equipamentos-lista').innerHTML = itens.map((item) => `<li>${ICONE_CHECK}${escapar(item)}</li>`).join('');
    }

    /**
     * Fundo da bolinha, em ordem de precedência: bicolor → imagem → hex.
     * SEGURANÇA: o valor entra numa declaração CSS dentro de um atributo
     * style, então hex passa pela regex e imagem só se for caminho do site.
     */
    const parDeHex = (v) => Array.isArray(v) && v.length === 2 && v.every((h) => HEX_VALIDO.test(h));
    function fundoDoSwatch(c) {
      if (parDeHex(c.bicolor)) return `background:linear-gradient(135deg, ${c.bicolor[0]} 50%, ${c.bicolor[1]} 50%)`;
      if (c.imagem && IMAGEM_LOCAL.test(c.imagem)) return `background:url('${c.imagem}') center/cover no-repeat`;
      return `background:${HEX_VALIDO.test(c.hex || '') ? c.hex : 'transparent'}`;
    }

    function cores(m) {
      const bloco = $('#modal-cores');
      const lista = m.cores || [];
      if (!lista.length) { bloco.hidden = true; return; }
      bloco.hidden = false;
      const escolhida = corAtiva != null ? lista[corAtiva] : null;
      // Rótulo curto: o longo ("2 cores · escolha a sua") empurrava as cores para baixo do preço.
      $('#modal-cor-rotulo').innerHTML = escolhida
        ? `Cor: <strong>${escapar(escolhida.nome)}</strong>`
        : '<strong>Escolha a cor</strong>';
      // Uma cor só: fica o rótulo (entra na mensagem), sai a bolinha sem função.
      $('#modal-swatches').hidden = lista.length < 2;
      $('#modal-swatches').innerHTML = lista.map((c, i) => `
        <button class="modal__swatch" type="button" data-cor="${i}"
                aria-pressed="${i === corAtiva}" aria-label="Cor ${escapar(c.nome)}" title="${escapar(c.nome)}">
          <i style="${fundoDoSwatch(c)}" aria-hidden="true"></i>
        </button>`).join('');
    }

    /* Remonta os dois links da base com o modelo e, se escolhida, a cor. */
    function cta() {
      const nome = atual.nome;
      const cor = corAtiva != null ? atual.cores?.[corAtiva]?.nome : null;
      $('#modal-cta').href = cor ? linkWhats('modeloCor', { modelo: nome, cor }) : linkWhats('modelo', { modelo: nome });
      $('#modal-testride').href = cor
        ? linkWhats('testRideModeloCor', { modelo: nome, cor })
        : linkWhats('testRideModelo', { modelo: nome });
    }

    function vizinhos() {
      const lista = vitrine.visiveis();
      const i = lista.findIndex((m) => m.id === atual?.id);
      if (i < 0) return { lista, i, anterior: null, proximo: null };
      return {
        lista,
        i,
        anterior: lista[(i - 1 + lista.length) % lista.length] || null,
        proximo: lista[(i + 1) % lista.length] || null,
      };
    }

    function setas() {
      const bloco = $('#modal-navegacao');
      const { lista, i, anterior, proximo } = vizinhos();
      bloco.hidden = lista.length < 2 || i < 0;
      if (bloco.hidden) return;
      $('#modal-anterior').setAttribute('aria-label', `Ver ${anterior.nome}`);
      $('#modal-proximo').setAttribute('aria-label', `Ver ${proximo.nome}`);
      $('#modal-posicao').textContent = `${i + 1} de ${lista.length}`;
    }

    function irParaModelo(direcao) {
      const { anterior, proximo } = vizinhos();
      const alvo = direcao < 0 ? anterior : proximo;
      if (alvo) abrir(alvo.id);
    }

    function abrir(id, gatilho) {
      atual = modelosAtivos().find((m) => m.id === id);
      if (!atual) return;
      if (gatilho !== undefined) origem = gatilho || null;
      corAtiva = (atual.cores || []).length === 1 ? 0 : null;

      $('#modal-eyebrow').textContent = vitrine.eyebrow(atual);
      $('#modal-titulo').textContent = atual.nome;
      $('#modal-selo').innerHTML = selos(atual, 'selos--modal');
      $('#modal-legal').textContent = atual.classificacao === 'autopropelido'
        ? 'Veículo autopropelido | CONTRAN 996/23'
        : 'Ciclomotor · exige habilitação (ACC ou A), registro e licenciamento';

      const tags = $('#modal-tags');
      tags.textContent = (atual.tags || []).length ? `Perfil: ${atual.tags.join(', ').toLowerCase()}.` : '';
      tags.hidden = !(atual.tags || []).length;

      const destaque = $('#modal-numeros');
      destaque.innerHTML = vitrine.numeros(atual, 'specs--modal');
      destaque.hidden = !destaque.innerHTML.trim();

      $('#modal-preco').innerHTML = vitrine.preco(atual, 'preco--modal');

      galeria(atual);
      ficha(atual);
      equipamentos(atual);
      cores(atual);
      cta();
      setas();
      $('#modal-corpo').scrollTop = 0;
      $('.modal__caixa').scrollTop = 0; // no celular quem rola é a caixa inteira

      emitir('view_item', {
        item_id: atual.id,
        item_name: nomeCompleto(atual),
        item_brand: atual.fabricante || undefined,
        item_category: categoriasDe(atual)[0],
        value: atual.preco?.valor || undefined,
        currency: atual.preco?.valor ? 'BRL' : undefined,
      });

      raiz.inert = false;
      raiz.classList.add('is-aberto');
      raiz.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      history.replaceState(null, '', `#modelo/${atual.id}`);
      $('#modal-titulo').setAttribute('tabindex', '-1');
      $('#modal-titulo').focus({ preventScroll: true });
    }

    function fechar() {
      lightbox.fechar();
      /* O foco SAI antes de o modal ser escondido. Aberto pelo link direto
         (#modelo/<id>) não há botão de origem: volta ao card do modelo, se ele
         está na grade, ou é liberado. Foco dentro de aria-hidden é erro de a11y. */
      const destino = origem || (atual && $(`.card[data-id="${atual.id}"] .card__foto`)) || null;
      if (destino) destino.focus({ preventScroll: true });
      else if (raiz.contains(document.activeElement)) document.activeElement.blur();
      raiz.classList.remove('is-aberto');
      raiz.setAttribute('aria-hidden', 'true');
      raiz.inert = true;
      document.body.classList.remove('is-locked');
      if (location.hash.startsWith('#modelo/')) history.replaceState(null, '', location.pathname + location.search);
      origem = null;
      atual = null;
    }

    function iniciar() {
      if (!raiz) return;
      ligarSlider();
      lightbox.iniciar();

      raiz.addEventListener('click', (e) => {
        if (e.target.closest('[data-fechar-modal]')) { fechar(); return; }

        const mini = e.target.closest('[data-foto]');
        if (mini) { irPara(Number(mini.dataset.foto)); return; }

        const seta = e.target.closest('[data-modelo-passo]');
        if (seta) { irParaModelo(Number(seta.dataset.modeloPasso)); return; }

        if (e.target.closest('[data-slide-passo]')) return;

        // Clique na foto grande abre a versão ampliada.
        if (e.target.closest('.modal__slider') && !houveArrasto) {
          lightbox.abrir(fotosDe(atual), slideAtual());
          return;
        }

        const botaoCta = e.target.closest('#modal-cta, #modal-testride');
        if (botaoCta && atual) {
          botaoCta.dataset.rastreado = '1';
          const testRide = botaoCta.id === 'modal-testride';
          interesseNoModelo(atual, testRide ? 'modal_testride' : 'modal', { cor: corAtiva != null ? atual.cores?.[corAtiva]?.nome : undefined });
          return;
        }

        /* A amostra leva à foto da cor, quando existe uma (como no popup do WP). */
        const swatch = e.target.closest('[data-cor]');
        if (swatch) {
          corAtiva = Number(swatch.dataset.cor);
          const cor = atual.cores[corAtiva];
          cores(atual);
          cta();
          const indice = indiceDaCor(atual, cor);
          if (indice > 0) {
            irPara(indice);
            // No celular a galeria pode ter rolado para fora da tela: volta até ela.
            const caixa = $('.modal__caixa');
            if (caixa.scrollTop > 40 && getComputedStyle(caixa).overflowY === 'auto') {
              caixa.scrollTo({ top: 0, behavior: semMovimento() ? 'auto' : 'smooth' });
            }
          }
          emitir('escolher_cor', { item_id: atual.id, cor: cor?.nome });
          $(`#modal-swatches [data-cor="${corAtiva}"]`)?.focus({ preventScroll: true });
        }
      });

      addEventListener('keydown', (e) => {
        if (!raiz.classList.contains('is-aberto')) return;
        if (lightbox.estaAberto()) return; // com o lightbox por cima, o ESC é dele
        if (e.key === 'Escape') { fechar(); return; }
        if (e.key !== 'Tab') return;

        /* Prende o foco dentro do modal enquanto ele estiver aberto.
           getClientRects, e não offsetParent: no celular o "fechar" é fixed e
           offsetParent dele é null, o que o tirava do ciclo do teclado. */
        const focaveis = $$('button, a[href], [tabindex]:not([tabindex="-1"])', raiz)
          .filter((el) => el.getClientRects().length > 0 && !el.closest('[hidden]'));
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      });

      /* Âncora compartilhável: /#modelo/jet abre o modal direto. Modelo que
         não existe ou está oculto: limpa o hash e fica na página. */
      const abrirPorHash = () => {
        const hash = location.hash.match(/^#modelo\/(.+)$/);
        if (!hash) return;
        const id = decodeURIComponent(hash[1]);
        if (!modelosAtivos().some((m) => m.id === id)) {
          history.replaceState(null, '', location.pathname + location.search);
          return;
        }
        abrir(id, null);
      };
      addEventListener('hashchange', abrirPorHash);
      requestAnimationFrame(abrirPorHash);
    }

    return { iniciar, abrir };
  })();

  /* ── 8. FAQ ───────────────────────────────────────────────────────────── */

  function faq() {
    const alvo = $('#faq-lista');
    if (!alvo) return;

    alvo.innerHTML = (window.DF_FAQ || []).map((f, i) => `
      <div class="faq__item${i === 0 ? ' is-aberto' : ''}">
        <h3 class="faq__pergunta">
          <button class="faq__botao" type="button" aria-expanded="${i === 0}" aria-controls="faq-r${i}" id="faq-q${i}">
            <span>${escapar(f.q)}</span>
            <span class="faq__sinal" aria-hidden="true"><svg><use href="#i-caret"></use></svg></span>
          </button>
        </h3>
        <div class="faq__resposta" id="faq-r${i}" role="region" aria-labelledby="faq-q${i}">
          <div><p>${comNegrito(f.a)}</p></div>
        </div>
      </div>`).join('');

    alvo.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq__botao');
      if (!btn) return;
      const item = btn.closest('.faq__item');
      const aberto = item.classList.toggle('is-aberto');
      btn.setAttribute('aria-expanded', String(aberto));
      if (aberto) emitir('faq_abrir', { pergunta: $('span', btn).textContent.slice(0, 90) });
    });
  }

  /* ── 9. Depoimentos ───────────────────────────────────────────────────── */

  const ICONE_GOOGLE = `<svg class="depoimento__origem" viewBox="0 0 24 24" role="img" aria-label="Avaliação no Google">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"/>
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z"/>
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"/>
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"/>
    </svg>`;

  // Cor do avatar pela inicial: tons sóbrios, todos com texto branco ≥ 4,5:1.
  const CORES_AVATAR = ['#B0456A', '#3E8A63', '#4B6E9A', '#7A4FA3', '#9A5B2E', '#2F7C86', '#8A3D3D', '#566177'];
  const corAvatar = (nome) => CORES_AVATAR[[...nome].reduce((s, c) => s + c.charCodeAt(0), 0) % CORES_AVATAR.length];

  function depoimentos() {
    const lista = window.DF_DEPOIMENTOS || [];
    const secao = $('#depoimentos');
    if (!secao) return;
    // Sem depoimento real, o bloco não existe: melhor sem prova social do que com prova inventada.
    if (!lista.length) { secao.hidden = true; return; }

    $('#depoimentos-trilho').innerHTML = lista.map((d) => {
      const estrelas = Math.min(5, Number(d.estrelas) || 5);
      return `
        <li>
          <figure class="depoimento">
            <figcaption class="depoimento__autor">
              <span class="depoimento__avatar" style="background:${corAvatar(d.nome)}" aria-hidden="true">${escapar(d.nome.trim()[0] || '')}</span>
              <span class="depoimento__quem">
                <span class="depoimento__nome">${escapar(d.nome)}</span>
                <span class="depoimento__estrelas" role="img" aria-label="${estrelas} de 5 estrelas">${'★'.repeat(estrelas)}</span>
              </span>
              ${ICONE_GOOGLE}
            </figcaption>
            <blockquote class="depoimento__texto">${escapar(d.texto)}</blockquote>
          </figure>
        </li>`;
    }).join('');

    carrossel($('#depoimentos-carrossel'));
  }

  /* ── 10. Dados estruturados ───────────────────────────────────────────
     Escritos a partir do MESMO dado que desenha a página: fixos no HTML, um
     dia diriam um preço e o card mostraria outro. */

  function dadosEstruturados() {
    const base = location.origin && location.origin !== 'null' ? `${location.origin}${location.pathname}` : '';
    const scripts = [];

    const faqs = window.DF_FAQ || [];
    if (faqs.length) {
      scripts.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: semMarcacao(f.a) } })),
      });
    }

    const modelos = vitrine.todos();
    if (modelos.length) {
      scripts.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Modelos DiFatto Scooters Elétricas',
        itemListElement: modelos.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: nomeCompleto(m),
            image: base ? new URL(cardDe(m).src, base).href : cardDe(m).src,
            description: [m.descritivo, ...(m.tags || [])].filter(Boolean).join(', '),
            ...(m.fabricante ? { brand: { '@type': 'Brand', name: m.fabricante } } : {}),
            url: base ? `${base}#modelo/${m.id}` : undefined,
            ...(m.preco?.valor ? {
              offers: {
                '@type': 'Offer',
                price: m.preco.valor.toFixed(2),
                priceCurrency: 'BRL',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: cfg.marca.nomeLoja },
              },
            } : {}),
          },
        })),
      });
    }

    scripts.forEach((dado) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      // JSON.stringify não escapa "</": sem isto, um texto com </script> fecharia a tag.
      s.textContent = JSON.stringify(dado).replace(/</g, '\\u003c');
      document.head.appendChild(s);
    });
  }

  /* ── 11. Mídia pesada só quando faz sentido ───────────────────────────── */

  function midia() {
    // Sem vídeo com movimento reduzido ou economia de dados: o pôster fica.
    const conexao = navigator.connection || {};
    const poupar = semMovimento() || conexao.saveData === true || /(^|-)2g$/.test(conexao.effectiveType || '');
    if (poupar) return;

    const anexar = (video, src) => {
      if (!src || video.src) return;
      video.src = src;
      video.addEventListener('canplay', () => video.classList.add('is-pronto'), { once: true });
      video.play().catch(() => { /* autoplay bloqueado: o pôster fica */ });
    };

    const hero = $('#hero-video');
    if (hero) {
      const celular = matchMedia('(max-width: 760px)').matches;
      anexar(hero, celular ? hero.dataset.srcCelular : hero.dataset.src);
    }

    const lazy = $$('[data-lazy-video]');
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        anexar(entrada.target, entrada.target.dataset.src);
        obs.unobserve(entrada.target);
      });
    }, { rootMargin: '200px' });
    lazy.forEach((v) => obs.observe(v));

    // Vídeo fora da tela não precisa gastar bateria.
    const pausar = new IntersectionObserver((entradas) => {
      entradas.forEach(({ target, isIntersecting }) => {
        if (!target.src) return;
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    });
    [hero, ...lazy].filter(Boolean).forEach((v) => pausar.observe(v));
  }

  /* ── 12. Mapa: entra quando o rodapé chega a 600 px da tela ───────────── */

  function mapa() {
    const frame = $('#mapa');
    if (!frame) return;
    const src = `https://maps.google.com/maps?q=${encodeURIComponent(cfg.endereco.busca)}&t=m&z=17&output=embed&iwloc=near`;
    const carregar = () => {
      if (frame.src) return;
      frame.src = src;
      frame.addEventListener('load', () => frame.closest('.mapa')?.classList.add('is-carregado'), { once: true });
    };
    if (!('IntersectionObserver' in window)) { carregar(); return; }
    const obs = new IntersectionObserver((entradas, o) => {
      if (!entradas[0].isIntersecting) return;
      carregar();
      o.disconnect();
    }, { rootMargin: '600px' });
    obs.observe(frame);
  }

  /* ── partida ──────────────────────────────────────────────────────────── */

  function iniciar() {
    aplicarConfig();
    scrollUI();
    menu();
    vitrine.iniciar();
    modal.iniciar();
    faq();
    depoimentos();
    dadosEstruturados();
    midia();
    mapa();
    balao();

    /* motion.js (defer) só se declara: a coreografia começa aqui, com a
       vitrine, o FAQ e os depoimentos já no DOM. */
    window.DF_APP_PRONTO = true;
    window.DF_MOTION?.iniciar?.();
  }

  // Este script fica no fim do <body>: o DOM de que ele precisa já existe.
  if (document.getElementById('lightbox')) iniciar();
  else document.addEventListener('DOMContentLoaded', iniciar);
})();
