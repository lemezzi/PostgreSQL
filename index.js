const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Route de test
app.get('/', (req, res) => {
  res.send('API Node.js avec PostgreSQL');
  
});

// Create
app.post('/utilisateurs', async (req, res) => {
  const { nom, email, age } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO utilisateurs (nom, email, age) VALUES ($1, $2, $3) RETURNING *',
      [nom, email, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Create commande

app.post('/commande', async (req, res) => {
    const { utilisateur_id, montant, date_commande } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO commandes (utilisateur_id, montant, date_commande) VALUES ($1, $2, $3) RETURNING *',
            [utilisateur_id, montant, date_commande]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Lire tous les utilisateurs (Read)
app.get('/utilisateurs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM utilisateurs');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire un utilisateur par ID (Read)
app.get('/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/somme', async (req, res) => {
    try {
        const resulta = await pool.query(
            'SELECT u.nom, u.email, SUM(c.montant) AS total_depense FROM utilisateurs u JOIN commandes c ON u.id = c.utilisateur_id GROUP BY u.id ORDER BY total_depense DESC;'
        );
        res.json(resulta.rows); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/emails',async(req,res)=>{
    const resultat=await pool.query('SELECT email FROM utilisateurs');
    res.status(200).json(resultat.rows);

});

// Mettre à jour un utilisateur (Update)
app.put('/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, email, age } = req.body;
  try {
    const result = await pool.query(
      'UPDATE utilisateurs SET nom = $1, email = $2, age = $3 WHERE id = $4 RETURNING *',
      [nom, email, age, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur (Delete)
app.delete('/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM utilisateurs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${PORT}`);
});
