/* ==========================================================================
   DIFATTO · catálogo de modelos
   --------------------------------------------------------------------------
   OS 20 MODELOS DO SITE ATUAL, na ordem de lá, coletados em 21/10/2026 de
   difattoeletricos.com: card da vitrine (números, tags, preço, ícones de
   CNH/emplacamento) e popup de detalhes (lista de características, cores e
   galeria, que o WordPress carregava por AJAX). O bruto está em
   projeto/modelos_site/modelos-wp.json e em <modelo>/dados-wp.json.

   REGRA: nenhum número entra sem fonte. Onde o card e o popup do mesmo
   modelo discordam, vale o CARD (é o que o cliente vê primeiro) e o número
   da ficha vai na `nota` da linha. As divergências estão no README.

   FOTOS: o recorte do card e a galeria vêm de galerias.js (gerado pelo
   tools/build-media.js). Numa cor, `foto` é a posição da foto na galeria do
   popup do WP (1 = primeira), a mesma ligação que as amostras de lá faziam;
   `fotoCor` é a foto do veículo inteiro naquela cor (modelos_site/<id>/<cor>.webp),
   que entra na galeria logo depois do recorte do card.
   ========================================================================== */

/* Ordem canônica da ficha, igual para todo modelo. Campo ausente não aparece. */
window.DF_FICHA_ORDEM = [
  ['velocidade', 'Velocidade máxima'],
  ['potencia', 'Motor'],
  ['autonomia', 'Autonomia'],
  ['bateria', 'Bateria'],
  ['recarga', 'Tempo de recarga'],
  ['carregador', 'Carregador'],
  ['freios', 'Freios'],
  ['suspensao', 'Suspensão'],
  ['rodas', 'Rodas e pneus'],
  ['quadro', 'Quadro'],
  ['protecao', 'Proteção'],
  ['carga', 'Carga máxima'],
  ['lugares', 'Lugares'],
  ['peso', 'Peso'],
  ['rampa', 'Rampa'],
];

/* As cinco categorias do filtro do site atual, na ordem de lá. Um modelo
   pode estar em mais de uma, como no WordPress. A nota aparece sob o filtro
   quando a categoria é escolhida. Categoria sem modelo não vira botão. */
window.DF_CATEGORIAS = [
  {
    id: 'todos',
    nome: 'Todos',
    nota: 'Todos os modelos. Se precisa ou não de CNH está no selo de cada card.',
  },
  {
    id: 'autopropelido',
    nome: 'Autopropelidos',
    nota: 'Autopropelidos: motor de até 1000 W, até 32 km/h e até 70 cm de largura. Sem CNH e sem emplacamento (Resolução CONTRAN nº 996).',
  },
  {
    id: 'ciclomotor',
    nome: 'Ciclomotores',
    nota: 'Mais potência e velocidade. Ciclomotores exigem CNH e emplacamento.',
  },
  {
    id: 'scooter',
    nome: 'Scooters',
    nota: 'Scooters elétricas. Se precisa ou não de CNH está no selo de cada card.',
  },
  {
    id: 'triciclo',
    nome: 'Triciclos',
    nota: 'Três rodas, mais estabilidade. Os triciclos da DiFatto são autopropelidos: sem CNH e sem emplacamento.',
  },
];

/* Selo legal. Substitui os ícones cnh_0/1 e emplacamento_0/1 do site atual:
   texto é acessível, indexável e não custa requisição. */
window.DF_CLASSIFICACOES = {
  autopropelido: {
    selos: [{ t: 'Sem CNH', tom: 'livre' }, { t: 'Sem emplacamento', tom: 'livre' }],
  },
  ciclomotor: {
    selos: [{ t: 'Requer CNH', tom: 'exige' }, { t: 'Emplacamento', tom: 'exige' }],
  },
};

/* Tint do topo do card (styleguide: olive / rose / sand / gray), escolhido
   pelo fundo que cada card tinha no WordPress. `sky` cobre o fundo azulado
   (bob_b.webp) que o styleguide não listou. */
window.DF_TONS = {
  olive: '#D9D4B8',
  rose: '#F2C4C6',
  sand: '#E3DDC6',
  gray: '#DEDEDE',
  sky: '#CFE0E6',
};

