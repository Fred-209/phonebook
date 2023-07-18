const mongoose = require('mongoose');

if (process.argv.length <3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3] || null;
const number = process.argv[4] || null;

const url = `mongodb+srv://fdurham:${password}@cluster0.7uvkesk.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const displayEntries = async () => {
  const entries = await Person.find({});
  for (const entry of entries) {
    console.log(entry.name, entry.number);
  }
  mongoose.connection.close();
};

const addEntry = async () => {
  const person = new Person({ name, number });
  await person.save();
  console.log(`added ${person.name} number ${person.number} to phonebook`);
  mongoose.connection.close();
};

if (process.argv.length === 3) {
  displayEntries();
} else {
  addEntry();
}


