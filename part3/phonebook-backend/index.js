//1. Environment & Imports
require("dotenv").config();
const express = require("express");
const Person = require("./models/person");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

//2. Middleware
app.use(express.static("dist")); //Serves frontend files
app.use(express.json()); //Parse JSON body
// Create a custom Morgan token(placeholder) that can be inserted into log format
morgan.token("body", (req) => JSON.stringify(req.body));
// use morgan with 'tiny' format + request body
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

//3. Routes
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `<h1>Phonebook has info for ${persons.length} people.</h1> 
    <h1>${new Date()}</h1>`
    );
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name) {
    return response.status(400).json({
      error: "Name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "Number missing",
    });
  }
  // else if (persons.find((person) => person.name === body.name)) {
  //   return response.status(409).json({
  //     error: 'Name must be unique',
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        response.status(204).end();
      } else {
        response.status(404).json({ error: "Person not found." });
      }
    })
    .catch((error) => next(error));
});

//4. Unknown Endpoing Handler
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
// handler of requests with unknown endpoint
app.use(unknownEndpoint);

//5. Error Handler Middleware(Always Last)
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

//6. Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
