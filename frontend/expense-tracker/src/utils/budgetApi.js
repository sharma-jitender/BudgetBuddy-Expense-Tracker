export const BUDGET_API_DISABLED_KEY = "budget_api_disabled";

export function isBudgetApiEnabled() {
  return localStorage.getItem(BUDGET_API_DISABLED_KEY) !== "1";
}

export function disableBudgetApi() {
  localStorage.setItem(BUDGET_API_DISABLED_KEY, "1");
}

export function enableBudgetApi() {
  localStorage.removeItem(BUDGET_API_DISABLED_KEY);
}


