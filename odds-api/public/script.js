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
        for (const casaAposta of jogo.odds) {
          const extras = await buscarOddsExtras(jogo.timeCasa, jogo.timeFora, jogo.data);

          const tr = document.createElement('tr');

          tr.innerHTML = `
            <td>${jogo.timeCasa} x ${jogo.timeFora}</td>
            <td>${casaAposta.h2h?.home ?? '-'}</td>
            <td>${casaAposta.h2h?.draw ?? '-'}</td>
            <td>${casaAposta.h2h?.away ?? '-'}</td>
            <td>${casaAposta.over ?? '-'}</td>
            <td>${casaAposta.under ?? '-'}</td>
            <td>${extras['Casa/Casa'] ?? '-'}</td>
            <td>${extras['Casa/Empate'] ?? '-'}</td>
            <td>${extras['Casa/Fora'] ?? '-'}</td>
            <td>${extras['Empate/Casa'] ?? '-'}</td>
          `;

          tabelaBody.appendChild(tr);
        }
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
