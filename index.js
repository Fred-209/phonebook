require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/phonebook');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', req => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body);
  }
  return '';
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const entryExists = async (name) => {
  const allPersons = await fetchPeople();
  return allPersons.some(
    person => person.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
};

const fetchPeople = async () => {
  return await Person.find({});
};

//root request
app.get('/', (request, response, next) => {
  try {
    response.send('This is the root page!');
  } catch (error) {
    next(error);
  }
});


// fetch all entries
app.get('/api/persons', async (request, response, next) => {
  try {
    const allPeople = await fetchPeople();
    response.json(allPeople);
  } catch (error) {
    next(error);
  }
});


// fetch general info
app.get('/info', async (request, response, next) => {
  try {
    const allPeople = await fetchPeople();
    const count = allPeople.length;
    const date = new Date();
    response.send(
      `
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
      `
    );
  } catch (error) {
    next(error);
  }
});

// fetch a single entry
app.get('/api/persons/:id', async (request, response, next) => {

  try {
    const person = await Person.findById(request.params.id);

    if (person) {
      response.json(person);
    } else {
      response.status(404).send('No person found with that id');
    }
  } catch (error) {
    next(error);
  }
});

// delete an entry
app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    const removedPerson = await Person.findByIdAndRemove(request.params.id);

    if (removedPerson) {
      response.status(204).end();
    } else {
      response.status(404).send('No person found with that id');
    }

  } catch (error) {
    next(error);
  }
});


// add entry
app.post('/api/persons', async (request, response, next) => {
  const name = request.body.name;
  const number = request.body.number;

  if (!name || !number) {
    return response.status(400).json(
      { error: 'Must supply name and number' }
    );
  }

  if (await entryExists(name)) {
    return response.status(400).json(
      { error: 'Entry with this name already exists' }
    );
  }

  try {
    const person = new Person({
      name: name,
      number: number
    });
    console.log('before attempting to save person');
    const savedPerson = await person.save();
    console.log('person saved');
    response.json(savedPerson);

  } catch (error) {
    next(error);
  }
});


// update a phonebook entry
app.put('/api/persons/:id', async (request, response, next) => {
  try {
    let updatedPerson = request.body;
    updatedPerson = await Person.findByIdAndUpdate(
      updatedPerson.id,
      updatedPerson,
      { new: true, runValidators: true, context: 'query' });
    response.json(updatedPerson);
  } catch (error) {
    next(error);
  }

});

// non-existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send( { error: 'unknown endpoint' } );
};

// error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  console.log('oh an error!');
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).send( { error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});