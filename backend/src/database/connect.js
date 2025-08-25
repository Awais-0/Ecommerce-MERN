import mysql from 'mysql';

export const connection =mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce',
});

export const connectDB = async () => {
    return new Promise((resolve, reject) => {
        connection.connect(err => {
            if(err) {
                console.error("❌ Database connection failed, ", err);
                reject(err);
            }
            console.log("✅ Database connected successfully");
            resolve(connection);
        });
     })
}