/* ==========================================================================
   DIFATTO · configuração da loja
   Único lugar onde dados de negócio moram. O HTML e o app.js leem daqui.
   Fonte: site atual (difattoeletricos.com), coletado em 21/10/2026, e
   projeto/difatto_dados_loja.txt.
   ========================================================================== */

window.DF_CONFIG = {
  marca: {
    nome: 'DiFatto',
    nomeLoja: 'DiFatto Scooters Elétricas',
    razaoSocial: 'DI FATTO SCOOTERS ELETRICAS LTDA',
    cnpj: '17.298.081/0001-50',
  },

  /* `numero` é só para exibição; `e164` é o que entra no link wa.me.
     ASSISTÊNCIA: o site atual mostra "(51) 9648-9451", com 8 dígitos, e o
     link usa 555196489451. Mantido igual ao site atual até a loja confirmar
     se o certo é (51) 99648-9451 (ver README, pendências). */
  whatsapp: {
    numero: '(51) 99891-1378',
    e164: '5551998911378',
  },
  assistencia: {
    numero: '(51) 9648-9451',
    e164: '555196489451',
  },

  endereco: {
    logradouro: 'Av. da Igreja, 140',
    bairro: 'Centro',
    cidade: 'Tramandaí',
    uf: 'RS',
    cep: '95590-000',
    get completo() {
      return `${this.logradouro} · ${this.bairro}, ${this.cidade} - ${this.uf} · ${this.cep}`;
    },
    // Usado no link "traçar rota" e no mapa (o mesmo texto da busca do site atual).
    get busca() {
      return `DiFatto Scooters Elétricas - ${this.logradouro} - ${this.cidade}, ${this.uf}, ${this.cep}`;
    },
  },

  /* Enquanto `confirmado` for false, o rodapé mostra "consulte pelo WhatsApp"
     em vez de um horário que pode estar errado. */
  horarios: {
    confirmado: true,
    vendas: 'Dias úteis: 9h às 18h · Sáb. e feriados: 9h às 14h',
    assistencia: 'Dias úteis: 9h às 18h',
  },

  redes: {
    instagram: 'https://www.instagram.com/difattoeletricos/',
    instagramUsuario: '@difattoeletricos',
    youtube: 'https://www.youtube.com/@difattoscooterseletricas',
    youtubeUsuario: '@difattoscooterseletricas',
    facebook: 'https://www.facebook.com/difattoscooters',
  },

  /* De onde a visita veio, para a mensagem dizer "Vim pelo Instagram" e a
     equipe separar os leads (pedido do usuário, 09/11/2026). Lê o
     `utm_source` da URL (sem diferenciar maiúsculas) e o guarda até a aba
     fechar; fonte fora do mapa, ou visita sem UTM, vira `padrao`.
     Para incluir outra rede: uma linha em `porFonte` (ex.: tiktok: 'TikTok'). */
  origem: {
    parametro: 'utm_source',
    padrao: 'site',
    porFonte: {
      ig: 'Instagram',
      instagram: 'Instagram',
      fb: 'Facebook',
      facebook: 'Facebook',
    },
  },

  /* Mensagens pré-preenchidas, no formato dos projetos de referência:
     "Olá! Vim pelo {origem} e …". `{origem}`, `{modelo}`, `{cor}` e
     `{categoria}` são trocados na hora do clique (assets/js/whats.js). */
  prefixoMensagem: '',
  mensagens: {
    geral: 'Olá! Vim pelo {origem} e gostaria de saber mais sobre os modelos e condições especiais da DiFatto Scooters Elétricas.',
    produtos: 'Olá! Vim pelo {origem} e gostaria de saber mais sobre os produtos da DiFatto Scooters Elétricas.',
    modelo: 'Olá! Vim pelo {origem} e gostaria de saber mais sobre o modelo {modelo}.',
    modeloCor: 'Olá! Vim pelo {origem} e gostaria de saber mais sobre o modelo {modelo} na cor {cor}.',
    testRideGeral: 'Olá! Vim pelo {origem} e gostaria de agendar um test ride na DiFatto Scooters Elétricas.',
    testRideModelo: 'Olá! Vim pelo {origem} e gostaria de agendar um test ride do modelo {modelo}.',
    testRideModeloCor: 'Olá! Vim pelo {origem} e gostaria de agendar um test ride do modelo {modelo} na cor {cor}.',
    escolher: 'Olá! Vim pelo {origem} e quero ajuda para escolher a scooter certa para a minha rotina.',
    assistencia: 'Olá! Vim pelo {origem} e gostaria de falar com o time de Assistência Técnica da DiFatto Scooters Elétricas.',
    categoria: 'Olá! Vim pelo {origem} e gostaria de ver as opções de {categoria} da DiFatto Scooters Elétricas.',
  },
};
