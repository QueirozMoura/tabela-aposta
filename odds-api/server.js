const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const THE_ODDS_API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';
const API_FOOTBALL_KEY = '3dc7cad55emshe06e6a03bf1fc4fp1eea8ajsn9b1efadb2d07'; // chave RapidAPI que você mandou

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Odds rodando 🔥');
});

// Rota principal: Odds H2H e Totals da The Odds API
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

// Rota para odds extras (Half Time / Full Time) usando API-Football via RapidAPI
app.get('/api/odds-extras/htft', async (req, res) => {
  const { timeCasa, timeFora, data } = req.query;

  if (!timeCasa || !timeFora || !data) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios: timeCasa, timeFora, data' });
  }

  try {
    // Sua URL e opções de acordo com o código que você enviou
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v2/odds/league/865927/bookmaker/5',
      params: {
        page: '2'  // Pode ajustar conforme necessidade
      },
      headers: {
        'x-rapidapi-key': API_FOOTBALL_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    // Aqui você precisa adaptar para filtrar os jogos pela data e times, 
    // pois a resposta pode trazer vários jogos diferentes

    // Exemplo genérico (você pode ajustar conforme o formato real da resposta):
    const jogos = response.data.api.odds || []; // ajustar dependendo da resposta exata

    let oddsMap = {};

    for (const jogo of jogos) {
      const home = jogo.match.teams.home.name.toLowerCase();
      const away = jogo.match.teams.away.name.toLowerCase();

      if (
        home.includes(timeCasa.toLowerCase()) &&
        away.includes(timeFora.toLowerCase())
      ) {
        // Odds do mercado Half Time / Full Time - adaptar conforme estrutura da API
        const apostas = jogo.bookmakers?.[0]?.bets?.find(b => b.name === 'Half Time / Full Time')?.values || [];

        apostas.forEach(opcao => {
          switch (opcao.value) {
            case 'Home/Home':
              oddsMap['Casa/Casa'] = opcao.odd;
              break;
            case 'Home/Draw':
              oddsMap['Casa/Empate'] = opcao.odd;
              break;
            case 'Home/Away':
              oddsMap['Casa/Fora'] = opcao.odd;
              break;
            case 'Draw/Home':
              oddsMap['Empate/Casa'] = opcao.odd;
              break;
          }
        });
        break;
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
