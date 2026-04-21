import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    // Parallel fetching for performance
    const [membersRes, transactionsRes, testimoniesRes, baptismsRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('finance_transactions').select('amount, type, status').eq('status', 'Completed'),
      supabase.from('testimonies').select('*', { count: 'exact', head: true }),
      supabase.from('baptism_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
    ]);

    const totalMembers = membersRes.count || 0;
    
    const transactions = transactionsRes.data || [];
    const totalIncome = transactions
      .filter(t => ['Tithe', 'Offering', 'Partnership', 'Income', 'Other Income'].includes(t.type))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'Expenditure' || t.type === 'Expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const totalTestimonies = testimoniesRes.count || 0;
    const pendingBaptisms = baptismsRes.count || 0;

    res.json({
      totalMembers,
      totalIncome,
      totalExpenses,
      totalTestimonies,
      pendingBaptisms
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
