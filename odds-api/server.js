const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita CORS para todas as origens
app.use(cors());

app.get('/', (req, res) => {
  res.send('API de odds está funcionando!');
});

app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_br/odds', {
      params: {
        apiKey: '5efb88d1faf5b16676df21b8ce71d6fe',
        regions: 'br',
        markets: 'h2h,over_under',
        oddsFormat: 'decimal'
      }
    });

    const dados = response.data;

    // Normaliza os dados para frontend
    const jogosNormalizados = dados.map(jogo => {
      const timeCasa = jogo.home_team;
      const timeFora = jogo.away_team;
      const data = jogo.commence_time;

      // odds por casa de aposta
      const odds = jogo.bookmakers.map(bookmaker => {
        // Extrai mercados h2h e over_under, se existirem
        let h2h = null;
        let over = null;
        let under = null;

        bookmaker.markets.forEach(market => {
          if (market.key === 'h2h') {
            const outcomes = market.outcomes;
            const homeOutcome = outcomes.find(o => o.name === timeCasa);
            const drawOutcome = outcomes.find(o => o.name.toLowerCase().includes('draw') || o.name.toLowerCase() === 'empate');
            const awayOutcome = outcomes.find(o => o.name === timeFora);

            h2h = {
              home: homeOutcome ? homeOutcome.price : null,
              draw: drawOutcome ? drawOutcome.price : null,
              away: awayOutcome ? awayOutcome.price : null,
            };
          } else if (market.key === 'over_under') {
            // geralmente tem dois outcomes: over 2.5 e under 2.5
            const overOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('over'));
            const underOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('under'));

            over = overOutcome ? overOutcome.price : null;
            under = underOutcome ? underOutcome.price : null;
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
        data,
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
