"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SendHorizontal } from "lucide-react";
import { useSocket } from "../../context/SocketProvider";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

// Define the message type returned from Prisma
type Message = {
  id: string;
  text: string;
  createdAt: string; // ISO string format
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const App = () => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]); // State for storing initial messages
  const { sendMessage, messages } = useSocket(); // Socket context

  // Fetch initial messages from the backend API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/messages`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data: Message[] = await response.json();
        console.log("Fetched messages:", data);
        setInitialMessages(data);
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      sendMessage(newMessage); // Send the message via the socket
      setNewMessage("");
    }
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  // Combine initial messages from API with real-time messages from socket
  const allMessages = [...initialMessages, ...(messages || [])];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border rounded-lg overflow-hidden">
      <header className="p-4 border-b flex items-center">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt="Alice Johnson"
          />
          <AvatarFallback>{getInitials("Alice Johnson")}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">Alice Johnson</h2>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </header>
      <ScrollArea className="flex-grow p-4">
        {/* Render all messages */}
        {allMessages.map((message: Message | string, index: number) => (
          <div key={index} className="flex items-start mb-4 justify-start">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Alice Johnson"
              />
              <AvatarFallback>{getInitials("Alice Johnson")}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="p-2 rounded-lg bg-muted">
                {typeof message === "string" ? message : message.text}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <Separator />
      <div className="p-4 flex items-center">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleNewMessageChange}
          className="flex-grow mr-2"
        />
        <Button onClick={handleSendMessage}>
          <SendHorizontal className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default App;
