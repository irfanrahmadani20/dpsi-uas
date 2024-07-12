// sepatuController.js
const { db } = require('../config');

// Create a new sepatu item
const createSepatu = async (req, res) => {
  const { name, size, color, price, stock } = req.body;

  if (!name || !size || !color || !price || !stock) {
    return res.status(400).json({ error: 'Name, size, color, price, and stock are required' });
  }

  try {
    const newSepatu = {
      name,
      size,
      color,
      price,
      stock,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('sepatu').add(newSepatu);

    res.status(201).json({ message: 'Sepatu created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all sepatu items
const getAllSepatu = async (req, res) => {
  try {
    const snapshot = await db.collection('sepatu').get();
    const sepatuList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(sepatuList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single sepatu item by ID
const getSepatuById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection('sepatu').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sepatu not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a sepatu item by ID
const updateSepatuById = async (req, res) => {
  const { id } = req.params;
  const { name, size, color, price, stock } = req.body;

  try {
    const docRef = db.collection('sepatu').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sepatu not found' });
    }

    const updatedSepatu = {
      name,
      size,
      color,
      price,
      stock,
      updatedAt: new Date()
    };
    await docRef.update(updatedSepatu);

    res.status(200).json({ message: 'Sepatu updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a sepatu item by ID
const deleteSepatuById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('sepatu').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sepatu not found' });
    }

    await docRef.delete();

    res.status(200).json({ message: 'Sepatu deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSepatu,
  getAllSepatu,
  getSepatuById,
  updateSepatuById,
  deleteSepatuById
};
