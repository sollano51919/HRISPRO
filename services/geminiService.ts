
// FIX: Corrected import path for types.
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Holiday } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateJobDescription = async (title: string, requirements: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a compelling and professional job description for the following role. Be comprehensive and structure it with sections like 'Role Overview', 'Key Responsibilities', 'Qualifications', and 'What We Offer'.
            
            **Job Title:** ${title}
            **Key Requirements/Skills:** ${requirements}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating job description:", error);
        return "Sorry, I couldn't generate the job description at this time. Please try again later.";
    }
};

export const generatePerformanceReview = async (name: string, achievements: string, improvementAreas: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a constructive and professional performance review summary for an employee. Be balanced, specific, and encouraging.
            
            **Employee Name:** ${name}
            **Key Achievements this period:** ${achievements}
            **Areas for Improvement/Development:** ${improvementAreas}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating performance review:", error);
        return "Sorry, I couldn't generate the performance review at this time. Please try again later.";
    }
};

export const analyzeChartData = async (chartTitle: string, dataSummary: string): Promise<string> => {
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `As an expert HR data analyst, provide three sharp, actionable insights based on the following data. Present them as a bulleted list.
            
            **Chart:** ${chartTitle}
            **Data Summary:** ${dataSummary}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing chart data:", error);
        return "Sorry, I couldn't analyze the data at this time.";
    }
}

export const generateOnboardingPlan = async (role: string, department: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a comprehensive 4-week onboarding plan for a new hire in the role of ${role} within the ${department} department. The plan should include key milestones, introductory meetings, and role-specific tasks.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: {
                            type: Type.ARRAY,
                            description: "List of weekly plans for the new hire.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    week: { type: Type.NUMBER, description: "The week number." },
                                    title: { type: Type.STRING, description: "A title for the week's focus." },
                                    tasks: {
                                        type: Type.ARRAY,
                                        description: "A list of tasks for the week.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                task: { type: Type.STRING, description: "The specific onboarding task." },
                                                completed: { type: Type.BOOLEAN, description: "Default to false." }
                                            },
                                            required: ["task", "completed"],
                                        }
                                    }
                                },
                                required: ["week", "title", "tasks"],
                            }
                        }
                    },
                    required: ["plan"],
                },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating onboarding plan:", error);
        return "{\"error\": \"Sorry, I couldn't generate the onboarding plan at this time. Please try again later.\"}";
    }
};

export const generateEmployeeSchedule = async (position: string, department: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a typical 7-day work schedule for an employee. A standard shift is "9-5". Most roles have Saturday and Sunday as "Day Off". Consider roles that might have different hours or a day off during the week.
            
            **Employee Position:** ${position}
            **Department:** ${department}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        monday: { type: Type.STRING, description: "Work schedule for Monday (e.g., '9-5', '10-6', 'Day Off')." },
                        tuesday: { type: Type.STRING, description: "Work schedule for Tuesday." },
                        wednesday: { type: Type.STRING, description: "Work schedule for Wednesday." },
                        thursday: { type: Type.STRING, description: "Work schedule for Thursday." },
                        friday: { type: Type.STRING, description: "Work schedule for Friday." },
                        saturday: { type: Type.STRING, description: "Work schedule for Saturday. Default to 'Day Off'." },
                        sunday: { type: Type.STRING, description: "Work schedule for Sunday. Default to 'Day Off'." }
                    },
                    required: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating employee schedule:", error);
        return `{"error": "Sorry, I couldn't generate the schedule at this time."}`;
    }
};


export const checkLeaveAvailability = async (
    employeeName: string, 
    leaveCredits: { vacation: number, sick: number, personal: number }, 
    leaveType: 'Vacation' | 'Sick Leave' | 'Personal', 
    startDate: string, 
    endDate: string,
    holidays: Omit<Holiday, 'id'>[]
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `An employee named ${employeeName} is requesting ${leaveType} from ${startDate} to ${endDate}. Their current leave balances are: Vacation: ${leaveCredits.vacation} days, Sick Leave: ${leaveCredits.sick} days, Personal Leave: ${leaveCredits.personal} days.
The company holidays are: ${JSON.stringify(holidays)}.

Calculate the number of working days in the requested date range (Monday to Friday), excluding any company holidays that fall within the range.
Compare the calculated working days with the available balance for the requested leave type.
Respond with a short, clear message.
- If the balance is sufficient, start your response with 'CONFIRMED:'. For example: 'CONFIRMED: The employee has enough leave balance for this request.'
- If the balance is insufficient, start with 'WARNING:'. For example: 'WARNING: The employee does not have enough vacation leave. They are short by 2 days.'
- If the dates are invalid (e.g., end date is before start date), start with 'ERROR:'.
`,
        });
        return response.text;
    } catch (error) {
        console.error("Error checking leave availability:", error);
        return "ERROR: Could not verify leave balance at this time.";
    }
};

class HRAssistantChat {
    private static instance: HRAssistantChat;
    public chat: Chat;

    private constructor() {
        this.chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are an expert AI HR Assistant. You answer questions about HR policies, best practices, and employee management concisely and professionally. Do not invent company policies; instead, provide general, best-practice advice.",
            },
        });
    }
    
    public static getInstance(): HRAssistantChat {
        if (!HRAssistantChat.instance) {
            HRAssistantChat.instance = new HRAssistantChat();
        }
        return HRAssistantChat.instance;
    }

    public async sendMessage(message: string): Promise<string> {
        try {
            const result: GenerateContentResponse = await this.chat.sendMessage({ message });
            return result.text;
        } catch (error) {
            console.error("Error sending chat message:", error);
            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }
}

export const hrAssistant = HRAssistantChat.getInstance();