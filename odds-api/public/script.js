document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  // Cria e retorna uma linha (<tr>) da tabela para uma casa de aposta
  function criarLinha(nomeJogo, bk, maiorOver, maiorUnder) {
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

    // Colunas extras vazias (4 colunas)
    for (let i = 0; i < 4; i++) {
      tr.appendChild(criarTd('-'));
    }

    return tr;
  }

  // Cria um <td> com texto
  function criarTd(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
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

      tabela.innerHTML = ''; // limpa a tabela antes de preencher

      dados.forEach(jogo => {
        const nomeJogo = `${jogo.timeCasa} x ${jogo.timeFora}`;

        let maiorOver = 0;
        let maiorUnder = 0;

        // Encontra os maiores odds over e under nas casas permitidas
        jogo.odds.forEach(bk => {
          if (!casasPermitidas.includes(bk.casa)) return;
          if (bk.over && bk.over > maiorOver) maiorOver = bk.over;
          if (bk.under && bk.under > maiorUnder) maiorUnder = bk.under;
        });

        // Para cada casa de aposta permitida, cria a linha e adiciona na tabela
        jogo.odds.forEach(bk => {
          if (!casasPermitidas.includes(bk.casa)) return;
          const linha = criarLinha(nomeJogo, bk, maiorOver, maiorUnder);
          tabela.appendChild(linha);
        });
      });
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="10">Erro ao carregar os dados</td></tr>`;
    }
  }

  btnAtualizar.addEventListener('click', buscarOdds);
  buscarOdds(); // busca inicial
});
