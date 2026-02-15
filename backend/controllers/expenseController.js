
const User = require("../models/User");
const xlsx = require('xlsx')
const Expense = require("../models/Expense");
const { detectRecurringTransactions, saveSubscriptions } = require("../services/subscriptionDetector");

exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const { icon, category, amount, date, title } = req.body;

        if( !category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required"});
        }

        const newExpense = new Expense ({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
            title: title || category,
            dataSource: "manual"
        });

        await newExpense.save();

        try {
            const detected = await detectRecurringTransactions(userId);
            if (detected.length > 0) {
                await saveSubscriptions(userId, detected);
            }
        } catch (error) {
            console.error("Error detecting subscriptions:", error);
        }

        res.status(200).json(newExpense);
    } catch(error) {
        console.error("Error adding expense:", error);
        res.status(500).json({message: "Server Error", error: error.message});
    }

}
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userId }).sort({ date: -1});
        res.json(expense);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
exports.deleteExpense = async (req, res) => {
    try { 
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully"});
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try { 
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        const data = expense.map((item) => ({
            category: item.category,
            Amount: item.amount, 
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new(); 
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        
        const filePath = "expense_details.xlsx";
        xlsx.writeFile(wb, filePath);

        res.download(filePath);
    } catch (error) {
        console.error("Download Excel error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
