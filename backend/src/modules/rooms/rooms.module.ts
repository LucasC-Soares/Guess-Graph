import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { RedisRoomStore } from './redis-room-store';
import { GraphsModule } from '../graphs/graphs.module';

@Module({
  imports: [GraphsModule],
  providers: [RoomsGateway, RoomsService, RedisRoomStore],
})
export class RoomsModule {}
