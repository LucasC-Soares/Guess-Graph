import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { Room } from './interfaces/room.interface';

export interface RoomStore {
  exists(code: string): Promise<boolean>;
  get(code: string): Promise<Room | undefined>;
  set(room: Room): Promise<void>;
  delete(code: string): Promise<void>;
  listCodes(): Promise<string[]>;
}

@Injectable()
export class RedisRoomStore implements RoomStore, OnModuleDestroy {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  private readonly keyPrefix = 'guess-graph:room:';

  async exists(code: string): Promise<boolean> {
    return (await this.redis.exists(this.key(code))) === 1;
  }

  async get(code: string): Promise<Room | undefined> {
    const serializedRoom = await this.redis.get(this.key(code));
    return serializedRoom ? (JSON.parse(serializedRoom) as Room) : undefined;
  }

  async set(room: Room): Promise<void> {
    await this.redis.set(this.key(room.code), JSON.stringify(room));
  }

  async delete(code: string): Promise<void> {
    await this.redis.del(this.key(code));
  }

  async listCodes(): Promise<string[]> {
    const codes: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', `${this.keyPrefix}*`, 'COUNT', 100);
      cursor = nextCursor;
      codes.push(...keys.map((key) => key.slice(this.keyPrefix.length)));
    } while (cursor !== '0');
    return codes;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private key(code: string): string {
    return `${this.keyPrefix}${code}`;
  }
}