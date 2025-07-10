"use server";

import axios from "axios";

export async function sendAIMessage(message: string) {
  try {
    const response = await axios.post("https://n8n.webdor.ir/webhook/ai-agent", {
      content:message,
    });
    return response.data;
  } catch (error: any) {
    return {
      output: "خطا در ارتباط با سرور هوش مصنوعی."
    };
  }
} 