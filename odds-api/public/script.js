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
        tabela.innerHTML = `<tr><td colspan="4">Nenhum dado disponível</td></tr>`;
        return;
      }

      dados.forEach(jogo => {
        const nomeJogo = jogo.jogo;

        jogo.odds.forEach(casa => {
          if (!casasPermitidas.includes(casa.casa)) return;

          const tr = document.createElement('tr');

          const tdJogo = document.createElement('td');
          tdJogo.textContent = nomeJogo;

          const tdCasa = document.createElement('td');
          tdCasa.textContent = casa.casa;

          const tdOver = document.createElement('td');
          const tdUnder = document.createElement('td');

          const oddOver = parseFloat(casa.over?.price || 0);
          const oddUnder = parseFloat(casa.under?.price || 0);

          tdOver.textContent = oddOver || '-';
          tdUnder.textContent = oddUnder || '-';

          if (oddOver >= 2.5) tdOver.style.backgroundColor = 'lightgreen';
          else if (oddOver > 0) tdOver.style.backgroundColor = 'lightcoral';

          if (oddUnder >= 2.5) tdUnder.style.backgroundColor = 'lightgreen';
          else if (oddUnder > 0) tdUnder.style.backgroundColor = 'lightcoral';

          tr.appendChild(tdJogo);
          tr.appendChild(tdCasa);
          tr.appendChild(tdOver);
          tr.appendChild(tdUnder);

          tabela.appendChild(tr);
        });
      });

    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="4">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);
  buscarOdds();
});