/* ── Cores (hex medido no centro da amostra do WP) ─────────────────────── */

const COR = {
  preta: { nome: 'Preta', hex: '#101010' },
  branca: { nome: 'Branca', hex: '#FFFFFF' },
  vermelha: { nome: 'Vermelha', hex: '#F94B52' },
  vinho: { nome: 'Vinho', hex: '#B5193E' },
  azul: { nome: 'Azul', hex: '#1833C3' },
  azulRoyal: { nome: 'Azul', hex: '#1A42C4' },
  azulPetroleo: { nome: 'Azul', hex: '#84BCC3' },
  azulClaro: { nome: 'Azul-claro', hex: '#97D4E6' },
  grafite: { nome: 'Grafite', hex: '#615E62' },
  prata: { nome: 'Prata', hex: '#979797', imagem: 'assets/img/cores/prata.webp' },
  verdeMilitar: { nome: 'Verde militar', hex: '#546A53' },
  verdeLima: { nome: 'Verde-lima', hex: '#C7DE88' },
  pink: { nome: 'Pink', hex: '#EA007A' },
  furtaCor: { nome: 'Furta-cor', hex: '#716081', imagem: 'assets/img/cores/furta-cor.webp' },
  cobre: { nome: 'Cobre', hex: '#BE6944' },
};

const comFoto = (cor, foto) => ({ ...cor, foto });

/* Ordem da vitrine = ordem do site atual. Quem não estiver na lista aparece
   depois, na ordem do catálogo.
   OCULTAR um modelo sem apagá-lo: `oculto: true` no bloco dele (some da
   vitrine, das contagens, do modal e do JSON-LD). Para voltar, apague a linha. */
window.DF_ORDEM = [
  'gremio', 'inter', 'fittipaldi', 'eko-pro', 'eko10', 'sidney', 'fenix', 'fox',
  'dubai', 'tokyo', 'ultra-x', 'tui-plus', 'tui', 'rio', 'x11-1000w', 'mia-tri',
  'x12', 'x11', 'jet', 'mia',
];

/* Ficha dos três modelos da linha Di Fatto (popups idênticos no WP). */
const FICHA_LINHA_DIFATTO = {
  velocidade: { valor: 32, unidade: 'km/h' },
  potencia: { valor: 1000, unidade: 'W' },
  autonomia: { valor: 50, unidade: 'km' },
  bateria: '72V 20Ah',
  recarga: '6 a 8 horas',
  freios: 'A disco, dianteiro e traseiro',
  rodas: 'Aro 10", pneus tubeless',
  carga: 'Até 180 kg',
};
const EQUIP_LINHA_DIFATTO = ['Painel digital com NFC', 'Marcha ré', 'Baú interno', 'Entrada USB', 'Suporte para celular'];

/* Ficha de Ultra X, TUI+, TUI e Rio (mesma lista no WP, muda a carga). */
const fichaFatBoy = (extra) => ({
  velocidade: { valor: 32, unidade: 'km/h' },
  potencia: { valor: 1000, unidade: 'W' },
  autonomia: { valor: 30, unidade: 'km' },
  bateria: 'Lítio',
  recarga: '6 a 8 horas',
  carregador: 'Bivolt',
  freios: 'A disco',
  ...extra,
});

/* Ficha da Jet e da Mia (MotoChefe, mesma lista no WP). */
const fichaMotoChefe = () => ({
  velocidade: { valor: 32, unidade: 'km/h' },
  potencia: { valor: 1000, unidade: 'W' },
  autonomia: { valor: 40, unidade: 'km', nota: 'O detalhe do modelo informa até 50 km.' },
  bateria: 'Lítio 60V 20Ah, removível',
  recarga: '6 a 7 horas',
  freios: 'A disco, dianteiro e traseiro',
  carga: 'Até 150 kg',
});

