import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class ChatbotComponent {
  messages = signal<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your WormSec assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  messageInput = '';

  sendMessage() {
    if (!this.messageInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.messageInput,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.messageInput = '';

    // Simulate bot response (will be connected to AI later)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I received your message. AI integration coming soon!',
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, botMessage]);
    }, 1000);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}