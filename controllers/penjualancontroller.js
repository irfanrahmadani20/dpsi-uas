// penjualanController.js
const { db } = require('../config');

// Create a new penjualan (sale) record
const createPenjualan = async (req, res) => {
  const { sepatuId, quantity, totalPrice, cashierId } = req.body;

  if (!sepatuId || !quantity || !totalPrice || !cashierId) {
    return res.status(400).json({ error: 'Sepatu ID, quantity, total price, and cashier ID are required' });
  }

  try {
    // Check if sepatu exists
    const sepatuDoc = await db.collection('sepatu').doc(sepatuId).get();
    if (!sepatuDoc.exists) {
      return res.status(404).json({ error: 'Sepatu not found' });
    }

    // Check stock availability
    const sepatuData = sepatuDoc.data();
    if (quantity > sepatuData.stock) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Create new penjualan record
    const newPenjualan = {
      sepatuId,
      quantity,
      totalPrice,
      cashierId,
      createdAt: new Date()
    };

    await db.collection('penjualan').add(newPenjualan);

    // Update stock for the sepatu item
    await db.collection('sepatu').doc(sepatuId).update({
      stock: sepatuData.stock - quantity
    });

    res.status(201).json({ message: 'Penjualan created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all penjualan (sales) records
const getAllPenjualan = async (req, res) => {
  try {
    const snapshot = await db.collection('penjualan').get();
    const penjualanList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(penjualanList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get penjualan (sales) records by date
const getPenjualanByDate = async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const snapshot = await db.collection('penjualan')
      .where('createdAt', '>=', start)
      .where('createdAt', '<', end)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No penjualan found for this date' });
    }

    const penjualanList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(penjualanList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a penjualan (sale) record by ID
const deletePenjualanById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('penjualan').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Penjualan not found' });
    }

    // Get the sepatu ID and quantity from the penjualan record
    const { sepatuId, quantity } = doc.data();
    const sepatuDoc = await db.collection('sepatu').doc(sepatuId).get();
    const sepatuData = sepatuDoc.data();

    // Update stock for the sepatu item
    await db.collection('sepatu').doc(sepatuId).update({
      stock: sepatuData.stock + quantity
    });

    // Delete the penjualan record
    await docRef.delete();

    res.status(200).json({ message: 'Penjualan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total income and outcome from all penjualan (sales) records
const getTotalIncomeOutcome = async (req, res) => {
  try {
    const snapshot = await db.collection('penjualan').get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No penjualan found' });
    }

    let totalIncome = 0;
    let totalOutcome = 0;

    snapshot.docs.forEach(doc => {
      const { totalPrice, quantity } = doc.data();
      totalIncome += totalPrice;
      totalOutcome += quantity * totalPrice;
    });

    res.status(200).json({ totalIncome, totalOutcome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPenjualan,
  getAllPenjualan,
  getPenjualanByDate,
  deletePenjualanById,
  getTotalIncomeOutcome
};
