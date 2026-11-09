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

  /* Mensagens pré-preenchidas. As de modelo, geral e assistência são as do
     site atual, palavra por palavra: é por elas que a equipe reconhece o lead
     que vem do site. No WordPress o fim da frase saía "[site_title]" (o
     shortcode não era trocado); aqui sai o nome da loja.
     `{modelo}`, `{cor}` e `{categoria}` são trocados na hora do clique. */
  prefixoMensagem: '',
  mensagens: {
    geral: 'Olá! Gostaria de saber mais sobre os modelos e condições especiais da DiFatto Scooters Elétricas.',
    produtos: 'Olá, gostaria de saber mais sobre os Produtos da DiFatto Scooters Elétricas.',
    modelo: 'Olá, gostaria de saber mais sobre o modelo {modelo}',
    modeloCor: 'Olá, gostaria de saber mais sobre o modelo {modelo} na cor {cor}',
    testRideGeral: 'Olá! Gostaria de agendar um test ride na DiFatto Scooters Elétricas.',
    testRideModelo: 'Olá! Gostaria de agendar um test ride do modelo {modelo}.',
    testRideModeloCor: 'Olá! Gostaria de agendar um test ride do modelo {modelo} na cor {cor}.',
    escolher: 'Olá! Quero ajuda para escolher a scooter certa para a minha rotina.',
    assistencia: 'Olá, gostaria de falar com o time de Assistência Técnica da DiFatto Scooters Elétricas.',
    categoria: 'Olá! Gostaria de ver as opções de {categoria} da DiFatto Scooters Elétricas.',
  },
};
