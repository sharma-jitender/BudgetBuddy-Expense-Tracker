import React, { useState, useEffect } from "react";
import Input from "../Inputs/input";
import addThousandsSeprator from "../../utils/helper";

const BudgetLimitForm = ({ currentBudget, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    overallLimit: "",
    categoryLimits: [],
  });
  const [newCategory, setNewCategory] = useState({ category: "", limit: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentBudget) {
      setFormData({
        overallLimit: currentBudget.overallLimit || "",
        categoryLimits: currentBudget.categoryLimits || [],
      });
    }
  }, [currentBudget]);

  const handleOverallLimitChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, overallLimit: value });
    if (errors.overallLimit) {
      setErrors({ ...errors, overallLimit: "" });
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.category.trim() || !newCategory.limit) {
      setErrors({ ...errors, newCategory: "Please fill in both category and limit" });
      return;
    }

    const limit = parseFloat(newCategory.limit);
    if (isNaN(limit) || limit <= 0) {
      setErrors({ ...errors, newCategory: "Please enter a valid positive number" });
      return;
    }

    // Check if category already exists
    if (formData.categoryLimits.some(cat => cat.category === newCategory.category)) {
      setErrors({ ...errors, newCategory: "This category already exists" });
      return;
    }

    setFormData({
      ...formData,
      categoryLimits: [...formData.categoryLimits, { ...newCategory, limit }],
    });
    setNewCategory({ category: "", limit: "" });
    setErrors({ ...errors, newCategory: "" });
  };

  const handleRemoveCategory = (index) => {
    setFormData({
      ...formData,
      categoryLimits: formData.categoryLimits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate overall limit
    if (!formData.overallLimit || parseFloat(formData.overallLimit) <= 0) {
      newErrors.overallLimit = "Please enter a valid overall budget limit";
    }

    // Validate category limits
    const totalCategoryLimits = formData.categoryLimits.reduce((sum, cat) => sum + cat.limit, 0);
    const overallLimit = parseFloat(formData.overallLimit);
    
    if (totalCategoryLimits > overallLimit) {
      newErrors.categoryLimits = "Total category limits cannot exceed overall budget limit";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      overallLimit: parseFloat(formData.overallLimit),
      categoryLimits: formData.categoryLimits,
    });
  };

  const totalCategoryLimits = formData.categoryLimits.reduce((sum, cat) => sum + cat.limit, 0);
  const remainingBudget = parseFloat(formData.overallLimit) - totalCategoryLimits;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Set Monthly Budget</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input
            label="Overall Monthly Budget"
            type="text"
            value={addThousandsSeprator(formData.overallLimit)}
            onChange={handleOverallLimitChange}
            placeholder="Enter your monthly budget"
            error={errors.overallLimit}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Category Budgets (Optional)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set spending limits for specific categories. Total category limits cannot exceed your overall budget.
          </p>

          {formData.categoryLimits.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Category Limits:</h4>
              <div className="space-y-2">
                {formData.categoryLimits.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="font-medium">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">₹{addThousandsSeprator(cat.limit)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Category Name"
              type="text"
              value={newCategory.category}
              onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
              placeholder="e.g., Food, Transport"
            />
            <Input
              label="Category Limit"
              type="number"
              value={newCategory.limit}
              onChange={(e) => setNewCategory({ ...newCategory, limit: e.target.value })}
              placeholder="Enter limit"
            />
          </div>
          
          {errors.newCategory && (
            <p className="text-red-500 text-sm mb-2">{errors.newCategory}</p>
          )}
          
          {errors.categoryLimits && (
            <p className="text-red-500 text-sm mb-2">{errors.categoryLimits}</p>
          )}

          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Add Category
          </button>
        </div>

        {formData.overallLimit && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Budget Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Overall Budget:</span>
                <span className="font-medium">₹{addThousandsSeprator(formData.overallLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Category Limits:</span>
                <span className="font-medium">₹{addThousandsSeprator(totalCategoryLimits)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Remaining:</span>
                <span className={`font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{addThousandsSeprator(remainingBudget)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {currentBudget?.overallLimit ? "Update Budget" : "Set Budget"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetLimitForm;
