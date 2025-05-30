const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('API de odds está funcionando!');
});

app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer/odds', {
      params: {
        apiKey: '5efb88d1faf5b16676df21b8ce71d6fe',
        regions: 'eu,uk,us',
        markets: 'h2h,totals',
        oddsFormat: 'decimal'
      }
    });

    const dados = response.data;

    const jogosNormalizados = dados.map(jogo => {
      const timeCasa = jogo.home_team;
      const timeFora = jogo.away_team;
      const commence_time = jogo.commence_time;

      const odds = jogo.bookmakers.map(bookmaker => {
        let h2h = { home: 0, draw: 0, away: 0 };
        let over = 0;
        let under = 0;

        bookmaker.markets.forEach(market => {
          if (market.key === 'h2h') {
            const outcomes = market.outcomes;
            const homeOutcome = outcomes.find(o => o.name === timeCasa);
            const drawOutcome = outcomes.find(o => o.name.toLowerCase().includes('draw') || o.name.toLowerCase() === 'empate');
            const awayOutcome = outcomes.find(o => o.name === timeFora);

            h2h = {
              home: homeOutcome ? homeOutcome.price : 0,
              draw: drawOutcome ? drawOutcome.price : 0,
              away: awayOutcome ? awayOutcome.price : 0,
            };
          } else if (market.key === 'totals') {
            const overOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('over'));
            const underOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('under'));

            over = overOutcome ? overOutcome.price : 0;
            under = underOutcome ? underOutcome.price : 0;
          }
        });

        return {
          casa: bookmaker.title,
          h2h,
          over,
          under
        };
      });

      return {
        timeCasa,
        timeFora,
        commence_time,
        odds
      };
    });

    res.json(jogosNormalizados);
  } catch (error) {
    console.error('Erro ao buscar odds:', error.message);
    res.status(500).json({ error: 'Erro ao buscar odds da API externa' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
