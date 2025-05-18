// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ODDS_API_KEY; // pegar a chave da variável de ambiente

app.use(cors());

// Rota raiz só para teste
app.get('/', (req, res) => {
  res.send('API Odds está funcionando!');
});

// Rota que busca as odds da Premier League
app.get('/api/odds/premier-league', async (req, res) => {
  const sportKey = 'soccer_epl';
  const regions = 'eu';
  const markets = 'h2h';

  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao buscar dados da API' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
