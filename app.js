import sql from 'mssql';
import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sql.connect(config).then(pool => {
  console.log("connected");
}).catch(err => {
    console.error('SQL Query Error: ', err);
});

app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname, "/public/"));
})

app.get('/get-names', async (req, res) =>{
  console.log("Hello, world");
  try {
      let pool = await sql.connect(config);
      let result = await pool.request().query('SELECT name FROM [user]');
      res.json(result.recordset);
  } catch (err) {
      console.error('SQL Query Error:', err);
      res.status(500).send("Error fetching names");
  }
});

app.post('/add-name', (req, res) => {
  const { name } = req.body;

  if (!name) {
      return res.status(400).send('Name is required');
  }

  sql.connect(config).then(pool => {
      return pool.request()
          .input('name', sql.NVarChar, name)
          .query("INSERT INTO [user] (name, password) VALUES (@name, 'passord01')");
  }).then(result => {
      res.status(200).send('User added successfully');
  }).catch(err => {
      console.error('SQL Insert Error: ', err);
      res.status(500).send('Internal Server Error');
  });
});

const port = process.env.PORT || 80;
app.use(express.static(staticPath));
app.listen(port, "0.0.0.0", () => {
console.log(`Server running on http://0.0.0.0:${port}`);
});