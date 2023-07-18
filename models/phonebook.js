const mongoose = require('mongoose');

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI;
console.log('connecting to', url);

const connect = async () => {
  try {
    await mongoose.connect(url);
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error.message);
  }
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    match: /^\d{2,3}-\d{5,}$/,
  },
});

// const Person = mongoose.model('Person', personSchema);

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

connect();

module.exports = mongoose.model('Person', personSchema)