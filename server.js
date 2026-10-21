
import express from "express"
import dotenv from "dotenv"
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGoogle } from "@langchain/google"
dotenv.config();

const PORT = process.env.PORT || 5000
const app = express();
app.use(express.json());

// const llm = new ChatGoogleGenerativeAI({
//     model: "gemini-3.7-flash",
//     temperature: 0,
//     maxRetries: 2,
//     // other params...
// })

// app.post("/chat", async(req, res) => {
//     const { input } = req.body;

//     const ai_Response = await llm.invoke([
//         {
//             role:"system",
//             content:"You are a cricket expert"
//         },
//         {
//             role:"human",
//             content:input
//         }
//     ])

//     return res.status(200).json({
//         success:true,
//         message:ai_Response.content
//     })
// })


//using langchain
app.post("/agent", async(req,res) => {
    const { prompt } = req.body;
    const model = new ChatGoogle("gemini-3.7-flash");
    const result = await model.invoke(prompt)
    return res.status(200).json({
        success:true,
        message:result.text
    })
})


app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