window.DF_MODELOS = [
  {
    id: 'gremio',
    oculto: true, // por enquanto, a pedido do time interno (09/11/2026)
    wp: 'gremio',
    nome: 'Grêmio',
    fabricante: null,
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Mobilidade', 'Clássica'],
    categorias: ['autopropelido'], // no WP estava sem categoria (ver README)
    classificacao: 'autopropelido',
    tom: 'olive',
    preco: { valor: 14990 },
    specs: { ...FICHA_LINHA_DIFATTO },
    equipamentos: EQUIP_LINHA_DIFATTO,
    cores: [{ nome: 'Branca e azul', bicolor: ['#F4F4F4', '#1E9BE6'] }],
  },
  {
    id: 'inter',
    oculto: true, // por enquanto, a pedido do time interno (09/11/2026)
    wp: 'monaco-2-2',
    nome: 'Inter',
    fabricante: 'Di Fatto',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Conforto', 'Design'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 14990 },
    specs: { ...FICHA_LINHA_DIFATTO },
    equipamentos: EQUIP_LINHA_DIFATTO,
    cores: [{ nome: 'Branca e vermelha', bicolor: ['#F4F4F4', '#EF4B4F'] }],
  },
  {
    id: 'fittipaldi',
    oculto: true, // por enquanto, a pedido do time interno (09/11/2026)
    wp: 'monaco-2',
    nome: 'Fittipaldi',
    fabricante: 'Di Fatto',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Design', 'Confiança'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'olive',
    preco: { valor: 14990 },
    specs: { ...FICHA_LINHA_DIFATTO },
    equipamentos: EQUIP_LINHA_DIFATTO,
    cores: [{ nome: 'Preta e dourada', bicolor: ['#262626', '#CDAF78'], foto: 1 }],
  },
  {
    id: 'eko-pro',
    wp: 'eko-pro',
    nome: 'EKO PRO',
    fabricante: null,
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Conforto', 'Mobilidade'],
    categorias: ['triciclo'],
    classificacao: 'autopropelido',
    tom: 'sand',
    preco: { valor: 15990, parcelas: 'Em até 18x de R$ 1.110' },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km' },
      bateria: 'Fixa (não removível)',
      suspensao: 'Dianteira e traseira',
      carga: 'Até 180 kg',
      lugares: '1 lugar',
    },
    equipamentos: [
      'Banco com apoios de braço móveis', 'Baú traseiro', 'Alarme com controle remoto', 'Marcha ré',
      '3 níveis de força', 'Painel digital com velocímetro', 'Entrada USB', 'Setas de sinalização', 'Buzina',
    ],
    cores: [COR.prata],
  },
  {
    id: 'eko10',
    wp: 'eko10',
    nome: 'EKO10',
    fabricante: null,
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Conforto', 'Leveza'],
    categorias: ['triciclo'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 14990, parcelas: 'Em até 18x de R$ 1.040' },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km' },
      suspensao: 'Sim',
      rodas: 'Aro 10" em alumínio',
      carga: 'Até 180 kg',
      lugares: '1 lugar',
    },
    equipamentos: [
      'Banco com apoios de braço móveis', 'Baú traseiro', 'Alarme com controle remoto', 'Marcha ré',
      '3 níveis de força', 'Painel digital com velocímetro', 'Setas de sinalização', 'Buzina',
    ],
    cores: [COR.vinho],
  },
  {
    id: 'sidney',
    wp: 'sidney',
    nome: 'Sidney',
    fabricante: null,
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Conforto', 'Design'],
    categorias: ['triciclo'],
    classificacao: 'autopropelido',
    tom: 'gray',
    preco: { valor: 12990, parcelas: 'Em até 18x de R$ 939' },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 30, unidade: 'km' },
      bateria: '60V 20Ah',
      freios: 'A disco hidráulico nas 3 rodas',
      suspensao: 'Amortecedores hidráulicos',
      rodas: 'Pneus 3.5-8" tubeless',
      carga: 'Até 180 kg',
      lugares: '3 lugares',
    },
    equipamentos: [
      'Acionamento por controle remoto, chave e TAG', 'Tecnologia NFC', 'Painel digital', 'Iluminação full LED',
      'Farol de LED', 'Luz de freio', 'Setas de sinalização', 'Compartimento sob o banco', 'Trava nos manetes de freio',
    ],
    cores: [comFoto(COR.preta, 1), COR.vermelha],
  },
  {
    id: 'fenix',
    wp: 'fenix',
    nome: 'FÊNIX',
    fabricante: null,
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Conforto', 'Confiança'],
    categorias: ['triciclo'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 12990 },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 750, unidade: 'W' },
      autonomia: { valor: 30, unidade: 'km', nota: 'O detalhe do modelo informa de 40 a 50 km por carga.' },
      bateria: '48V 20Ah',
      freios: 'Dianteiro hidráulico, traseiro a tambor',
      suspensao: 'Hidráulica',
      carga: 'Até 180 kg',
    },
    equipamentos: [
      'Baú traseiro com trava', 'Compartimento frontal', 'Alarme com controle', 'Cartão NFC', 'Marcha ré',
      'Painel digital', 'Indicador de bateria', 'Suporte para celular', 'Carregador USB', 'Setas de sinalização',
    ],
    cores: [comFoto(COR.vinho, 1), COR.prata],
  },
  {
    id: 'fox',
    wp: 'fo',
    nome: 'FOX',
    fabricante: null,
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Conforto', 'Agilidade'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 7990 },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 800, unidade: 'W' },
      autonomia: { valor: 30, unidade: 'km', nota: 'De 25 a 30 km por carga, segundo o detalhe do modelo.' },
      recarga: 'Em torno de 6 a 8 horas',
      carregador: 'Bivolt',
      freios: 'Dianteiro V-brake em alumínio, traseiro a disco',
      quadro: 'Aço carbono',
      carga: 'Até 120 kg',
    },
    equipamentos: ['Farol de LED', 'Alarme', 'Buzina'],
    cores: [COR.preta, COR.azul],
  },
  {
    id: 'dubai',
    wp: 'dubai',
    nome: 'Dubai',
    fabricante: 'Conduzza',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Conforto', 'Autonomia'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'gray',
    preco: { valor: 12990 },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 60, unidade: 'km' },
      recarga: '6 a 8 horas',
      carga: 'Até 180 kg',
    },
    equipamentos: ['Painel digital com NFC', 'Iluminação full LED', 'USB e Bluetooth', 'Suporte para celular'],
    cores: [comFoto(COR.prata, 2), comFoto(COR.branca, 1)],
  },
  {
    id: 'tokyo',
    wp: 'tokyo',
    nome: 'Tokyo',
    fabricante: 'Conduzza',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Leveza', 'Urban'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'sky',
    preco: { valor: 10990 },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km', nota: 'O detalhe do modelo informa até 55 km.' },
      freios: 'A disco',
      carga: 'Até 150 kg',
    },
    equipamentos: ['Painel digital', 'NFC'],
    cores: [COR.prata, COR.grafite],
  },
  {
    id: 'ultra-x',
    wp: 'ultra-x',
    nome: 'Ultra X',
    fabricante: 'Ultra X',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Design', 'Dia a dia'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'sky',
    preco: { valor: 8990, parcelas: 'Em até 18x de R$ 673' },
    specs: fichaFatBoy({ carga: 'Até 150 kg' }),
    cores: [comFoto(COR.verdeMilitar, 1), COR.vinho],
  },
  {
    id: 'tui-plus',
    wp: 'tui-2',
    nome: 'TUI+',
    fabricante: 'Tui',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Design', 'Agilidade'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 8990 },
    specs: fichaFatBoy({ carga: 'Até 150 kg' }),
    cores: [comFoto(COR.cobre, 1), COR.preta],
  },
  {
    id: 'tui',
    wp: 'tui',
    nome: 'TUI',
    fabricante: 'Tui',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Mobilidade', 'Design'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'sand',
    preco: { valor: 7890 },
    specs: fichaFatBoy({ carga: 'Até 120 kg' }),
    cores: [comFoto(COR.branca, 1)],
  },
  {
    id: 'rio',
    wp: 'rio',
    nome: 'Rio',
    fabricante: 'Conduzza',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Mobilidade', 'Leveza'],
    categorias: ['autopropelido'],
    classificacao: 'autopropelido',
    tom: 'sky',
    preco: { valor: 6990 },
    specs: fichaFatBoy({ potencia: { valor: 800, unidade: 'W' }, bateria: 'Chumbo', carga: 'Até 120 kg' }),
    /* No WP as duas amostras levavam à foto 1 (a azul). A verde militar fica
       sem foto até a loja mandar uma. */
    cores: [comFoto(COR.azulPetroleo, 1), COR.verdeMilitar],
  },
  {
    id: 'x11-1000w',
    wp: 'x11-1000w',
    nome: 'X11 1000W',
    fabricante: 'MotoChefe',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Agilidade', 'Confiança'],
    categorias: ['autopropelido', 'scooter'],
    classificacao: 'autopropelido',
    tom: 'gray',
    preco: { valor: 9990, parcelas: 'No Pix ou dinheiro' },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km', nota: 'Até 80 km com a bateria extra, segundo o detalhe do modelo.' },
      recarga: '6 a 8 horas',
      carregador: 'Bivolt',
      carga: 'Até 180 kg',
    },
    equipamentos: ['Liga/desliga com cartão NFC', 'Painel digital', 'Farol de LED', 'Encosto para passageiro'],
    cores: [comFoto(COR.azul, 3), COR.preta],
  },
  {
    id: 'mia-tri',
    wp: 'mia-tri',
    nome: 'Mia Tri',
    fabricante: 'MotoChefe',
    descritivo: 'Triciclo elétrico',
    tags: ['Estilo', 'Clássica', 'Leveza'],
    categorias: ['autopropelido', 'triciclo'],
    classificacao: 'autopropelido',
    tom: 'sky',
    preco: { valor: 14990, parcelas: 'Em até 18x de R$ 1.040' },
    /* A ficha do WP traz "Tamanho do veículo: 1356562mm", medida truncada no
       cadastro. Fica fora até a loja confirmar (ver README). */
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 800, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km' },
      bateria: 'Lítio 60V 20Ah',
      freios: 'Disco dianteiro e tambor traseiro',
      suspensao: 'Hidráulica dianteira e traseira',
      rodas: 'Liga leve',
      carga: 'Até 180 kg',
      peso: '87,75 kg',
      rampa: 'Até 12°',
    },
    cores: [COR.azulClaro, comFoto(COR.preta, 1), COR.branca],
  },
  {
    id: 'x12',
    wp: 'x12-2',
    nome: 'X12',
    fabricante: 'MotoChefe',
    descritivo: 'Scooter elétrica',
    tags: ['Estilo', 'Conforto', 'Economia'],
    categorias: ['autopropelido', 'scooter'],
    classificacao: 'autopropelido',
    tom: 'rose',
    preco: { valor: 10990, parcelas: 'No Pix ou dinheiro' },
    specs: {
      velocidade: { valor: 32, unidade: 'km/h' },
      potencia: { valor: 1000, unidade: 'W' },
      autonomia: { valor: 40, unidade: 'km', nota: 'O detalhe do modelo informa até 50 km.' },
      bateria: 'Lítio 60V 20Ah, removível',
      recarga: '6 a 7 horas',
      freios: 'A disco, dianteiro e traseiro',
      carga: 'Até 150 kg',
    },
    equipamentos: ['Liga/desliga com cartão NFC', 'Alarme antifurto com trava de motor', '3 níveis de velocidade'],
    /* As quatro cores com foto que a loja mandou (21/10/2026), em
       modelos_site/x12/<cor>.webp. As sete amostras do WP saíram. */
    cores: [
      { nome: 'Fibra', hex: '#3F4448', fotoCor: 'fibra' },
      { nome: 'Vermelha', hex: '#8E1622', fotoCor: 'vermelha' },
      { nome: 'Reino Unido', bicolor: ['#1B2F8F', '#C8102E'], fotoCor: 'reino-unido' },
      { ...COR.branca, fotoCor: 'branca' },
    ],
  },
  {
    id: 'x11',
    wp: 'x11',
    nome: 'X11',
    fabricante: 'MotoChefe',
    descritivo: 'Ciclomotor elétrico',
    tags: ['Estilo', 'Potência', 'Autonomia'],
    categorias: ['ciclomotor', 'scooter'],
    classificacao: 'ciclomotor',
    tom: 'olive',
    preco: { valor: 12490, parcelas: 'Em até 12x sem juros no cartão' },
    /* O card mostra a versão 2000 W; o popup lista também a de 3000 W. */
    specs: {
      velocidade: { valor: 50, unidade: 'km/h', nota: 'Versão 3000 W: até 70 km/h, com rodas aro 12".' },
      potencia: { valor: 2000, unidade: 'W', nota: 'Também na versão de 3000 W.' },
      autonomia: { valor: 80, unidade: 'km', nota: 'Com a bateria extra.' },
      recarga: '6 a 8 horas',
      carregador: 'Bivolt',
      freios: 'A disco',
      rodas: 'Liga leve aro 10" (2000 W) ou 12" (3000 W)',
      protecao: 'IP65 · resistente à água',
      carga: 'Até 180 kg',
    },
    equipamentos: [
      'Alarme com bloqueio e trava', 'Liga/desliga com cartão NFC', 'Compartimento para bateria extra',
      'Painel digital', 'Farol de LED com 3 níveis', 'Encosto para passageiro', 'Porta-objetos sob o assento',
    ],
    cores: [COR.preta, COR.vermelha, COR.azul, COR.grafite],
  },
  {
    id: 'jet',
    wp: 'jet',
    nome: 'Jet',
    fabricante: 'MotoChefe',
    descritivo: 'Scooter elétrica',
    tags: ['Design', 'Economia', 'Autonomia'],
    categorias: ['autopropelido', 'scooter'],
    classificacao: 'autopropelido',
    tom: 'gray',
    preco: { valor: 11990, parcelas: 'Em até 18x de R$ 834' },
    specs: fichaMotoChefe(),
    equipamentos: ['Alarme antifurto com trava de motor', '3 níveis de velocidade', 'Porta-objetos sob o banco'],
    cores: [comFoto(COR.branca, 5), comFoto(COR.azulRoyal, 1), comFoto(COR.preta, 4)],
  },
  {
    id: 'mia',
    wp: 'mia',
    nome: 'Mia',
    fabricante: 'MotoChefe',
    descritivo: 'Scooter elétrica',
    tags: ['Design', 'Clássica', 'Economia'],
    categorias: ['autopropelido', 'scooter'],
    classificacao: 'autopropelido',
    tom: 'gray',
    preco: { valor: 11990, parcelas: 'Em até 18x de R$ 834' },
    specs: fichaMotoChefe(),
    equipamentos: ['Alarme antifurto com trava de motor', '3 níveis de velocidade', 'Porta-objetos sob o banco'],
    cores: [COR.pink, comFoto(COR.preta, 1), COR.branca, COR.verdeLima, COR.furtaCor],
  },
];

