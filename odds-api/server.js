import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';
const API_URL = 'https://api.the-odds-api.com/v4/sports/soccer_brazil_campeonato/odds/';

app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        regions: 'br',
        markets: 'h2h,over_under',
        oddsFormat: 'decimal',
        apiKey: API_KEY
      }
    });

    const jogos = response.data.map(jogo => {
      const timeCasa = jogo.home_team;
      const timeFora = jogo.away_team;
      const data = jogo.commence_time.slice(0, 10);

      const odds = jogo.bookmakers.map(book => {
        const h2h = book.markets.find(m => m.key === 'h2h')?.outcomes || [];
        const overUnder = book.markets.find(m => m.key === 'over_under')?.outcomes || [];

        return {
          casa: book.title,
          h2h: {
            home: h2h.find(o => o.name === timeCasa)?.price ?? null,
            draw: h2h.find(o => o.name === 'Draw')?.price ?? null,
            away: h2h.find(o => o.name === timeFora)?.price ?? null
          },
          over: overUnder.find(o => o.name === 'Over 2.5')?.price ?? null,
          under: overUnder.find(o => o.name === 'Under 2.5')?.price ?? null
        };
      });

      return { timeCasa, timeFora, data, odds };
    });

    res.json(jogos);
  } catch (error) {
    console.error('Erro ao buscar odds:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao buscar odds' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
