const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/control-orders → Récupère les ordres + lignes pour le CE
router.get('/', async (req, res) => {
    try {
        console.log("➡️ 1. [GET /orders] Début de la requête");

        const [orders] = await db.query(`
            SELECT 
                o.id AS order_id, 
                o.responsable_id, 
                o.created_at,
                ol.id AS line_id,
                ol.chain_number, 
                ol.ce, 
                ol.priority, 
                ol.defect, 
                ol.status,
                ol.date_resolution
            FROM orders o
            LEFT JOIN order_lines ol ON o.id = ol.order_id
            ORDER BY o.created_at DESC, ol.chain_number ASC
        `);

        console.log(`➡️ 2. [GET /orders] Résultat SQL : ${orders.length} lignes reçues`);

        // Vérifie si orders est bien un tableau
        if (!Array.isArray(orders)) {
            throw new Error("Résultat SQL invalide : pas un tableau");
        }

        const formattedOrders = orders.reduce((acc, curr) => {
            console.log("➡️ 3. [GET /orders] Traitement ligne SQL :", curr);

            // Protection contre les lignes NULL (cas du LEFT JOIN sans correspondance)
            if (!curr || !curr.order_id) {
                return acc;
            }

            if (!acc[curr.order_id]) {
                acc[curr.order_id] = {
                    id: curr.order_id,
                    responsableId: curr.responsable_id,
                    lignes: []
                };
            }

            // Ajouter la ligne seulement si chain_number est défini (évite les lignes vides du LEFT JOIN)
            if (curr.chain_number) {
                acc[curr.order_id].lignes.push({
                    ce: curr.ce || null,
                    priorite: curr.priority || null,
                    defaut: curr.defect || null,
                    statut: curr.status || 'non commencé',
                    date_resolution: curr.date_resolution || null
                });
            }

            return acc;
        }, {});

        console.log("➡️ 4. [GET /orders] Données formatées :", formattedOrders);

        res.json(Object.values(formattedOrders));

    } catch (error) {
        console.error("❌ 5. [GET /orders] ERREUR FATALE :", error.message);
        console.error(error.stack); // ← Très important pour voir la ligne exacte
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ⚠️ ROUTE CRUCIALE : PUT /:orderId/line/:lineIndex/status → pour markAsCompleted
router.put('/:orderId/line/:lineIndex/status', async (req, res) => {
    try {
        const { orderId, lineIndex } = req.params;
        const { status } = req.body;

        // ✅ Convertir lineIndex en entier
        const lineIndexInt = parseInt(lineIndex, 10);
        if (isNaN(lineIndexInt)) {
            return res.status(400).json({ error: 'lineIndex doit être un nombre' });
        }

        const validStatuses = ['non commencé', 'en cour', 'bloqué', 'terminé'];
const cleanStatus = status.trim(); // ← Remove whitespace

if (!validStatuses.includes(cleanStatus)) {
    console.log("❌ Statut reçu :", JSON.stringify(status)); // ← Debug log
    return res.status(400).json({ error: 'Statut invalide', received: status });
}
        const [rows] = await db.query(
            `SELECT id FROM order_lines 
             WHERE order_id = ? 
             ORDER BY id ASC 
             LIMIT 1 OFFSET ?`,
            [orderId, lineIndexInt]  // ← Nombre entier, pas chaîne
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Ligne non trouvée' });
        }

        const lineId = rows[0].id;

        const [result] = await db.query(
            `UPDATE order_lines 
             SET status = ?, date_resolution = NOW() 
             WHERE id = ?`,
            [status, lineId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mise à jour échouée' });
        }

        res.json({ success: true, message: 'Statut mis à jour avec succès' });

    } catch (error) {
        console.error("❌ Erreur dans PUT /status :", error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// POST / → Créer un nouvel ordre (inchangé, mais ajout de date_resolution par défaut si besoin)
router.post('/', async (req, res) => {
    const { responsableId, lignes } = req.body;

    try {
        await db.query('START TRANSACTION');

        // Insert order
        const [orderResult] = await db.query(
            'INSERT INTO orders (responsable_id) VALUES (?)',
            [responsableId]
        );

        // Insert order lines
for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];

    // ✅ Vérifie que defaut ET ce sont non null, non undefined, et non vides
    if (
        ligne.defaut != null && 
        ligne.defaut.trim() !== '' && 
        ligne.ce != null && 
        ligne.ce.trim() !== ''
    ) {
        await db.query(
            `INSERT INTO order_lines 
            (order_id, chain_number, ce, priority, defect, status, date_resolution)
            VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [
                orderResult.insertId,
                i + 1,
                ligne.ce.trim(),           // ✅ Nettoyage optionnel
                ligne.priorite || 'Normale',
                ligne.defaut.trim(),       // ✅ Nettoyage optionnel
                ligne.statut || 'non commencé'
            ]
        );
    } else {
        console.log(`[INFO] Ligne ignorée pour chaîne ${i + 1} — défaut ou contrôleuse manquant`);
    }
}

        await db.query('COMMIT');
        res.status(201).json({ message: 'Control order created successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ Error creating control order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;