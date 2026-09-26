console.log("Script frontend cargado correctamente.");
const BACKEND_URL = "http://localhost:3000/api/chat";

// El navegador será el encargado de recordar el hilo
let conversationHistory = [];

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const message = inputField.value.trim();

  if (!message) return;

  // 1. Agregamos lo que escribió el usuario al historial y a la UI
  conversationHistory.push({ role: "user", content: message });
  addMessageToUI(message, "user-message");
  inputField.value = "";

  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.style.display = "block";

  try {
    // 2. Enviamos TODO el historial al backend
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    const data = await response.json();

    if (data.reply) {
      // 3. Guardamos la respuesta de Edu en el historial y la mostramos
      conversationHistory.push({ role: "assistant", content: data.reply });
      typingIndicator.style.display = "none";
      addMessageToUI(data.reply, "bot-message");
    } else {
      throw new Error("El backend no devolvió la propiedad 'reply'.");
    }
  } catch (error) {
    console.error("Error capturado en la conexión:", error);
    typingIndicator.style.display = "none";
    // Si hay error, quitamos el mensaje del usuario del historial para que no se corrompa
    conversationHistory.pop();
    addMessageToUI(
      "Uy, tuve un problema de conexión. ¿Podemos intentarlo de nuevo?",
      "bot-message",
    );
  }
}

function addMessageToUI(text, className) {
  const container = document.getElementById("messages-container");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  msgDiv.textContent = text;

  const typingIndicator = document.getElementById("typing-indicator");
  container.insertBefore(msgDiv, typingIndicator);
  container.scrollTop = container.scrollHeight;
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}