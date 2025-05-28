const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: ['https://queirozmoura.github.io', 'http://localhost:3000']
}));

const API_KEY = '5efb88d1faf5b16676df21b8ce71d6fe';
const API_BASE_URL = 'https://api.the-odds-api.com/v4/sports/soccer_brazil/odds/'; // ajuste a URL base da API real

// Endpoint para buscar odds reais da API externa
app.get('/api/odds/futebol', async (req, res) => {
  try {
    // Monta a URL da API real, adaptando parâmetros se necessário
    const url = `${API_BASE_URL}?apiKey=${API_KEY}&regions=br&markets=h2h,over_under&oddsFormat=decimal`;

    // Faz a requisição para a API externa
    const response = await axios.get(url);

    // Retorna os dados para o front
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar dados da API real:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados da API real' });
  }
});

// Endpoint de odds extras (você pode adaptar para sua outra API)
app.get('/api/odds-extras/htft', async (req, res) => {
  // Exemplo, você pode implementar algo similar buscando de outra API ou base de dados
  const { timeCasa, timeFora, data } = req.query;

  try {
    // Exemplo: retorno fixo - substitua pela lógica correta da sua API real
    res.json({
      "Casa/Casa": 2.2,
      "Casa/Empate": 3.3,
      "Casa/Fora": 3.0,
      "Empate/Casa": 3.1
    });
  } catch (error) {
    console.error('Erro no endpoint odds-extras:', error.message);
    res.status(500).json({ error: 'Erro ao buscar odds extras' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
