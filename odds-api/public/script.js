document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  async function buscarOdds() {
    try {
      const apiUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:3000/api/odds/futebol'
          : '/api/odds/futebol';

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const dados = await response.json();
      tabela.innerHTML = '';

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="16">Nenhum dado disponível</td></tr>`;
        return;
      }

      dados.forEach(jogo => {
        const nomeJogo = jogo.jogo;

        // Se não houver odds para este jogo
        if (!jogo.odds || jogo.odds.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 16;
          td.textContent = `${nomeJogo} - Sem odds disponíveis`;
          tr.appendChild(td);
          tabela.appendChild(tr);
          return;
        }

        // Processa odds das casas permitidas
        jogo.odds.forEach(casa => {
          if (!casasPermitidas.includes(casa.casa)) return;

          const tr = document.createElement('tr');

          // Coluna: Nome do jogo
          const tdJogo = document.createElement('td');
          tdJogo.textContent = nomeJogo;

          // Coluna: Nome da casa de aposta
          const tdCasa = document.createElement('td');
          tdCasa.textContent = casa.casa;

          // Colunas 1X2 - não disponíveis para totals, coloca '-'
          const tdEmpate = document.createElement('td');
          tdEmpate.textContent = '-';

          const tdFora = document.createElement('td');
          tdFora.textContent = '-';

          // Colunas Mais/Menos 2.5 gols
          const tdMais25 = document.createElement('td');
          const tdMenos25 = document.createElement('td');

          if (casa.over && typeof casa.over.price === 'number') {
            tdMais25.textContent = casa.over.price.toFixed(2);
            tdMais25.style.backgroundColor = casa.over.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMais25.textContent = '-';
          }

          if (casa.under && typeof casa.under.price === 'number') {
            tdMenos25.textContent = casa.under.price.toFixed(2);
            tdMenos25.style.backgroundColor = casa.under.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMenos25.textContent = '-';
          }

          // Colunas extras para completar 16 colunas
          const colunasExtras = Array.from({ length: 10 }, () => {
            const td = document.createElement('td');
            td.textContent = '-';
            return td;
          });

          // Monta a linha
          tr.appendChild(tdJogo);
          tr.appendChild(tdCasa);
          tr.appendChild(tdEmpate);
          tr.appendChild(tdFora);
          tr.appendChild(tdMais25);
          tr.appendChild(tdMenos25);
          colunasExtras.forEach(td => tr.appendChild(td));

          tabela.appendChild(tr);
        });
      });
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="16">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);
  buscarOdds();
});
