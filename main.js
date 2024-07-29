const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
const customResponses = {
  "whats ur name": "Hey, I'm Clever AI!",
  hi: "Hey, I'm Clever AI! How can I help you today?.",
  hello: "Hey, I'm Clever AI! How can I help you today?.",
  "who are you": "Hey, I'm Clever AI!",
  "who is ritesh maurya":
    "Ritesh Maurya is the Founder and Project Manager at Clever Studio, bringing over three years of experience in software project management. With a keen eye for detail and a passion for innovation, Ritesh leads his team to growth and success, ensuring every project exceeds client expectations.",
    "introduce yourself": "My name is Clever AI, developed by Clever Studio, a software development company that creates amazing websites for you.",
    "hey clever ai say hello to bni indus": "Good Morning BNI Indus, Welcome to Clever AI. Hope you have a nice day!"
};

const groupMembers = {
  "bni indus": [
    "Prajeet Rajan sir",
    "Navratan Soni sir",
    "Pushkar Salaonkar sir",
  ],
};

const normalizeString = (str) => str.replace(/\s+/g, " ").toLowerCase().trim();

const getGreetingMessage = (name) => {
  const hours = new Date().getHours();
  let timeOfDay;

  if (hours < 12) {
    timeOfDay = "Good morning";
  } else if (hours < 18) {
    timeOfDay = "Good afternoon";
  } else {
    timeOfDay = "Good evening";
  }

  return `Hey ${name}, ${timeOfDay}!`;
};

app.post("/clever-ai", async (req, res) => {
  const prompt = req.body.prompt.trim().toLowerCase();
  console.log(prompt);
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (customResponses[prompt]) {
    return res.json({ response: customResponses[prompt] });
  }

  if (prompt.startsWith("hey chutiya ai say hello to")) {
    let groupName = prompt.replace("hey clever ai say hello to", "").trim();
    console.log("Raw extracted group name:", groupName);

    // Normalize the group name
    groupName = normalizeString(groupName);
    console.log("Normalized group name:", groupName);

    const members = groupMembers[groupName];

    if (members) {
      // Join greetings with HTML line breaks
      const greetings = members
        .map((name) => getGreetingMessage(name))
        .join("<br>");
      return res.json({ response: greetings });
    } else {
      console.error("Group not found:", groupName); // Detailed logging
      return res.status(404).json({ error: "Group not found" });
    }
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleverAIResponse = `${text}`;
    res.json({ response: cleverAIResponse });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
