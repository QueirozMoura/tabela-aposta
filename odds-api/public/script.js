document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  async function buscarOdds() {
    const url = 'https://tabela-aposta.onrender.com/api/odds/futebol';
 // Agora usando seu backend

    try {
      tabela.innerHTML = `<tr><td colspan="10">Carregando dados...</td></tr>`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar odds');

      const dados = await response.json();

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="10">Nenhum dado disponível</td></tr>`;
        return;
      }

      tabela.innerHTML = '';

      dados.forEach(jogo => {
        const nomeJogo = `${jogo.timeCasa} x ${jogo.timeFora}`;

        let maiorOver = 0;
        let maiorUnder = 0;

        jogo.odds.forEach(bk => {
          if (!casasPermitidas.includes(bk.casa)) return;
          if (bk.over && bk.over > maiorOver) maiorOver = bk.over;
          if (bk.under && bk.under > maiorUnder) maiorUnder = bk.under;
        });

        jogo.odds.forEach(bk => {
          if (!casasPermitidas.includes(bk.casa)) return;

          const tr = document.createElement('tr');
          tr.innerHTML += `<td>${nomeJogo}</td>`;
          tr.innerHTML += `<td>${bk.h2h?.home?.toFixed(2) || '-'}</td>`;
          tr.innerHTML += `<td>${bk.h2h?.draw?.toFixed(2) || '-'}</td>`;
          tr.innerHTML += `<td>${bk.h2h?.away?.toFixed(2) || '-'}</td>`;

          const tdOver = document.createElement('td');
          tdOver.textContent = bk.over?.toFixed(2) || '-';
          if (bk.over && bk.over === maiorOver) tdOver.style.backgroundColor = 'lightgreen';
          tr.appendChild(tdOver);

          const tdUnder = document.createElement('td');
          tdUnder.textContent = bk.under?.toFixed(2) || '-';
          if (bk.under && bk.under === maiorUnder) tdUnder.style.backgroundColor = 'lightblue';
          tr.appendChild(tdUnder);

          tr.innerHTML += `<td>-</td><td>-</td><td>-</td><td>-</td>`; // placeholders do HT/FT

          tabela.appendChild(tr);
        });
      });
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="10">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);
  buscarOdds();
});
