const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function hasUuid(req, res, next) {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).send();
  }

  return next();
}

app.use('/repositories/:id', hasUuid);

app.get("/repositories", (req, res) => {
  return res.json(repositories);
});

app.post("/repositories", (req, res) => {
  const { body } = req;

  const repository = { ...body, id: uuid(), likes: 0 };

  repositories.push(repository);

  return res.status(201).json(repository);
});

app.put("/repositories/:id", (req, res) => {
  const { id } = req.params;
  delete req.body.likes;

  let newRepository = null;

  for (let index = 0; index < repositories.length; index++) {
    const repository = repositories[index];

    if (repository.id === id) {
      newRepository = { ...repository, ...req.body };
      repositories[index] = newRepository;
    }
  }

  if (!newRepository) return res.status(404).json({ message: "Repository not found!" });
  
  return res.status(200).json(newRepository);
});

app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;
  let found = false;

  for (let index = 0; index < repositories.length; index++) {
    const repository = repositories[index];

    if (repository.id === id) {
      repositories.splice(index, 1);
      found = true;
    }
  }

  if (!found) return res.status(404).json({ message: "Repository not found!" });

  return res.status(204).send();
});

app.post("/repositories/:id/like", hasUuid, (req, res) => {
  const { id } = req.params;
  let repository = null;
  let found = false;

  for (let index = 0; index < repositories.length; index++) {
    repository = repositories[index];

    if (repository.id === id) {
      repositories[index].likes += 1;
      found = true;
    }
  }

  if (!found) return res.status(404).json({ message: "Repository not found!" });

  return res.json({ likes: repository.likes });
});

module.exports = app;
