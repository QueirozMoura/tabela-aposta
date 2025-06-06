const baseUrl = 'https://tabela-aposta.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const tabelaBody = document.querySelector('#tabela-jogos tbody');
  const btnAtualizar = document.getElementById('atualizar');

  btnAtualizar.addEventListener('click', () => {
    carregarOdds();
  });

  async function carregarOdds() {
    tabelaBody.innerHTML = ''; // limpa a tabela

    try {
      const res = await axios.get(`${baseUrl}/api/odds/futebol`);
      const jogos = res.data;

      for (const jogo of jogos) {
        const oddCasa = parseFloat(jogo.casa ?? 0);
        const oddEmpate = parseFloat(jogo.empate ?? 0);
        const oddFora = parseFloat(jogo.fora ?? 0);

        const extras = await buscarOddsExtras(jogo.home_team, jogo.away_team, jogo.data);

        const maiorOdd = Math.max(oddCasa, oddEmpate, oddFora);

        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${jogo.home_team} x ${jogo.away_team}</td>
          <td class="${oddCasa === maiorOdd ? 'maior-odd' : ''}">${oddCasa || '-'}</td>
          <td class="${oddEmpate === maiorOdd ? 'maior-odd' : ''}">${oddEmpate || '-'}</td>
          <td class="${oddFora === maiorOdd ? 'maior-odd' : ''}">${oddFora || '-'}</td>
          <td>${jogo.over25 ?? '-'}</td>
          <td>${jogo.under25 ?? '-'}</td>
          <td>${extras['Casa/Casa'] ?? '-'}</td>
          <td>${extras['Casa/Empate'] ?? '-'}</td>
          <td>${extras['Casa/Fora'] ?? '-'}</td>
          <td>${extras['Empate/Casa'] ?? '-'}</td>
        `;

        tabelaBody.appendChild(tr);
      }
    } catch (error) {
      console.error('Erro ao carregar odds:', error);
    }
  }

  async function buscarOddsExtras(timeCasa, timeFora, data) {
    try {
      const res = await axios.get(`${baseUrl}/api/odds-extras/htft`, {
        params: { timeCasa, timeFora, data }
      });
      return res.data;
    } catch (error) {
      console.error('Erro ao buscar odds extras:', error.response?.data ?? error.message);
      return {};
    }
  }

  // Carrega odds ao abrir a página
  carregarOdds();
});
