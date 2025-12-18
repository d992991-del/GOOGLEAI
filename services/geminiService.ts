
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Transaction, Category, BankAccount } from "../types";

export const geminiService = {
  analyzeFinancialHealth: async (
    transactions: Transaction[],
    categories: Category[],
    accounts: BankAccount[]
  ): Promise<string> => {
    try {
      // Always initialize with named parameter and use process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const summary = {
        income: transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
        expense: transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
        topCategory: categories.map(c => ({
          name: c.name,
          amount: transactions.filter(t => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0)
        })).sort((a, b) => b.amount - a.amount)[0]
      };

      const prompt = `
        你是一位專業的理財顧問。請根據以下數據進行分析：
        - 總收入：${summary.income} TWD
        - 總支出：${summary.expense} TWD
        - 最大支出項目：${summary.topCategory?.name || '無'} (${summary.topCategory?.amount || 0} TWD)
        - 現有帳戶餘額：${accounts.map(a => `${a.name}: ${a.balance}`).join(', ')}

        請提供：
        1. 針對目前收支平衡的簡短分析。
        2. 給予 2-3 個具體的理財或省錢建議。
        3. 一句充滿動力的財務座右銘。
        請使用繁體中文。
      `;

      // Use GenerateContentResponse type as per guidelines
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      // Extract generated text directly from the .text property
      return response.text || "AI 暫時無法產生建議。";
    } catch (error) {
      console.error("Gemini AI 分析失敗:", error);
      return "AI 分析服務目前暫時不可用，請稍後再試。";
    }
  }
};
