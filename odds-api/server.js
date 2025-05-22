import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';

// Permitir acesso CORS para seu frontend
app.use(cors());

app.get('/api/odds/futebol', async (req, res) => {
  try {
    // Chamada para a API da The Odds API - usando um esporte válido e região válida
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_epl/odds', {
      params: {
        apiKey: API_KEY,
        regions: 'eu',        // Região válida: europa
        markets: 'h2h,totals', // mercados que queremos
        oddsFormat: 'decimal'
      }
    });

    // Mapear resposta para formato que seu frontend espera
    const jogos = response.data.map(jogo => {
      return {
        timeCasa: jogo.home_team,
        timeFora: jogo.away_team,
        data: jogo.commence_time,
        odds: jogo.bookmakers.map(casa => {
          let h2h = null;
          let over = null;
          let under = null;

          casa.markets.forEach(mercado => {
            if (mercado.key === 'h2h') {
              h2h = {};
              mercado.outcomes.forEach(outcome => {
                if (outcome.name === jogo.home_team) h2h.home = outcome.price;
                else if (outcome.name.toLowerCase() === 'draw' || outcome.name.toLowerCase() === 'empate') h2h.draw = outcome.price;
                else if (outcome.name === jogo.away_team) h2h.away = outcome.price;
              });
            } else if (mercado.key === 'totals') {
              mercado.outcomes.forEach(outcome => {
                if (outcome.name.toLowerCase().includes('over')) over = outcome.price;
                else if (outcome.name.toLowerCase().includes('under')) under = outcome.price;
              });
            }
          });

          return {
            casa: casa.title,
            h2h,
            over,
            under
          };
        })
      };
    });

    res.json(jogos);

  } catch (error) {
    console.error('Erro ao buscar dados da The Odds API:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao buscar dados reais da API' });
  }
});

// Rota raiz só para teste simples
app.get('/', (req, res) => {
  res.send('API de Odds rodando 🔥');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