/* FAQ do site atual, as doze perguntas na ordem de lá. Revisão mínima de
   texto (concordância, acentos e a sigla da resolução por extenso). */
window.DF_FAQ = [
  {
    q: 'Quais modelos não precisam de CNH e emplacamento?',
    a: 'Nossos modelos autopropelidos e bikes se enquadram corretamente na legislação; por isso, não exigem CNH nem emplacamento. Autopropelidos: largura de até 70 cm, eixo de 1,28 m, motor de até 1.000 W e velocidade de até 32 km/h, conforme a Resolução CONTRAN nº 996.',
  },
  {
    q: 'Vocês possuem modelos homologados?',
    a: 'Todos os nossos modelos são homologados e atendem às normativas vigentes em nossa legislação.',
  },
  {
    q: 'Vocês vendem as peças para a manutenção das scooters?',
    a: 'Temos o maior estoque de motos e peças para atender a reposição imediata na manutenção da sua scooter.',
  },
  {
    q: 'É obrigatório o uso de capacete?',
    a: 'Recomendamos fortemente o uso por segurança. Se você quiser, também te indicamos os itens essenciais para rodar com mais proteção.',
  },
  {
    q: 'Vocês têm assistência técnica?',
    a: 'Sim. Nossa loja conta com uma oficina toda equipada, além de estoque de peças para reposição imediata e mão de obra qualificada, feita por técnicos especializados.',
  },
  {
    q: 'Qual é o tempo de recarga completa?',
    a: 'Varia por bateria e modelo. Em geral, a recarga pode levar algumas horas. Antes da compra, te informamos o tempo estimado do modelo que você está vendo.',
  },
  {
    q: 'Quanto gasto de luz para carregar minha scooter?',
    a: 'Você gasta menos de R$ 5,00 para uma recarga completa.',
  },
  {
    q: 'Como faço a limpeza da minha scooter?',
    a: 'Nossas scooters contam com índice de proteção (IP65), que possibilita não só a lavagem a seco, como também a lavagem com água corrente para uma limpeza melhor.',
  },
  {
    q: 'Quais são as formas de pagamento?',
    a: 'Até 12x sem juros no cartão de crédito, dinheiro, PIX ou transferência bancária.',
  },
  {
    q: 'Posso carregar minha moto em tomada 110V e 220V?',
    a: 'Em ambas, pois nossas scooters são bivolt.',
  },
  {
    q: 'As baterias são de lítio?',
    a: 'Sim! Elas são muito mais leves do que outros tipos de bateria do mesmo tamanho e têm vantagens em relação às de chumbo: maior ciclo de vida, maior eficiência de carga e descarga e menor tempo de carregamento. Além disso, a maioria das peças das baterias de lítio é reciclável, o que as torna ótimas opções para o meio ambiente.',
  },
  {
    q: 'Motivos para comprar uma scooter elétrica',
    a: 'Veículo autossustentável que te ajuda a otimizar o seu tempo, economizar dinheiro e ainda cuidar do meio ambiente.',
  },
];

