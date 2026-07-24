const xlsx = require('xlsx');
const prisma = require("../config/prismaClient");

exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, source, amount, date, title } = req.body;

        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        const newIncome = await prisma.income.create({
            data: {
                userId,
                icon,
                source,
                amount: parsedAmount,
                date: new Date(date),
                title: title || source,
            },
        });

        res.status(200).json(newIncome);
    } catch (error) {
        console.error("Error adding income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
        res.json(income);
    } catch (error) {
        console.error("Error fetching income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.deleteIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await prisma.income.findUnique({ where: { id: req.params.id } });
        if (!income || income.userId !== userId) {
            return res.status(404).json({ message: "Income not found" });
        }
        await prisma.income.delete({ where: { id: req.params.id } });
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });

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