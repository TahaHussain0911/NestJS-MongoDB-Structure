export const ChatEvents = {
  // Messages
  MESSAGE_SEND: 'messages:send',
  MESSAGE_RECEIVE: 'messages:receive',
  MESSAGE_READ: 'messages:read',
  MESSAGE_TYPING: 'messages:typing',

  // Rooms
  ROOM_UPDATED: 'rooms:updated',
  ROOM_JOINED: 'rooms:joined',
} as const;
