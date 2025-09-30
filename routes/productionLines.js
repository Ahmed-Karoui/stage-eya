const express = require('express');
const router = express.Router();
const db = require('../db'); // ← Ajouté : on importe la connexion DB

// --- GET toutes les chaînes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`  
            SELECT id, num, etat, rendement
            FROM chaine
            ORDER BY id ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('❌ Erreur récupération chaines:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des chaines' });
    }
});

// --- PUT pour mettre à jour l’état ou rendement d’une chaîne
router.put('/:id', async (req, res) => {
    const { etat, rendement } = req.body;

    if (!etat && rendement === undefined) {
        return res.status(400).json({ error: 'Aucune donnée fournie pour la mise à jour' });
    }

    try {
        const query = [];
        const params = [];

        if (etat) {
            query.push('etat = ?');
            params.push(etat);
        }
        if (rendement !== undefined) {
            query.push('rendement = ?');
            params.push(rendement);
        }

        params.push(req.params.id);

        await db.query( 
            `UPDATE chaine SET ${query.join(', ')} WHERE id = ?`,
            params
        );

        res.json({ message: 'Chaîne mise à jour avec succès' });
    } catch (err) {
        console.error('❌ Erreur mise à jour chaine:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
});

module.exports = router;