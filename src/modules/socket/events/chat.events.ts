// These events are emit from client
export const ChatListenEvents = {
  // Messages
  MESSAGE_SEND: 'message.send',
  MESSAGE_MARK_ALL_READ: 'message.read_all',

  // Current user typing
  MESSAGE_TYPING_START: 'message.typing.start',
  MESSAGE_TYPING_STOP: 'message.typing.stop',

  // Rooms
  ROOM_JOIN: 'room.join', // single room join
};

// These events are listened on client
export const ChatEmitEvents = {
  // Messages
  MESSAGE_RECEIVE: 'message.receive',
  MESSAGE_READ: 'message.read',

  // Others users receiving
  MESSAGE_TYPING_STARTED: 'message.typing.started',
  MESSAGE_TYPING_STOPPED: 'message.typing.stopped',

  // Rooms
  ROOM_UPDATED: 'room.updated', // single update room
};

export const ChatFailedEvents = {
  // Messages
  MESSAGE_SEND: 'message.send-failed',
  MESSAGE_READ: 'message.read-failed',

  // Rooms
  ROOM_JOIN: 'rooms.join-failed',
};
