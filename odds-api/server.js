const express = require('express');
const cors = require('cors');  // importe o cors
const axios = require('axios');
const app = express();

app.use(cors());

const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';

const PORT = process.env.PORT || 3000;

const allowedBookmakers = ['bet365', 'betano', 'kto', 'marathonbet', 'paddypower'];

app.use(express.static('public')); // Se tiver arquivos estáticos (html, css, js)

app.get('/api/odds/futebol', async (req, res) => {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds?apiKey=${API_KEY}&regions=eu,uk,us&markets=h2h,totals&oddsFormat=decimal`;

    console.log(new Date().toISOString());
    console.log(url);

    const response = await axios.get(url);

    if (!response.data || response.data.length === 0) {
      return res.json([]);
    }

    // Normaliza dados
    const jogos = response.data.map(match => {
      // Filtra casas que queremos
      const filteredBookmakers = match.bookmakers.filter(bm =>
        allowedBookmakers.includes(bm.key)
      );

      // Monta array de odds simplificadas para cada casa
      const odds = filteredBookmakers.map(bm => {
        // Procura mercado h2h
        const h2hMarket = bm.markets.find(m => m.key === 'h2h');
        // Procura mercado totals (over/under 2.5 gols)
        const totalsMarket = bm.markets.find(m => m.key === 'totals');

        // Extrai odds h2h (casa, empate, fora)
        const h2hOdds = {
          home: h2hMarket ? h2hMarket.outcomes.find(o => o.name === match.home_team)?.price || null : null,
          draw: h2hMarket ? h2hMarket.outcomes.find(o => o.name === 'Draw')?.price || null : null,
          away: h2hMarket ? h2hMarket.outcomes.find(o => o.name === match.away_team)?.price || null : null,
        };

        // Extrai odds totals 2.5 gols (over e under)
        // Aqui assumimos que o mercado totals tem outcomes "Over 2.5" e "Under 2.5"
        let over = null, under = null;
        if (totalsMarket) {
          for (const outcome of totalsMarket.outcomes) {
            if (outcome.name.toLowerCase().includes('over 2.5')) {
              over = outcome.price;
            } else if (outcome.name.toLowerCase().includes('under 2.5')) {
              under = outcome.price;
            }
          }
        }

        return {
          casa: bm.title,
          key: bm.key,
          h2h: h2hOdds,
          over: over,
          under: under
        };
      });

      return {
        id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        commence_time: match.commence_time,
        odds: odds
      };
    });

    res.json(jogos);
  } catch (error) {
    console.error('Erro ao buscar odds da API externa:', error.message || error);
    res.status(500).json({ error: 'Erro ao buscar odds da API externa' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
