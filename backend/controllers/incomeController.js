const User = require("../models/User");
const xlsx = require('xlsx')
const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const { icon, source, amount, date, title } = req.body;

        if( !source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required"});
        }

        const newIncome = new Income ({
            userId,
            icon,
            source,
            amount,
            date: new Date(date),
            title: title || source,
            dataSource: "manual"
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch(error) {
        console.error("Error adding income:", error);
        res.status(500).json({message: "Server Error", error: error.message});
    }

}
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userId }).sort({ date: -1});
        res.json(income);
    } catch (error) {
        console.error("Error fetching income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
exports.deleteIncome = async (req, res) => {
    try { 
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully"});
    } catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try { 
        const income = await Income.find({ userId }).sort({ date: -1 });

        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount, 
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new(); 
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        
        const filePath = "income_details.xlsx";
        xlsx.writeFile(wb, filePath);

        res.download(filePath);
    } catch (error) {
        console.error("Download Excel error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
