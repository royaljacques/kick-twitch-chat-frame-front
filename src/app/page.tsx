"use client";
import { HtmlHTMLAttributes, useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{
    sender: string;
    content: string;
    platform: HtmlHTMLAttributes<HTMLElement>['children'];
    color: string;
  }[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://api.jacqueskoenig.eclipscloud.fr');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'connect',
        data: 'Hello, Server!'
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.name === 'success') {
        console.log('Connected to WebSocket server');
        return;
      }
      if (message.name === 'twitch' || message.name === 'kick') {
        console.log(message);

        const storedColor = localStorage.getItem(message.data.author);

        let color : string;
        if (storedColor) {
          const storedColorData = JSON.parse(storedColor);
          if (storedColorData.expires > Date.now()) {
            color = storedColorData.color;
          }else{
            color = getRandomColor();
            const expires = Date.now() + 3600000; // 1 hour
            localStorage.setItem(message.data.author, JSON.stringify({ color, expires }));
          }
        }

       
       
        

        setMessages(prevMessages => [
          {
            sender: message.data.author,
            content: message.data.message,
            platform: message.name === 'twitch' ? (
              <img
                className="platform-icon"
                src="https://cdn.pixabay.com/photo/2021/12/10/16/38/twitch-6860918_1280.png"
                alt="Twitch"
              />
            ) : (
              <img
                className="platform-icon"
                src="https://images.squarespace-cdn.com/content/v1/616460e27b59e64c426f4ea6/1680396290087-CH2J4ETBRUICX4ONUIRT/Kick+Stream+Logo.png?format=500w"
                alt="Kick"
              />
            ),
            color: color
          },
          ...prevMessages,
        ]);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        const maxHeight = window.innerHeight;
        const chatHeight = chatContainer.getBoundingClientRect().height;

        if (chatHeight > maxHeight) {
          const messagesToRemove = Math.ceil((chatHeight - maxHeight) / 45);
          setMessages(prevMessages => prevMessages.slice(0, prevMessages.length - messagesToRemove));
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div key={index} className="message">
          <div className="sender-container">
            {message.platform}
            <span className="spacer" />
            <span className="sender" style={{ color: message.color }}>{message.sender}:</span>
          </div>
          <span className="content">{message.content}</span>
        </div>
      ))}
    </div>
  );
}
