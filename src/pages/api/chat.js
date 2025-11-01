import Together from "together-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  try {
    const together = new Together();
    const response = await together.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-20b",
    });

    res.status(200).json({ content: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
}
