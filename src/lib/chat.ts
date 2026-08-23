/** Gedeeld berichttype voor de live chat (client + server). */
export interface ChatBericht {
  id: string;
  body: string;
  senderUserId: string;
  createdAt: string; // ISO-8601
}
