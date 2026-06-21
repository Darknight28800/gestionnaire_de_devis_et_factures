router.post("/tickets", authMiddleware, async (req, res) => {
    const { sujet, message } = req.body;
    await db.query(
        "INSERT INTO tickets_support (utilisateur_id, sujet, message) VALUES (?, ?, ?)",
        [req.utilisateur.id, sujet, message]
    );
    res.json({ message: "Ticket créé" });
});

    router.get("/tickets", adminMiddleware, async (req, res) => {
    const rows = await db.query("SELECT * FROM tickets_support");
    res.json(rows);
});
