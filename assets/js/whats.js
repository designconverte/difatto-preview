/* ==========================================================================
   DIFATTO · link do WhatsApp
   Um construtor só, usado pelo app.js e pela privacidade.html, para toda
   mensagem sair igual: "Olá! Vim pelo {origem} e …", com o número certo
   (assistência tem o seu). Carrega DEPOIS do config.js.
   ========================================================================== */

(() => {
  'use strict';

  const cfg = window.DF_CONFIG;
  const CHAVE = 'df:utm_source';

  /* De onde a visita veio. A URL vence; sem `utm_source` nela, vale o que a
     visita trouxe antes (a pessoa entra por ?utm_source=ig e depois abre a
     política de privacidade, onde o UTM já não está). Sem storage (modo
     privado, bloqueio), cai na URL ou no padrão. */
  function lerOrigem() {
    const regra = cfg.origem || {};
    const daUrl = (new URLSearchParams(location.search).get(regra.parametro || 'utm_source') || '').trim().toLowerCase();
    let fonte = daUrl;
    try {
      if (daUrl) sessionStorage.setItem(CHAVE, daUrl);
      else fonte = sessionStorage.getItem(CHAVE) || '';
    } catch (e) { /* sem storage: fica a da URL */ }
    const mapa = regra.porFonte || {};
    return Object.prototype.hasOwnProperty.call(mapa, fonte) ? mapa[fonte] : (regra.padrao || 'site');
  }

  const origem = lerOrigem();

  /** Monta o link do WhatsApp com a mensagem já preenchida. */
  function link(chave, trocas = {}) {
    let texto = cfg.mensagens[chave] || cfg.mensagens.geral;
    for (const [k, v] of Object.entries({ origem, ...trocas })) {
      texto = texto.replaceAll(`{${k}}`, v);
    }
    const prefixo = cfg.prefixoMensagem;
    if (prefixo && !texto.toLowerCase().startsWith(prefixo.toLowerCase())) texto = `${prefixo}. ${texto}`;
    const numero = chave === 'assistencia' ? (cfg.assistencia?.e164 || cfg.whatsapp.e164) : cfg.whatsapp.e164;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  }

  window.DF_WHATS = { link, origem };
})();
