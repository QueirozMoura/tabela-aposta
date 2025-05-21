import express from 'express';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/api/odds/futebol', (req, res) => {
  const dadosMock = [
    {
      jogo: "Time A x Time B",
      odds: [
        { casa: "Betano", over: { price: 2.7 }, under: { price: 1.5 } },
        { casa: "Pinnacle", over: { price: 2.9 }, under: { price: 1.4 } }
      ]
    },
    {
      jogo: "Time C x Time D",
      odds: [
        { casa: "Bet365", over: { price: 2.6 }, under: { price: 1.6 } }
      ]
    }
  ];

  res.json(dadosMock);
});

app.listen(PORT, () => {
  console.log(`Servidor mock rodando em http://localhost:${PORT}`);
});
