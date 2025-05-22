document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];
  const apiKey = '5efb88d1faf5b16676df21b8ce71d6fe';

  async function buscarOdds() {
    const url = `https://api.the-odds-api.com/v4/sports/soccer_bra/odds/?regions=br&markets=h2h,totals&apiKey=${apiKey}`;
    try {
      tabela.innerHTML = `<tr><td colspan="16">Carregando dados...</td></tr>`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar odds');

      const dados = await response.json();

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="16">Nenhum dado disponível</td></tr>`;
        return;
      }

      tabela.innerHTML = '';

      // Vamos iterar nos jogos
      dados.forEach(jogo => {
        const nomeJogo = `${jogo.home_team} x ${jogo.away_team}`;
        const data = new Date(jogo.commence_time).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        // Encontrar casa com maior Over e Under para destaque
        let maiorOver = 0;
        let maiorUnder = 0;

        // Primeiro achamos as maiores odds Over e Under entre casas permitidas
        jogo.bookmakers.forEach(bk => {
          if (!casasPermitidas.includes(bk.title)) return;
          const totals = bk.markets.find(m => m.key === 'totals');
          if (totals) {
            totals.outcomes.forEach(o => {
              if (o.name.toLowerCase().includes('over') && o.price > maiorOver) maiorOver = o.price;
              if (o.name.toLowerCase().includes('under') && o.price > maiorUnder) maiorUnder = o.price;
            });
          }
        });

        // Agora para cada casa permitida, monta uma linha na tabela
        jogo.bookmakers.forEach(bk => {
          if (!casasPermitidas.includes(bk.title)) return;

          const h2h = bk.markets.find(m => m.key === 'h2h');
          const totals = bk.markets.find(m => m.key === 'totals');

          // Valores default (caso não tenham odds)
          let oddCasa = '-';
          let oddEmpate = '-';
          let oddFora = '-';
          let oddOver = '-';
          let oddUnder = '-';

          if (h2h && h2h.outcomes) {
            h2h.outcomes.forEach(outcome => {
              if (outcome.name === jogo.home_team) oddCasa = outcome.price.toFixed(2);
              else if (outcome.name.toLowerCase() === 'draw' || outcome.name.toLowerCase() === 'empate') oddEmpate = outcome.price.toFixed(2);
              else if (outcome.name === jogo.away_team) oddFora = outcome.price.toFixed(2);
            });
          }

          if (totals && totals.outcomes) {
            totals.outcomes.forEach(outcome => {
              if (outcome.name.toLowerCase().includes('over')) oddOver = outcome.price.toFixed(2);
              if (outcome.name.toLowerCase().includes('under')) oddUnder = outcome.price.toFixed(2);
            });
          }

          const tr = document.createElement('tr');

          // Colunas conforme seu HTML:
          // 1 - Jogo Atuais
          tr.innerHTML += `<td>${nomeJogo}</td>`;

          // 2 - Casa (Liga/Campeonato não vem pela API, pode ficar '-')
          tr.innerHTML += `<td>-</td>`;

          // 3 - Empate
          tr.innerHTML += `<td>${oddEmpate}</td>`;

          // 4 - Fora
          tr.innerHTML += `<td>${oddFora}</td>`;

          // 5 - Mais 2,5 (Over)
          const tdOver = document.createElement('td');
          tdOver.textContent = oddOver;
          if (parseFloat(oddOver) === maiorOver) tdOver.style.backgroundColor = 'lightgreen';
          tr.appendChild(tdOver);

          // 6 - Menos 2,5 (Under)
          const tdUnder = document.createElement('td');
          tdUnder.textContent = oddUnder;
          if (parseFloat(oddUnder) === maiorUnder) tdUnder.style.backgroundColor = 'lightblue';
          tr.appendChild(tdUnder);

          // Colunas 7 a 16 são apostas de tempo e combinadas que a API não oferece direto, então preenchemos com '-'
          for (let i = 7; i <= 16; i++) {
            const td = document.createElement('td');
            td.textContent = '-';
            tr.appendChild(td);
          }

          // Append linha
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
