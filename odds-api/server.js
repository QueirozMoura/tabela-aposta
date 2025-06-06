const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

const API_KEY = 'f81d82eb779e37ce5b0b39ac0b82a95';  // Sua chave API-Football aqui
const PORT = process.env.PORT || 3000;

const allowedBookmakers = ['betano', 'bet365', 'kto', 'marathonbet', 'paddypower'];

// CORS para seu front
app.use(cors({
  origin: 'https://queirozmoura.github.io'
}));

app.use(express.static('public'));

// Endpoint para buscar odds de futebol
app.get('/api/odds/futebol', async (req, res) => {
  try {
    // Exemplo de chamada: pega odds de jogos ao vivo ou próximos
    const url = 'https://v3.football.api-sports.io/odds?league=35&season=2024'; 
    // Obs: Ajuste 'league' e 'season' conforme sua necessidade
    // league=35 é Premier League, por exemplo.

    const response = await axios.get(url, {
      headers: { 'x-apisports-key': API_KEY }
    });

    if (!response.data.response || response.data.response.length === 0) {
      return res.json([]);
    }

    const jogos = response.data.response.map(match => {
      const bookmakers = match.bookmakers || [];

      const filteredBookmakers = bookmakers.filter(bm =>
        allowedBookmakers.includes(bm.name.toLowerCase())
      );

      // Para cada bookmaker, pega odds de 1X2 e Over/Under 2.5
      const odds = filteredBookmakers.map(bm => {
        const bet1X2 = bm.bets.find(b => b.name.toLowerCase().includes('match winner') || b.name.toLowerCase().includes('1x2'));
        const betOU = bm.bets.find(b => b.name.toLowerCase().includes('over/under'));

        let home = null, draw = null, away = null;
        if (bet1X2) {
          for (const val of bet1X2.values) {
            const v = val.value.toLowerCase();
            if (v === 'home' || v === '1' || v === 'casa') home = parseFloat(val.odd);
            else if (v === 'draw' || v === 'empate') draw = parseFloat(val.odd);
            else if (v === 'away' || v === '2' || v === 'fora') away = parseFloat(val.odd);
          }
        }

        let over = null, under = null;
        if (betOU) {
          for (const val of betOU.values) {
            const v = val.value.toLowerCase();
            if (v.includes('over 2.5')) over = parseFloat(val.odd);
            if (v.includes('under 2.5')) under = parseFloat(val.odd);
          }
        }

        return {
          casa: bm.name,
          home,
          draw,
          away,
          over,
          under
        };
      });

      return {
        id: match.fixture.id,
        home_team: match.teams.home.name,
        away_team: match.teams.away.name,
        commence_time: match.fixture.date,
        odds
      };
    });

    res.json(jogos);

  } catch (error) {
    console.error('Erro ao buscar odds da API-Football:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({ error: 'Erro ao buscar odds da API-Football' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
