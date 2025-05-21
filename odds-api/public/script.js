document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  async function buscarOdds() {
    try {
      const response = await fetch('http://localhost:3000/api/odds/futebol'); // ajuste a URL conforme seu backend
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

          // Coluna: Nome do jogo
          const tdJogo = document.createElement('td');
          tdJogo.textContent = nomeJogo;

          // Odds 1X2 (home = casa, draw = empate, away = fora)
          const tdCasa = document.createElement('td');
          tdCasa.textContent = casa.over?.price ? '-' : '-'; // Não temos odds 1X2 da API de totals, mantém "-"

          const tdEmpate = document.createElement('td');
          tdEmpate.textContent = '-'; // Odds empate (não disponível nesta API de totais)

          const tdFora = document.createElement('td');
          tdFora.textContent = '-'; // Odds fora (não disponível)

          // Odds Mais/Menos 2.5 gols
          const tdMais25 = document.createElement('td');
          const tdMenos25 = document.createElement('td');

          if (typeof casa.over?.price === 'number') {
            const valor = casa.over.price.toFixed(2);
            tdMais25.textContent = valor;
            tdMais25.style.backgroundColor = casa.over.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMais25.textContent = '-';
          }

          if (typeof casa.under?.price === 'number') {
            const valor = casa.under.price.toFixed(2);
            tdMenos25.textContent = valor;
            tdMenos25.style.backgroundColor = casa.under.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMenos25.textContent = '-';
          }

          // Colunas extras (preenchidas com "-")
          const colunasExtrasCount = 10; // Ajustado para completar 16 colunas no total
          const colunasExtras = Array.from({ length: colunasExtrasCount }, () => {
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
