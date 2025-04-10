import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mimaropa",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://192.168.1.39:5173",
      "http://192.168.56.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(bodyParser.json());

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
        quantity DECIMAL(15,2),
        unitCost DECIMAL(15,2),
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
      )
    `);

    // Create po_data table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS po_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry_id INT,
        po_number VARCHAR(255),
        supplier VARCHAR(255),
        supplierAddress TEXT,
        supplierTIN VARCHAR(255),
        modeOfProcurement VARCHAR(255),
        placeOfDelivery TEXT,
        dateOfDelivery DATE,
        deliveryTerm TEXT,
        paymentTerm TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
      )
    `);

    // Create po_items table (duplicate of items but for PO)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS po_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry_id INT,
        po_data_id INT,
        stockNo VARCHAR(255),
        unit VARCHAR(255),
        itemDescription TEXT,
        quantity DECIMAL(15,2),
        unitCost DECIMAL(15,2),
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
        FOREIGN KEY (po_data_id) REFERENCES po_data(id) ON DELETE CASCADE
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
    console.log(
      "Server will continue running in limited mode without database access"
    );
    // Don't exit process to allow server to run with mock data
  }
};

initializeDatabase();

app.get("/api/po-data", async (req, res, next) => {
  let conn;
  try {
    const entryId = req.query.entry_id;
    conn = await pool.getConnection();

    // Get PO data
    const [poData] = await conn.query(
      `SELECT * FROM po_data WHERE entry_id = ?`,
      [entryId]
    );

    // Return empty PO structure if no data exists
    if (poData.length === 0) {
      return res.status(200).json({
        poData: {
          po_number: "",
          supplier: "",
          supplierAddress: "",
          supplierTIN: "",
          modeOfProcurement: "",
          placeOfDelivery: "",
          dateOfDelivery: "",
          deliveryTerm: "",
          paymentTerm: "",
        },
        poItems: [],
      });
    }

    // Get PO items
    const [poItems] = await conn.query(
      `SELECT * FROM po_items WHERE entry_id = ?`,
      [entryId]
    );

    res.status(200).json({
      poData: poData[0],
      poItems: poItems || [],
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

app.post("/api/po-data", async (req, res, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [poResult] = await conn.query(
      `INSERT INTO po_data 
      (entry_id, po_number, supplier, supplierAddress, supplierTIN, 
       modeOfProcurement, placeOfDelivery, dateOfDelivery, deliveryTerm, paymentTerm)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.entry_id,
        req.body.po_number,
        req.body.supplier,
        req.body.supplierAddress,
        req.body.supplierTIN,
        req.body.modeOfProcurement,
        req.body.placeOfDelivery,
        new Date(req.body.dateOfDelivery),
        req.body.deliveryTerm,
        req.body.paymentTerm,
      ]
    );

    // Insert PO items
    for (const item of req.body.items) {
      await conn.query(
        `INSERT INTO po_items 
        (entry_id, po_data_id, stockNo, unit, itemDescription, quantity, unitCost)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.entry_id,
          poResult.insertId,
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
      message: "PO data created successfully",
      id: poResult.insertId,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

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

// Get PO data count
app.get("/api/po-data/latest-count", async (req, res, next) => {
  console.log("PO count endpoint hit");
  let conn;
  try {
    conn = await pool.getConnection();

    // Get total count of all PO entries
    const [result] = await conn.query(`
      SELECT COUNT(*) as count 
      FROM po_data
    `);

    res.status(200).json({
      count: result[0].count || 0,
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

// Get the latest PR number count
app.get("/api/entries/latest-count", async (req, res, next) => {
  console.log("Latest count endpoint hit");
  let conn;
  try {
    conn = await pool.getConnection();

    const [result] = await conn.query(`
      SELECT COUNT(*) as count 
      FROM entries
    `);

    res.status(200).json({
      count: result[0].count || 0,
    });
  } catch (err) {
    next(err);
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
