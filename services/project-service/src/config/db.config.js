import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log(process.env.DB_URL);
        await mongoose.connect(process.env.DB_URL, {});
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('MongoDB connection failed:', error);
        process.exit(1);
    }
};

export { connectDB };
