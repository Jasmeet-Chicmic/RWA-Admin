/**
 * Constants for Broadcast Messages
 */

export const MESSAGE_TYPES = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4,
  DOCUMENT: 5,
  LOCATION: 6,
  CONTACT: 7,
  STICKER: 8,
  GIF: 9,
  EMOJI: 10,
  SPONSORSHIP: 11,
} as const;

export type MessageTypeKey = keyof typeof MESSAGE_TYPES;
export type MessageTypeValue = (typeof MESSAGE_TYPES)[MessageTypeKey];

export enum SOCKET_EVENTS {
  SEND_MESSAGE = "sendMessage",
  MESSAGE_RECEIVED = "messageReceived",
  MESSAGE_SENT = "messageSent",
}
