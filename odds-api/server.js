// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000; // Render usa a variável de ambiente PORT

app.use(cors());
app.use(express.json());

// Endpoint principal de odds de futebol
app.get('/api/odds/futebol', (req, res) => {
  const dados = [
    {
      timeCasa: 'Flamengo',
      timeFora: 'Palmeiras',
      data: '2025-05-28',
      odds: [
        {
          casa: 'Betano',
          h2h: {
            home: 2.1,
            draw: 3.4,
            away: 3.0
          },
          over: 1.9,
          under: 1.8
        }
      ]
    }
  ];

  res.json(dados);
});

// Endpoint extra
app.get('/api/odds-extras/htft', (req, res) => {
  const { timeCasa, timeFora, data } = req.query;

  res.json({
    'Casa/Casa': 3.2,
    'Casa/Empate': 5.1,
    'Casa/Fora': 12.0,
    'Empate/Casa': 7.4
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
