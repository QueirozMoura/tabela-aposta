document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  function criarTd(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
  }

  function criarLinha(nomeJogo, bk, maiorOver, maiorUnder, oddsExtra = {}) {
    const tr = document.createElement('tr');

    tr.appendChild(criarTd(nomeJogo));
    tr.appendChild(criarTd(bk.h2h?.home?.toFixed(2) || '-'));
    tr.appendChild(criarTd(bk.h2h?.draw?.toFixed(2) || '-'));
    tr.appendChild(criarTd(bk.h2h?.away?.toFixed(2) || '-'));

    const tdOver = criarTd(bk.over?.toFixed(2) || '-');
    if (bk.over && bk.over === maiorOver) tdOver.style.backgroundColor = 'lightgreen';
    tr.appendChild(tdOver);

    const tdUnder = criarTd(bk.under?.toFixed(2) || '-');
    if (bk.under && bk.under === maiorUnder) tdUnder.style.backgroundColor = 'lightblue';
    tr.appendChild(tdUnder);

    tr.appendChild(criarTd(oddsExtra['Casa/Casa'] || '-'));
    tr.appendChild(criarTd(oddsExtra['Casa/Empate'] || '-'));
    tr.appendChild(criarTd(oddsExtra['Casa/Fora'] || '-'));
    tr.appendChild(criarTd(oddsExtra['Empate/Casa'] || '-'));

    return tr;
  }

  async function buscarOddsExtras(timeCasa, timeFora, data) {
    const url = `https://tabela-aposta.onrender.com/api/odds-extras/htft?timeCasa=${encodeURIComponent(timeCasa)}&timeFora=${encodeURIComponent(timeFora)}&data=${data}`;
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar odds extras via backend:', error);
      return {};
    }
  }

  async function buscarOdds() {
    const url = 'https://tabela-aposta.onrender.com/api/odds/futebol';

    try {
      tabela.innerHTML = `<tr><td colspan="10">Carregando dados...</td></tr>`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const dados = await response.json();

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="10">Nenhum dado disponível</td></tr>`;
        return;
      }

      const linhasComOdds = await Promise.all(
        dados.map(async (jogo) => {
          const nomeJogo = `${jogo.timeCasa} x ${jogo.timeFora}`;
          const dataJogo = jogo.data?.split('T')[0];

          let maiorOver = 0;
          let maiorUnder = 0;

          jogo.odds.forEach(bk => {
            if (!casasPermitidas.includes(bk.casa)) return;
            if (bk.over && bk.over > maiorOver) maiorOver = bk.over;
            if (bk.under && bk.under > maiorUnder) maiorUnder = bk.under;
          });

          const oddsExtras = await buscarOddsExtras(jogo.timeCasa, jogo.timeFora, dataJogo);

          return jogo.odds
            .filter(bk => casasPermitidas.includes(bk.casa))
            .map(bk => criarLinha(nomeJogo, bk, maiorOver, maiorUnder, oddsExtras));
        })
      );

      tabela.innerHTML = '';
      linhasComOdds.flat().forEach(linha => tabela.appendChild(linha));

    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="10">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);
  buscarOdds(); // Busca inicial
});
