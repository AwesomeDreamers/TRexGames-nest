import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('Redis') private readonly redis: Redis.Redis) {}

  async setData(key: string, value: string, expireTime?: number) {
    return this.redis.set(key, value, 'EX', expireTime ?? 10);
  }

  async getData(key: string) {
    return await this.redis.get(key);
  }

  async deleteData(key: string) {
    await this.redis.del(key);
  }
}
