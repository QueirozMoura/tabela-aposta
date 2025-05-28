const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita CORS para todas as origens
app.use(cors());

// Rota simples para teste da API
app.get('/', (req, res) => {
  res.send('API de odds está funcionando!');
});

// Rota para buscar odds reais da API externa
app.get('/api/odds/futebol', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_br/odds', {
      params: {
        apiKey: '5efb88d1faf5b16676df21b8ce71d6fe',
        regions: 'br',           // regiões desejadas
        markets: 'h2h,over_under',
        oddsFormat: 'decimal'
      }
    });

    // Retorna os dados diretamente
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar odds:', error.message);
    res.status(500).json({ error: 'Erro ao buscar odds da API externa' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
