import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_bra/odds', {
      params: {
        apiKey: process.env.API_KEY,
        regions: 'br',       // focar Brasil
        markets: 'h2h,totals', // mercados 1x2 e over/under
        oddsFormat: 'decimal'
      }
    });

    const jogos = response.data.map(jogo => {
      return {
        timeCasa: jogo.home_team,
        timeFora: jogo.away_team,
        data: jogo.commence_time,
        odds: jogo.bookmakers.map(casa => {
          // Inicializa odds para mercados que vamos mapear
          let h2h = null;
          let over = null;
          let under = null;

          casa.markets.forEach(mercado => {
            if (mercado.key === 'h2h') {
              // h2h tem 3 outcomes: home, draw, away
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

app.get('/', (req, res) => {
  res.send('API de Odds rodando 🔥');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
