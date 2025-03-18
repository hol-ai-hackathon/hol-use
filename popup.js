document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessages = document.getElementById('chatMessages');

  // Function to add a message to the chat
  function addMessage(message, isSent = true) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSent ? 'sent' : 'received');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Send message when clicking the send button
  sendButton.addEventListener('click', sendMessage);

  // Send message when pressing Enter
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      addMessage(message);
      messageInput.value = '';
      
      // Simulate a response (you can replace this with actual API calls)
      setTimeout(() => {
        addMessage('I\'m your Hands on Labs assistant. How can I help you with your lab exercises?', false);
      }, 1000);
    }
  }

  // Add welcome message
  addMessage('Welcome to Hands on Labs! I\'m here to help you with your lab exercises and practical learning.', false);
}); 