/* Depoimentos reais, do Google, como estão no site atual. Texto do cliente
   sem retoque (só a quebra de linha virou espaço). Sem foto: avatar com a
   inicial, como manda o styleguide. */
window.DF_DEPOIMENTOS = [
  { nome: 'Caroline Muller', estrelas: 5, texto: 'Atendimento top desde a negociação até a entrega. Equipe atenciosa e dedicada, além disso, explicam todos os detalhes sobre a Scooter, inclusive o que a legislação permite. Super indico 👏👏' },
  { nome: 'Beatriz Terra', estrelas: 5, texto: 'Maravilhosa atendimento inigualável super recomendo! O produto top de linha estamos adorando!' },
  { nome: 'Fabiana Moraes', estrelas: 5, texto: 'Ótimo! Atendimento atencioso, todas as dúvidas esclarecidas. Respostas imediatas. Estou muito contente com minha aquisição e com a atenção/Atendimento que recebi!' },
  { nome: 'Aline Santos', estrelas: 5, texto: 'Experiência muito boa, ótimo atendimento da loja e do vendedor Cristiano loja de Tramandaí (super recomendo) podem adquirir economia 🥰' },
  { nome: 'Henrique Cunha', estrelas: 5, texto: 'Ótimo atendimento! Fomos atendidos pelo Cristiano e pelo Valdair. Foram super atenciosos! Empresa muito boa de negociação!' },
  { nome: 'Nicolli Cantelli', estrelas: 5, texto: 'Comprei uma motinha elétrica nesta loja e fiquei muito satisfeita com o atendimento. O vendedor é super gentil, atencioso e tira todas as dúvidas com paciência. A loja passa bastante confiança, entrega tudo certinho e as motinhas têm ótima qualidade.' },
  { nome: 'Ana Souza', estrelas: 5, texto: 'Primeira vez que fiz esta compra na loja, ótimo atendimento e condições especiais para pagamento. Super indico 🙏🏼🙏🏼' },
  { nome: 'Vitória Beck', estrelas: 5, texto: 'Gostei muito da loja tem um bom atendimento, loja com facilidade de compra muito educados e produtos excelente.' },
  { nome: 'Tamara Borba', estrelas: 5, texto: 'Pessoas super qualificadas no atendimento, atenciosos sempre dispostos a tirarem dúvidas. Recomendo a todos q procuram uma empresa de confiança. São uma empresa q realmente podemos confiar tanto no q estamos adquirindo assim como com quem estamos falando.' },
  { nome: 'Mirna Licoski', estrelas: 5, texto: 'Loja Top recomendo. Podem procurar o Cristiano. Vendedor top. Atencioso, gentil e muito prestativo no atendimento. 👏🏻👏🏻👏🏻🙌🏻🙌🏻' },
];
