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
  const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';

  const ligas = [
    'soccer_brazil_campeonato',
    'soccer_epl',
    'soccer_spain_la_liga',
    'soccer_italy_serie_a',
    'soccer_uefa_champs_league'
  ];

  try {
    const respostas = await Promise.allSettled(
      ligas.map(liga =>
        axios.get(`https://api.the-odds-api.com/v4/sports/${liga}/odds`, {
          params: {
            apiKey: API_KEY,
            regions: 'br,eu',
            markets: 'h2h,over_under',
            oddsFormat: 'decimal',
          }
        })
      )
    );

    const dados = respostas
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.data);

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
          } else if (market.key === 'over_under') {
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
