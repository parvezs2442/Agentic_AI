
import express from "express"
import dotenv from "dotenv"
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGoogle } from "@langchain/google"
import { TavilySearch } from "@langchain/tavily"
import { createAgent, tool } from "langchain"
import z from "zod"


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

//creating a built in tool using langchain

const tool1 = new TavilySearch({
    maxResults:5,
    topic:"general"
});

//custom tool 
const tool2 = tool(
    ({a,b}) => {
        return `additon of ${a} and ${b} is 7`
    }, {
        name:"addition_tool",
        description:"tool to add two numbers",
        schema:z.object({
            a:z.number(),
            b:z.number()
        })
    }
)

const model = new ChatGoogle("gemini-3.7-flash");

app.post("/tool", async (req,res) => {

    const { prompt } = req.body;
    const agent = createAgent({
        model,
        tools:[tool1, tool2],
    })

    const result = await agent.invoke({
        messages:[
            {
                role:"human",
                content:prompt
            }
        ]
    })
    return res.status(200).json({
        success:true,
        message:(result.messages[result.messages.length-1].content)
    })
})



app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
