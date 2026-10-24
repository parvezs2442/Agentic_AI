
import express from "express"
import dotenv from "dotenv"
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGoogle } from "@langchain/google"
import { TavilySearch } from "@langchain/tavily"
import { createAgent, tool } from "langchain"
import z from "zod"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph"



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

//custom tool for addition
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

//tool for mail send 
const tool3 = tool(
    ({email, content}) => {
        return `Email is send successfully to ${email} with content ${content}`
    }, {
        name:"email_tool",
        description:"This tool is used to send email",
        schema:z.object({
            email:z.string().describe("sender email"),
            content:z.string().describe("Email content to send")
        })
    }
)

const tools = [tool1, tool2, tool3]
const model = new ChatGoogle("gemini-3.7-flash").bindTools(tools)



app.post("/tool", async (req,res) => {

    const { prompt } = req.body;
    const agent = createAgent({
        model,
        tools:[tool1, tool2, tool3],
    })

    const result = await agent.invoke({
        messages:[
            {
                role:"human",
                content:prompt
            }
        ]
    })
    console.log(result.messages[result.messages.length-1].content)
    return res.status(200).json({
        success:true,
        message:(result.messages[result.messages.length-1].content)
    })
})


//langGraph

//toolNode
const toolNode = new ToolNode(tools)

//agent node
const agent = async (state) => {
    const result = await model.invoke({
        ...state.messages
    })
    return {
        messages:[result]
    }
}

//should continue , return edge name

const shouldContinue = () => {
    
} 


const graph = new StateGraph(MessagesAnnotation)
.addNode("agent", agent)
.addNode("tool_node", toolNode)
.addEdge("__start__","agent")





app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})
