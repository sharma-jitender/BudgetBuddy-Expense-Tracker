import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuTarget,
    LuLogOut,
    LuBanknote, // Add this for bank icon
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    }, 
    {
        id: "03",
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },
    {
        id: "04",
        label: "Budget",
        icon: LuTarget,
        path: "/budget",
    },
    {
        id: "05",
        label: "Bank Connection",
        icon: LuBanknote,
        path: "/bank-connection",
    },
    {
        id: "06",
        label: "Logout",
        icon: LuLogOut,
        path: "/logout",
    }
];