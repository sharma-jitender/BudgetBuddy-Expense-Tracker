export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

//utils/apiPaths.js
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
    GET_MONTHLY_DATA: "/api/v1/dashboard/monthly",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INVOICE: `/api/v1/income/downloadexcel`,
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: `/api/v1/expense/downloadexcel`,
  },
  BUDGET_LIMIT: {
    GET_CURRENT: "/api/v1/budget-limit/current",
    SET_LIMIT: "/api/v1/budget-limit/set",
    GET_BY_MONTH: (month) => `/api/v1/budget-limit/month/${month}`,
    DELETE_BY_MONTH: (month) => `/api/v1/budget-limit/month/${month}`,
    CHECK_EXPENSE: "/api/v1/budget-limit/check-expense",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
