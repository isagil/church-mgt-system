import express from 'express';
import { transactions, getNextId } from '../mockData.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['Tithe', 'Offering', 'Expenditure', 'Partnership', 'Other Income']),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['Completed', 'Pending', 'Cancelled']).default('Pending'),
});

// Get all transactions with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, startDate, endDate, search } = req.query;
    let filteredTransactions = [...transactions];

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= (startDate as string));
    }
    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= (endDate as string));
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredTransactions = filteredTransactions.filter(t => 
        t.description.toLowerCase().includes(searchLower) || 
        t.category.toLowerCase().includes(searchLower)
      );
    }

    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get finance summary stats
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const totalIncome = transactions
      .filter(t => ['Tithe', 'Offering', 'Partnership', 'Other Income'].includes(t.type) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'Expenditure' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = transactions.find(t => t.id === parseInt(id as string));
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new transaction
router.post('/', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    const newTransaction = {
      id: getNextId('transactions'),
      amount,
      type,
      category: category || '',
      description: description || '',
      status,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a transaction
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    const index = transactions.findIndex(t => t.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    transactions[index] = {
      ...transactions[index],
      amount,
      type,
      category: category || '',
      description: description || '',
      status
    };
    res.json(transactions[index]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a transaction
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const index = transactions.findIndex(t => t.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    transactions.splice(index, 1);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
