
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, BankAccount } from "../types";

export const geminiService = {
  analyzeFinancialHealth: async (
    transactions: Transaction[],
    categories: Category[],
    accounts: BankAccount[]
  ): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare data for AI
      const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const categorySpending = categories
        .filter(c => c.type === 'EXPENSE')
        .map(c => {
          const amount = transactions
            .filter(t => t.categoryId === c.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return { name: c.name, amount };
        })
        .filter(c => c.amount > 0);

      const prompt = `
        你是一位專業的個人理財顧問。請根據以下使用者的財務數據提供精簡且具建設性的分析與建議：
        
        數據總結：
        - 總收入：${totalIncome} TWD
        - 總支出：${totalExpense} TWD
        - 結餘：${totalIncome - totalExpense} TWD
        - 主要支出類別：${categorySpending.map(c => `${c.name}: ${c.amount}`).join(', ')}
        - 帳戶狀態：${accounts.map(a => `${a.name}: 餘額 ${a.balance}`).join(', ')}

        請提供：
        1. 財務現況簡評（100字內）
        2. 三個具體的省錢或投資建議（條列式）
        3. 根據目前的結餘率給予一個理財金句。
        
        請使用親切且專業的語氣，使用繁體中文。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "無法生成分析，請稍後再試。";
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "AI 分析暫時不可用，請檢查您的網路連接或 API 金鑰設置。";
    }
  }
};
