export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  color: string;
  visible: boolean;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  notes: string;
  initials: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

export type MessageSender = "them" | "me" | "bot";

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
}

export interface Chat {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isBot: boolean;
  messages: Message[];
}
