import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SocketSessionService {
  private readonly logger = new Logger(SocketSessionService.name);
  private onlineUsers: Map<string, Set<string>> = new Map();

  addSocket(userId: string, socketId: string): void {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
    this.logger.debug(`User ${userId} session added (Socket: ${socketId})`);
  }

  removeSocket(userId: string, socketId: string): void {
    const socketIds = this.onlineUsers.get(userId);
    if (socketIds) {
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        this.onlineUsers.delete(userId);
        this.logger.log(`User ${userId} all sessions disconnected`);
        return;
      }
      this.logger.log(`User ${userId} disconnected one session (Socket: ${socketId})`);
    }
  }

  getSockets(userId: string): Set<string> | undefined {
    return this.onlineUsers.get(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
