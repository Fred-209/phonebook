const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

app.use(cors());
app.use(express.json());

morgan.token('body', req => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body);
  }
  return '';
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

const generateId = () => {
  const randomNumber = () => Math.round(Math.random() * 10000);
  let id = randomNumber();

  while (persons.some(person => person.id === id)) {
    id =  randomNumber();
  }
  return id;
}

const entryExists = (name) => {
  console.log(name);
  return persons.some(
    person => person.name.toLowerCase().trim() === name.toLowerCase().trim()
  )
}

//root request
app.get('/', (request, response) => {
  response.send('This is the root page!');
});


// fetch all entries
app.get('/api/persons', (request, response) => {
  response.send(persons);
});


// fetch general info
app.get('/info', (request, response) => {
  const count = persons.length;
  const date = new Date();
  response.send(
    `
      <p>Phonebook has info for ${count} people</p>
      <p>${date}</p>
    `
  );
});

// fetch a single entry
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
   response.json(person);
  } else {
    response.status(404).send('No person found with that id');
  }
});

// delete an entry
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
  } else {
    response.status(404).send('No person found with that id');
  }
})


// add entry
app.post('/api/persons', (request, response) => {
  const name = request.body.name;
  const number = request.body.number;
  console.log(name, number);

  if (!name || !number) {
    return response.status(400).json(
      { error: 'Must supply name and number' }
    );
  }

  if (entryExists(name)) {
    return response.status(400).json( 
      { error: "Entry with this name already exists" }
    );
  }


  const person = {
    id: generateId(),
    name: name,
    number: number
  }
  
  persons = [...persons, person];
  response.json(person);
});


// non-existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send( {error: 'unknown endpoint'} );
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});