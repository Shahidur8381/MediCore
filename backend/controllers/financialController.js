const { executeQuery } = require('../config/db');

// @route   GET /api/financial/summary
// @desc    Get total earnings for admin and overall doctors
// @access  Private (Admin only)
exports.getFinancialSummary = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const summaryQuery = `
            SELECT 
                NVL(SUM(Admin_Amount), 0) as Total_Admin_Earnings,
                NVL(SUM(Doctor_Amount), 0) as Total_Doctor_Earnings,
                NVL(SUM(Total_Amount), 0) as Total_Revenue
            FROM FINANCIAL_LEDGER
        `;

        const result = await executeQuery(summaryQuery);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/financial/ledger
// @desc    Get all financial ledger transactions
// @access  Private (Admin only)
exports.getLedger = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const query = `
            SELECT 
                f.Ledger_ID,
                f.Transaction_Type,
                f.Reference_ID,
                f.Total_Amount,
                f.Doctor_Amount,
                f.Admin_Amount,
                f.Transaction_Date,
                p.Name as Patient_Name,
                d.Name as Doctor_Name
            FROM FINANCIAL_LEDGER f
            LEFT JOIN PATIENT p ON f.Patient_ID = p.Patient_ID
            LEFT JOIN DOCTOR d ON f.Doctor_ID = d.Doctor_ID
            ORDER BY f.Transaction_Date DESC
        `;

        const result = await executeQuery(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
