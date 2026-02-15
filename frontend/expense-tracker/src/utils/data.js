import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuTarget,
    LuLogOut,
    LuBanknote, 
    LuRepeat,
    LuTrendingUp
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
        id: "08",
        label: "Analytics",
        icon: LuTrendingUp,
        path: "/analytics",
    },
    {
        id: "05",
        label: "Bank Connection",
        icon: LuBanknote,
        path: "/bank-connection",
    },
    {
        id : "07",
        label: "Subscriptions",
        icon: LuRepeat,
        path: "/subscriptions",
    },
    {
        id: "06",
        label: "Logout",
        icon: LuLogOut,
        path: "/logout",
    }
];