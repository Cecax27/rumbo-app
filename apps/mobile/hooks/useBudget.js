import { useState, useEffect } from "react";
import { getBudgetGroups, getBudgetPlans } from "../lib/supabase/tools";

export function useBudget() {

    // states
    const [budgetGroups, setBudgetGroups] = useState([]);
    const [budgetPlans, setBudgetPlans] = useState([]);

    // functions
    const fetchBudgetGroups = async () => {
        const data = await getBudgetGroups();
        if (data) { setBudgetGroups(data); }
    };

    const fetchBudgetPlans = async () => {
        const data = await getBudgetPlans();        
        if (data) { setBudgetPlans(data); }
    };

    // effects
    useEffect(() => { fetchBudgetGroups(); fetchBudgetPlans(); }, [])

    // returns
    return {
        budgetGroups,
        budgetPlans,
        fetchBudgetPlans
    }

}