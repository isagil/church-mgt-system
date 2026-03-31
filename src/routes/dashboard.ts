import express from 'express';
import { members, transactions, testimonies, baptismRequests } from '../mockData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalMembers = members.length;
    const totalIncome = transactions
      .filter(t => ['Tithe', 'Offering', 'Partnership', 'Income'].includes(t.type) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => (t.type === 'Expenditure' || t.type === 'Expense') && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalTestimonies = testimonies.length;
    const pendingBaptisms = baptismRequests.filter(r => r.status === 'Pending').length;

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
