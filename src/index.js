const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "Username not found!" });
  }

  request.user = user;

  return next();
}

app.get("/users", (request, response) => {
  return response.json(users);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameFound = users.some((user) => user.username === username);

  if (usernameFound) {
    return response.status(400).json({ error: "Username already taken." });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.use(checksExistsUserAccount);

app.get("/todos", (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(deadline), // ANO-MÊS_DIA
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: `User with ${id} not found!` });
  }

  foundTodo.title = title;
  foundTodo.deadline = deadline;

  return response.status(200).json(foundTodo);
});

app.patch("/todos/:id/done", (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: `Todo with ${id} not found.` });
  }

  foundTodo.done = true;

  return response.status(200).json(foundTodo);
});

app.delete("/todos/:id", (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response
      .status(404)
      .json({ error: `Todo with id ${id} not found.` });
  }

  user.todos = user.todos.filter((todo, i) => {
    return todo.id !== id;
  });

  return response.status(204).send();
});

module.exports = app;
