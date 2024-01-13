import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment constants from .env file
dotenv.config(); 


async function connect() {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ffxmptz.mongodb.net/?retryWrites=true&w=majority`, {dbName: 'collectiblesDB'});
 //   await mongoose.connect(process.env.MONGODB_URI, {dbName: 'collectiblesDB'});
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with an error code
  }
}

export { connect };

