import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

// Database configuration with connection pooling
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mimaropa",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Function to create tables
const createTables = async () => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Create entries table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        prNumber VARCHAR(255),
        officeSection VARCHAR(255),
        date DATE,
        fundCluster VARCHAR(255),
        responsibilityCode VARCHAR(255),
        purpose TEXT,
        requestedBy VARCHAR(255),
        approvedBy VARCHAR(255),
        requestedByPosition VARCHAR(255),
        approvedByPosition VARCHAR(255),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create items table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry_id INT,
        stockNo VARCHAR(255),
        unit VARCHAR(255),
        itemDescription TEXT,
        quantity DECIMAL(10,2),
        unitCost DECIMAL(10,2),
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
      )
    `);

    console.log("Tables created or already exist.");
  } catch (err) {
    console.error("Error creating tables:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to MySQL database with connection pool");
    conn.release();
    await createTables();
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1);
  }
};

initializeDatabase();

// POST endpoint to save data
app.post("/api/entries", async (req, res, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Insert main entry
    const [entryResult] = await conn.query(
      `INSERT INTO entries 
      (filename, prNumber, officeSection, date, fundCluster, responsibilityCode, 
       purpose, requestedBy, approvedBy, requestedByPosition, approvedByPosition, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.filename,
        req.body.prNumber,
        req.body.officeSection,
        req.body.date,
        req.body.fundCluster,
        req.body.responsibilityCode,
        req.body.purpose,
        req.body.requestedBy,
        req.body.approvedBy,
        req.body.requestedByPosition,
        req.body.approvedByPosition,
        req.body.note,
      ]
    );

    // Insert items
    for (const item of req.body.items) {
      await conn.query(
        `INSERT INTO items 
        (entry_id, stockNo, unit, itemDescription, quantity, unitCost)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entryResult.insertId,
          item.stockNo,
          item.unit,
          item.itemDescription,
          item.quantity,
          item.unitCost,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({
      message: "Entry created successfully",
      id: entryResult.insertId,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err); // Pass errors to error handling middleware
  } finally {
    if (conn) conn.release();
  }
});

app.get("/api/entries", async (req, res, next) => {
  let conn;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    conn = await pool.getConnection();

    // Get total count for pagination
    const [countRows] = await conn.query(
      "SELECT COUNT(*) as total FROM entries"
    );
    const total = countRows[0].total;

    // Get paginated entries
    const [entries] = await conn.query(
      `
          SELECT id, filename, prNumber, officeSection, date, 
                 fundCluster, responsibilityCode, purpose, 
                 requestedBy, approvedBy, requestedByPosition, 
                 approvedByPosition, note, created_at
          FROM entries
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `,
      [limit, offset]
    );

    // Get items for each entry
    const entriesWithItems = await Promise.all(
      entries.map(async (entry) => {
        const [items] = await conn.query(
          `
              SELECT id, stockNo, unit, itemDescription, quantity, unitCost
              FROM items
              WHERE entry_id = ?
            `,
          [entry.id]
        );
        return {
          ...entry,
          items: items || [],
        };
      })
    );

    res.status(200).json({
      data: entriesWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) conn.release();
  }
});
// DELETE endpoint to remove an entry and its related items
app.delete("/api/entries/:id", async (req, res, next) => {
  let conn;
  try {
    const entryId = req.params.id;

    conn = await pool.getConnection();
    await conn.beginTransaction();
    
    // Delete the entry (items will be deleted automatically due to ON DELETE CASCADE)
    const [result] = await conn.query("DELETE FROM entries WHERE id = ?", [
      entryId,
    ]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

// Test endpoint
app.get("/test", (req, res) => {
  res.send("Server is running and connected to the database!", req.statusCode);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
