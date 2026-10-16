const { app, seedInitialTasks } = require('./app');

const PORT = process.env.PORT || 3000;

seedInitialTasks();

app.listen(PORT, () => {
  console.log(`Task Manager API & Interface Web rodando em http://localhost:${PORT}`);
});
