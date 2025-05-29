
import { Client } from 'pg';


const client = new Client({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to NeonDB PostgreSQL!');
        // Prueba mostrando las variables de entorno
        console.log('Host:', process.env.PGHOST);
        console.log('Database:', process.env.PGDATABASE);
        console.log('User:', process.env.PGUSER);
    } catch (err) {
        console.error('Connection error', err.stack);
    }
}

connectDB();


export default client;
