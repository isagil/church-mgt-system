import express from 'express';
import { supabase } from '../lib/supabase.js';
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
router.get('/', async (req, res) => {
  try {
    const { type, status, startDate, endDate, search } = req.query;
    let query = supabase.from('finance_transactions').select('*');

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('date', startDate as string);
    if (endDate) query = query.lte('date', endDate as string);
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get finance summary stats
router.get('/summary', async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('finance_transactions')
      .select('amount, type, status')
      .eq('status', 'Completed');

    if (error) throw error;

    const totalIncome = (transactions || [])
      .filter(t => ['Tithe', 'Offering', 'Partnership', 'Other Income'].includes(t.type))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const totalExpenses = (transactions || [])
      .filter(t => t.type === 'Expenditure')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('finance_transactions').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Transaction not found' });
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new transaction
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    const { data: newTransaction, error } = await supabase.from('finance_transactions').insert({
      amount,
      type,
      category: category || '',
      description: description || '',
      status,
      date: new Date().toISOString().split('T')[0]
    }).select().single();
    
    if (error) throw error;
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('finance_transactions').update({
      amount,
      type,
      category: category || '',
      description: description || '',
      status
    }).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Transaction not found' });
      throw error;
    }
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
