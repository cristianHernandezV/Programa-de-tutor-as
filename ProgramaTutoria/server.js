import express from "express";
import cors from "cors";
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Credenciales y variables de entorno extraídas de Foundry
const endpoint = "https://cristianhv0987-ia-9513-resource.services.ai.azure.com/api/projects/cristianhv0987-ia-9513";
const agentName = "bienes-raices";
const agentVersion = "4";

// Autenticación sin contraseñas (usa la sesión activa de Azure CLI)
const projectClient = new AIProjectClient(
  endpoint,
  new DefaultAzureCredential(),
);
const openAIClient = projectClient.getOpenAIClient();

// Endpoint para manejar las solicitudes de chat desde el frontend
app.post("/api/chat", async (req, res) => {
  try {
    // Recibimos el array completo de mensajes desde el frontend
    const { messages } = req.body;

    // 1. Mapeamos el historial al formato exacto que exige Azure
    const azureItems = messages.map((msg) => ({
      type: "message",
      role: msg.role,
      content: msg.content,
    }));

    // 2. Creamos la sesión de conversación inyectando todo el historial de golpe
    console.log("Inyectando historial y creando contexto en Azure...");
    const conversation = await openAIClient.conversations.create({
      items: azureItems,
    });

    // 3. Ejecutamos el agente para que responda al último mensaje del hilo
    console.log("Generando respuesta de EduIA...");
    const response = await openAIClient.responses.create(
      { conversation: conversation.id },
      {
        body: {
          agent_reference: {
            name: agentName,
            version: agentVersion,
            type: "agent_reference",
          },
        },
      },
    );

    // Devolvemos solo el texto
    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("Error al procesar la petición con Azure:", error);
    res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
  }
});

app.listen(port, () => {
  console.log(`API Proxy corriendo en http://localhost:${port}`);
  console.log(`Autenticación delegada a DefaultAzureCredential.`);
});