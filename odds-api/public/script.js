document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  async function buscarOdds() {
    try {
      const response = await fetch('https://tabela-aposta.onrender.com/api/odds/futebol');
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const dados = await response.json();
      tabela.innerHTML = '';

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="16">Nenhum dado disponível</td></tr>`;
        return;
      }

      dados.forEach(jogo => {
        const nomeJogo = jogo.jogo;

        jogo.odds.forEach(casa => {
          if (!casasPermitidas.includes(casa.casa)) return;

          const tr = document.createElement('tr');

          // Nome do jogo (ex: Flamengo x Vasco)
          const tdJogo = document.createElement('td');
          tdJogo.textContent = nomeJogo;

          // Odds 1X2 (h2h)
          const tdCasa = document.createElement('td');
          tdCasa.textContent = casa.h2h?.home ?? '-';

          const tdEmpate = document.createElement('td');
          tdEmpate.textContent = casa.h2h?.draw ?? '-';

          const tdFora = document.createElement('td');
          tdFora.textContent = casa.h2h?.away ?? '-';

          // Odds Mais/Menos 2.5 gols (totals)
          const tdMais25 = document.createElement('td');
          const tdMenos25 = document.createElement('td');

          const oddOver = parseFloat(casa.over?.price || 0);
          const oddUnder = parseFloat(casa.under?.price || 0);

          tdMais25.textContent = oddOver > 0 ? oddOver.toFixed(2) : '-';
          tdMenos25.textContent = oddUnder > 0 ? oddUnder.toFixed(2) : '-';

          if (oddOver >= 2.5) tdMais25.style.backgroundColor = 'lightgreen';
          else if (oddOver > 0) tdMais25.style.backgroundColor = 'lightcoral';

          if (oddUnder >= 2.5) tdMenos25.style.backgroundColor = 'lightgreen';
          else if (oddUnder > 0) tdMenos25.style.backgroundColor = 'lightcoral';

          // Colunas extras que a API não cobre — preenche com '-'
          const colunasExtras = 9; // quantidade de colunas extras
          const colunasFaltando = Array.from({ length: colunasExtras }, () => {
            const td = document.createElement('td');
            td.textContent = '-';
            return td;
          });

          tr.appendChild(tdJogo);
          tr.appendChild(tdCasa);
          tr.appendChild(tdEmpate);
          tr.appendChild(tdFora);
          tr.appendChild(tdMais25);
          tr.appendChild(tdMenos25);
          colunasFaltando.forEach(td => tr.appendChild(td));

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
