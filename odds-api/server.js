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

        const mercadoH2H = bookmaker.markets.find(m => m.key === 'h2h');
        if (mercadoH2H) {
          mercadoH2H.outcomes.forEach(o => {
            if (o.name === timeCasa) h2h.home = o.price;
            else if (o.name === timeFora) h2h.away = o.price;
            else if (o.name.toLowerCase().includes('draw')) h2h.draw = o.price;
          });
        }

        return {
          casa: bookmaker.title,
          h2h
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
