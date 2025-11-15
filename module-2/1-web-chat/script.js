function sendMessage() {
  const inputBox = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = inputBox.value.trim();

  if (userMessage === "") return; // blank

  // User message show
  const userDiv = document.createElement("div");
  userDiv.classList.add("user");
  userDiv.textContent = "You: " + userMessage;
  chatBox.appendChild(userDiv);

  // Bot reply logic (simple condition)
  let botReply = "I’m not sure I understand.";

  if (userMessage.toLowerCase().includes("hello")) {
    botReply = "Hi there!  How can I help you today?";
  } else if (userMessage.toLowerCase().includes("how are you")) {
    botReply = "I'm just code, but I'm feeling good ";
  } else if (userMessage.toLowerCase().includes("bye")) {
    botReply = "Goodbye! Have a great day! ";
  }

  const botDiv = document.createElement("div");
  botDiv.classList.add("bot");
  botDiv.textContent = "Bot: " + botReply;
  chatBox.appendChild(botDiv);

  // Scroll down
  chatBox.scrollTop = chatBox.scrollHeight;

  // Input clear
  inputBox.value = "";
}
