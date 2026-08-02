import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './modules/rooms/rooms.module';
import { GraphsModule } from './modules/graphs/graphs.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GraphsModule, RoomsModule],
})
export class AppModule {}
