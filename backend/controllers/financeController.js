const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

// @route   GET /api/finance/doctor-stats
// @desc    Get earnings and withdrawal stats for the logged-in doctor
// @access  Private (Doctor)
exports.getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.user.doctorId;
        
        // Sum of all Doctor_Amount where is_cleared is N, P, or Y
        const result = await executeQuery(
            `SELECT 
                SUM(CASE WHEN Is_Cleared = 'N' THEN Doctor_Amount ELSE 0 END) as Available,
                SUM(CASE WHEN Is_Cleared = 'P' THEN Doctor_Amount ELSE 0 END) as Pending,
                SUM(CASE WHEN Is_Cleared = 'Y' THEN Doctor_Amount ELSE 0 END) as Cleared,
                SUM(Doctor_Amount) as Total_Earned
             FROM FINANCIAL_LEDGER
             WHERE Doctor_ID = :1`,
            [doctorId]
        );

        const stats = result.rows[0];
        res.json({
            available: stats.AVAILABLE || 0,
            pending: stats.PENDING || 0,
            cleared: stats.CLEARED || 0,
            total: stats.TOTAL_EARNED || 0
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error retrieving doctor stats' });
    }
};

// @route   POST /api/finance/withdraw
// @desc    Request withdrawal for all available earnings
// @access  Private (Doctor)
exports.requestWithdrawal = async (req, res) => {
    try {
        const doctorId = req.user.doctorId;
        
        // Check if there are any available funds
        const result = await executeQuery(
            `SELECT SUM(Doctor_Amount) as Available FROM FINANCIAL_LEDGER WHERE Doctor_ID = :1 AND Is_Cleared = 'N'`,
            [doctorId]
        );

        if (!result.rows[0].AVAILABLE || result.rows[0].AVAILABLE === 0) {
            return res.status(400).json({ message: 'No available funds to withdraw' });
        }

        // Update all 'N' records to 'P' (Pending)
        await executeQuery(
            `UPDATE FINANCIAL_LEDGER SET Is_Cleared = 'P' WHERE Doctor_ID = :1 AND Is_Cleared = 'N'`,
            [doctorId],
            { autoCommit: true }
        );

        res.json({ message: 'Withdrawal requested successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error requesting withdrawal' });
    }
};

// @route   GET /api/finance/admin-stats
// @desc    Get high-level hospital revenue stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const result = await executeQuery(
            `SELECT 
                SUM(Total_Amount) as Total_Revenue,
                SUM(Admin_Amount) as Hospital_Earned,
                SUM(CASE WHEN Is_Cleared = 'P' THEN Doctor_Amount ELSE 0 END) as Payment_To_Clear
             FROM FINANCIAL_LEDGER`
        );

        const stats = result.rows[0];
        res.json({
            totalRevenue: stats.TOTAL_REVENUE || 0,
            hospitalEarned: stats.HOSPITAL_EARNED || 0,
            paymentToClear: stats.PAYMENT_TO_CLEAR || 0
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error retrieving admin stats' });
    }
};

// @route   GET /api/finance/pending-withdrawals
// @desc    Get a list of doctors with pending withdrawals
// @access  Private (Admin)
exports.getPendingWithdrawals = async (req, res) => {
    try {
        const result = await executeQuery(
            `SELECT 
                f.Doctor_ID,
                d.Name as Doctor_Name,
                SUM(f.Doctor_Amount) as Pending_Amount,
                MIN(f.Transaction_Date) as Oldest_Transaction
             FROM FINANCIAL_LEDGER f
             JOIN DOCTOR d ON f.Doctor_ID = d.Doctor_ID
             WHERE f.Is_Cleared = 'P'
             GROUP BY f.Doctor_ID, d.Name`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error retrieving pending withdrawals' });
    }
};

// @route   POST /api/finance/clear-withdrawal/:doctorId
// @desc    Clear pending withdrawal for a doctor
// @access  Private (Admin)
exports.clearWithdrawal = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        await executeQuery(
            `UPDATE FINANCIAL_LEDGER SET Is_Cleared = 'Y' WHERE Doctor_ID = :1 AND Is_Cleared = 'P'`,
            [parseInt(doctorId, 10)],
            { autoCommit: true }
        );

        res.json({ message: 'Payment cleared successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error clearing payment' });
    }
};
