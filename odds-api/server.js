const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const THE_ODDS_API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';
const API_FOOTBALL_KEY = 'a4fe12802a4eb8cb750b00a310a6658b';

app.use(cors());

app.get('/', (req, res) => {
  res.send('API de Odds rodando 🔥');
});

// ROTA PRINCIPAL - Odds H2H e Totals
app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_epl/odds', {
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: 'eu',
        markets: 'h2h,totals',
        oddsFormat: 'decimal'
      }
    });

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

// ROTA EXTRA - Mercado Half Time / Full Time
app.get('/api/odds-extras/htft', async (req, res) => {
  const { timeCasa, timeFora, data } = req.query;

  if (!timeCasa || !timeFora || !data) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios: timeCasa, timeFora, data' });
  }

  try {
    const options = {
      method: 'GET',
      url: 'https://v3.football.api-sports.io/odds',
      params: {
        league: 39, // Premier League
        season: 2024,
        date: data,
        bet: 'Half Time / Full Time'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_FOOTBALL_KEY
      }
    };

    const response = await axios.request(options);
    const jogos = response.data.response || [];

    const oddsMap = {};

    for (const jogo of jogos) {
      const home = jogo.teams?.home?.name?.toLowerCase();
      const away = jogo.teams?.away?.name?.toLowerCase();

      if (
        home?.includes(timeCasa.toLowerCase()) &&
        away?.includes(timeFora.toLowerCase())
      ) {
        const apostas = jogo.bookmakers?.[0]?.bets?.[0]?.values || [];

        apostas.forEach(opcao => {
          const nome = opcao.value;
          const odd = opcao.odd;

          switch (nome) {
            case 'Home/Home':
              oddsMap['Casa/Casa'] = odd;
              break;
            case 'Home/Draw':
              oddsMap['Casa/Empate'] = odd;
              break;
            case 'Home/Away':
              oddsMap['Casa/Fora'] = odd;
              break;
            case 'Draw/Home':
              oddsMap['Empate/Casa'] = odd;
              break;
          }
        });

        break; // já encontrou o jogo, não precisa continuar
      }
    }

    res.json(oddsMap);
  } catch (error) {
    console.error('Erro ao buscar odds extras da API-Football:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao buscar odds extras da API-Football' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
