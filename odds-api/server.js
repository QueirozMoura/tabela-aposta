// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe'; // sua chave aqui direto

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ API Odds está funcionando!');
});

app.get('/api/odds/futebol', async (req, res) => {
  const sports = [
    'soccer_brazil_campeonato',
    'soccer_spain_la_liga',
    'soccer_england_championship',
    'soccer_uefa_champs_league'
  ];

  const regions = 'eu';
  const markets = 'totals'; // mais/menos gols
  const oddsFormat = 'decimal';

  const casasPermitidas = ['Betano', 'KTO', 'Pinnacle', 'Bet365', 'Superbet'];

  try {
    let allOdds = [];

    for (const sport of sports) {
      const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`⚠️ Erro ao buscar dados para ${sport}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      allOdds = allOdds.concat(data);
    }

    const filtered = allOdds.map(jogo => {
      const oddsMaisMenos = (jogo.bookmakers || []).reduce((acc, book) => {
        if (!casasPermitidas.includes(book.title)) return acc;

        const market = book.markets?.find(m => m.key === 'totals');
        if (!market) return acc;

        const over = market.outcomes.find(o => o.name.toLowerCase().includes('over'));
        const under = market.outcomes.find(o => o.name.toLowerCase().includes('under'));

        acc.push({
          casa: book.title,
          over,
          under
        });

        return acc;
      }, []);

      return {
        jogo: `${jogo.home_team} x ${jogo.away_team}`,
        odds: oddsMaisMenos
      };
    }).filter(j => j.odds.length > 0);

    console.log(`✅ Foram encontrados ${filtered.length} jogos com odds.`);

    res.json(filtered);
  } catch (error) {
    console.error('❌ Erro ao buscar odds:', error);
    res.status(500).json({ error: 'Erro ao buscar odds' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
