const express = require('express');
const router = express.Router();


router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    await req.db.query(
      'UPDATE defects SET resolution_status = ?, resolution_date = NOW() WHERE id = ?',
      ['Résolu', id]
    );
    res.json({ message: 'Defect resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});



// Get all defects
router.get('/', async (req, res) => {
    try {
        const [defects] = await req.db.query(
            'SELECT * FROM defects ORDER BY created_at DESC'
        );
        res.json(defects);
    } catch (error) {
        console.error('Error fetching defects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new defect
router.post('/', async (req, res) => {
    const {
        num_of,
        num_paquet,
        num_chaine,
        matricule_ouvriere,
        operation,
        nombre_defaut_detecte,
        nombre_echantillons,
        gravite,
        num_piece_2eme_paquet,
        detected_by
    } = req.body;

    if (!num_of || !num_paquet || !num_chaine || !matricule_ouvriere || !operation || !gravite || !detected_by) {
        return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    try {
        const [result] = await req.db.query(
            `INSERT INTO defects (
                num_of, num_paquet, num_chaine, matricule_ouvriere, operation,
                nombre_defaut_detecte, nombre_echantillons, gravite, num_piece_2eme_paquet, detected_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                num_of,
                num_paquet,
                num_chaine,
                matricule_ouvriere,
                operation,
                nombre_defaut_detecte || 0,
                nombre_echantillons || 0,
                gravite,
                num_piece_2eme_paquet || null,
                detected_by
            ]
        );

        res.status(201).json({
            message: "Défaut enregistré avec succès",
            defectId: result.insertId
        });
    } catch (err) {
        console.error("Erreur lors de l'insertion :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
