const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Substitua pela sua chave de API
const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';

app.use(cors());

app.get('/', (req, res) => {
  res.send('API de odds está funcionando!');
});

app.get('/api/odds/futebol', async (req, res) => {
  try {
    // Lista de ligas para buscar odds
    const ligas = [
      'soccer_epl', // Premier League
      'soccer_uefa_champs_league', // Liga dos Campeões
      'soccer_brazil_campeonato', // Campeonato Brasileiro
      'soccer_spain_la_liga', // La Liga
      'soccer_italy_serie_a', // Série A Italiana
      'soccer_germany_bundesliga', // Bundesliga
      'soccer_france_ligue_one' // Ligue 1
    ];

    let jogos = [];

    // Itera sobre cada liga para buscar os dados
    for (const liga of ligas) {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${liga}/odds`, {
        params: {
          apiKey: API_KEY,
          regions: 'eu,br',
          markets: 'h2h,over_under',
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

      jogos = jogos.concat(jogosNormalizados);
    }

    res.json(jogos);
  } catch (error) {
    console.error('Erro ao buscar odds:', error.message);
    res.status(500).json({ error: 'Erro ao buscar odds da API externa' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
