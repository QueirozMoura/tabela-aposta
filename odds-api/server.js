import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Chaves das APIs
const ODDS_API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';
const API_FOOTBALL_KEY = 'a4fe12802a4eb8cb750b00a310a6658b';

app.use(cors());

// Função para buscar jogos da API-Football (exemplo: Premier League 2023)
async function buscarJogosAPIfootball() {
  const url = 'https://v3.football.api-sports.io/fixtures?league=39&season=2023';
  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
  });
  if (!response.ok) throw new Error('Erro ao buscar jogos da API-Football');
  const data = await response.json();
  console.log('Jogos API-Football:', data.response.length);
  return data.response;
}

app.get('/', (req, res) => {
  res.send('✅ API Odds está funcionando!');
});

app.get('/api/odds/futebol', async (req, res) => {
  const sports = [
    'soccer_brazil_campeonato',
    'soccer_spain_la_liga',
    'soccer_england_championship',
    'soccer_uefa_champs_league',
  ];

  const regions = 'eu';
  const markets = 'totals'; // mais/menos gols
  const oddsFormat = 'decimal';

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  try {
    // 1) Buscar jogos na API-Football
    const jogosAPIfootball = await buscarJogosAPIfootball();
    console.log('Jogos encontrados na API-Football:', jogosAPIfootball.length);

    // 2) Buscar odds na The Odds API
    let allOdds = [];
    for (const sport of sports) {
      const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`⚠️ Erro ao buscar dados para ${sport}: ${response.statusText}`);
        continue;
      }
      const data = await response.json();
      console.log(`Odds para ${sport}: ${data.length}`);
      allOdds = allOdds.concat(data);
    }

    // 3) Juntar dados de jogos da API-Football com odds da Odds API usando nomes dos times
    const respostaFinal = jogosAPIfootball.map(jogo => {
      const nomeJogo = `${jogo.teams.home.name} x ${jogo.teams.away.name}`;

      const oddsMatch = allOdds.find(oddsJogo => {
        const nomeOdds = `${oddsJogo.home_team} x ${oddsJogo.away_team}`;
        return nomeOdds.toLowerCase() === nomeJogo.toLowerCase();
      });

      let oddsMaisMenos = [];
      if (oddsMatch) {
        oddsMaisMenos = (oddsMatch.bookmakers || []).reduce((acc, book) => {
          if (!casasPermitidas.includes(book.title)) return acc;
          const market = book.markets?.find(m => m.key === 'totals');
          if (!market) return acc;
          const over = market.outcomes.find(o => o.name.toLowerCase().includes('over'));
          const under = market.outcomes.find(o => o.name.toLowerCase().includes('under'));
          acc.push({ casa: book.title, over, under });
          return acc;
        }, []);
      }

      return {
        fixtureId: jogo.fixture.id,
        jogo: nomeJogo,
        odds: oddsMaisMenos,
      };
    });

    console.log('Jogos com odds combinadas:', respostaFinal.filter(j => j.odds.length > 0).length);

    res.json(respostaFinal);
  } catch (error) {
    console.error('❌ Erro ao buscar odds:', error);
    res.status(500).json({ error: 'Erro ao buscar odds' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
