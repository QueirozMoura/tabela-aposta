document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela-jogos').getElementsByTagName('tbody')[0];
  const btnAtualizar = document.getElementById('atualizar');

  // Casas de aposta permitidas para mostrar na tabela
  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  // Função para buscar as odds da API e atualizar a tabela
  async function buscarOdds() {
    try {
      // Define a URL da API dependendo do ambiente
      const apiUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:3000/api/odds/futebol'
          : '/api/odds/futebol';

      // Faz a requisição para o backend
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const dados = await response.json();
      tabela.innerHTML = ''; // Limpa a tabela antes de inserir os novos dados

      // Caso não haja dados, mostra mensagem
      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="16">Nenhum dado disponível</td></tr>`;
        return;
      }

      // Para cada jogo recebido, processa as odds
      dados.forEach(jogo => {
        const nomeJogo = jogo.jogo;

        // Se o jogo não tiver odds, insere linha informando
        if (!jogo.odds || jogo.odds.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 16;
          td.textContent = `${nomeJogo} - Sem odds disponíveis`;
          tr.appendChild(td);
          tabela.appendChild(tr);
          return;
        }

        // Para cada casa de aposta no jogo
        jogo.odds.forEach(casa => {
          // Filtra só as casas permitidas
          if (!casasPermitidas.includes(casa.casa)) return;

          const tr = document.createElement('tr');

          // Coluna: Nome do jogo
          const tdJogo = document.createElement('td');
          tdJogo.textContent = nomeJogo;

          // Coluna: Nome da casa de aposta
          const tdCasa = document.createElement('td');
          tdCasa.textContent = casa.casa;

          // Colunas Empate e Fora (não disponíveis para totals, coloca '-')
          const tdEmpate = document.createElement('td');
          tdEmpate.textContent = '-';

          const tdFora = document.createElement('td');
          tdFora.textContent = '-';

          // Colunas Mais/Menos 2.5 gols
          const tdMais25 = document.createElement('td');
          const tdMenos25 = document.createElement('td');

          // Preenche a coluna "Mais 2,5" e pinta conforme valor
          if (casa.over && typeof casa.over.price === 'number') {
            tdMais25.textContent = casa.over.price.toFixed(2);
            tdMais25.style.backgroundColor = casa.over.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMais25.textContent = '-';
          }

          // Preenche a coluna "Menos 2,5" e pinta conforme valor
          if (casa.under && typeof casa.under.price === 'number') {
            tdMenos25.textContent = casa.under.price.toFixed(2);
            tdMenos25.style.backgroundColor = casa.under.price >= 2.5 ? 'lightgreen' : 'lightcoral';
          } else {
            tdMenos25.textContent = '-';
          }

          // Criar 10 colunas extras com '-' para completar as 16 colunas da tabela
          const colunasExtras = Array.from({ length: 10 }, () => {
            const td = document.createElement('td');
            td.textContent = '-';
            return td;
          });

          // Montar a linha da tabela com todas as colunas
          tr.appendChild(tdJogo);
          tr.appendChild(tdCasa);
          tr.appendChild(tdEmpate);
          tr.appendChild(tdFora);
          tr.appendChild(tdMais25);
          tr.appendChild(tdMenos25);
          colunasExtras.forEach(td => tr.appendChild(td));

          // Adiciona a linha na tabela
          tabela.appendChild(tr);
        });
      });
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      tabela.innerHTML = `<tr><td colspan="16">Erro ao carregar os dados</td></tr>`;
    }
  }

  // Evento para botão de atualizar odds
  btnAtualizar.addEventListener('click', buscarOdds);

  // Busca os dados ao carregar a página
  buscarOdds();
});
