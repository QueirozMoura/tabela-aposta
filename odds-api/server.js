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
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_brazil_campeonato/odds', {
      params: {
        apiKey: process.env.API_KEY,
        regions: 'eu',         // Região: 'eu' costuma ter mais odds
        markets: 'over_under', // Mercado: over/under
        oddsFormat: 'decimal'
      }
    });

    const jogos = response.data.map(jogo => {
      const partida = {
        jogo: `${jogo.home_team} x ${jogo.away_team}`,
        odds: []
      };

      jogo.bookmakers.forEach(casa => {
        const mercado = casa.markets.find(m => m.key === 'over_under');
        if (mercado) {
          const over = mercado.outcomes.find(o => o.name.toLowerCase().includes('over'));
          const under = mercado.outcomes.find(o => o.name.toLowerCase().includes('under'));

          partida.odds.push({
            casa: casa.title,
            over: over ? { price: over.price } : null,
            under: under ? { price: under.price } : null
          });
        }
      });

      return partida;
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
