
import express from "express"
import dotenv from "dotenv"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
dotenv.config();

const PORT = process.env.PORT || 5000
const app = express();
app.use(express.json());

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.7-flash",
    temperature: 0,
    maxRetries: 2,
    // other params...
})

app.post("/chat", async(req, res) => {
    const { input } = req.body;

    const ai_Response = await llm.invoke([
        {
            role:"system",
            content:"You are a cricket expert"
        },
        {
            role:"human",
            content:input
        }
    ])

    return res.status(200).json({
        success:true,
        message:ai_Response.content
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
