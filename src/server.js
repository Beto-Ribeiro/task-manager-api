const { app, seedInitialTasks } = require('./app');

const PORT = process.env.PORT || 3000;

seedInitialTasks();

app.listen(PORT, () => {
  console.log(`Taskflow API e interface web disponíveis na porta ${PORT}`);
});
