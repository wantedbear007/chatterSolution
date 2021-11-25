import React, { useContext, useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import config from "../../../config";
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";
import initialBottyMessage from "../../../common/constants/initialBottyMessage";

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

const USER = "me";
const BOT = "bot";
const bottyMessage = {
  message: initialBottyMessage,
  id: Math.random(),
  user: BOT,
};

export default function Messages() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([bottyMessage]);
  const [botTyping, setBotTyping] = useState(false);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  // Scroll function
  const scrollBack = () => {
    const msgList = document.getElementById("message-list");
    msgList.scrollTo(0, [msgList.scrollHeight]);
  };

  // BOT Messages
  useEffect(() => {
    socket.on("bot-message", (message) => {
      scrollBack();
      setMessages([...messages, { message, user: BOT, id: Math.random() }]);
      setLatestMessage(BOT, message);
    });
  }, [messages]);

  useEffect(() => {
    scrollBack();
    socket.on("bot-typing", () => {
      setBotTyping(true);
    });
  }, []);

  // User messages
  const sendMessage = useCallback(() => {
    if (!message) {
      return null;
    }
    setMessages([...messages, { message, user: USER, id: Math.random() }]);
    socket.emit("user-message", message);
    document.getElementById("user-message-input").value = "";
    setMessage("");
  }, [messages, message]);

  const onChangeMessage = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((message, index) => (
          <Message
            message={message}
            nextMessage={messages[index + 1]}
            botTyping={botTyping}
          />
        ))}
        {botTyping ? <TypingMessage /> : undefined}
      </div>
      <Footer
        message={message}
        sendMessage={sendMessage}
        onChangeMessage={onChangeMessage}
      />
    </div>
  );
}
