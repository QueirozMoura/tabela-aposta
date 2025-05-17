document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  // Cores para várias casas de apostas
  const coresCasas = {
    Pinnacle: '#FFC107',      // amarelo
    Bet365: '#4CAF50',        // verde
    WilliamHill: '#2196F3',   // azul
    Betfair: '#9C27B0',       // roxo
    Unibet: '#FF5722',        // laranja
    '10Bet': '#009688',       // azul esverdeado
    Betway: '#3F51B5',        // azul escuro
    Coral: '#E91E63',         // rosa
    Ladbrokes: '#795548',     // marrom
    Bwin: '#607D8B',          // cinza azulado
    Sportingbet: '#8BC34A',   // verde claro
    Marathonbet: '#673AB7',   // roxo escuro
    BetVictor: '#F44336',     // vermelho
    '888sport': '#0099FF'     // azul claro
    // Pode adicionar outras casas aqui...
  };

  async function buscarOdds() {
    try {
      const response = await fetch('https://tabela-aposta.onrender.com/api/odds/premier-league');
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const dados = await response.json();
      tabela.innerHTML = ''; // limpa o tbody

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="5">Nenhum dado disponível</td></tr>`;
        return;
      }

      dados.forEach(jogo => {
        const nomeJogo = `${jogo.home_team} vs ${jogo.away_team}`;

        if (!jogo.bookmakers || jogo.bookmakers.length === 0) return;

        jogo.bookmakers.forEach(casa => {
          const nomeCasa = casa.title || '-';
          const cor = coresCasas[nomeCasa] || '#ffffff'; // branco padrão
          const mercadoH2h = casa.markets.find(m => m.key === 'h2h');
          if (!mercadoH2h) return;

          const outcomes = mercadoH2h.outcomes || [];

          let oddCasa = '-';
          let oddEmpate = '-';
          let oddFora = '-';

          outcomes.forEach(o => {
            if (o.name === jogo.home_team) oddCasa = o.price;
            else if (o.name === jogo.away_team) oddFora = o.price;
            else if (o.name.toLowerCase() === 'draw' || o.name.toLowerCase() === 'empate') oddEmpate = o.price;
          });

          const tr = document.createElement('tr');
          tr.style.backgroundColor = cor;
          tr.innerHTML = `
            <td>${nomeJogo}</td>
            <td>${nomeCasa}</td>
            <td>${oddCasa}</td>
            <td>${oddEmpate}</td>
            <td>${oddFora}</td>
          `;
          tabela.appendChild(tr);
        });

      });
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);

  buscarOdds();
});
