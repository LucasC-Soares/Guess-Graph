import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { GraphsModule } from '../graphs/graphs.module';

@Module({
  imports: [GraphsModule],
  providers: [RoomsGateway, RoomsService],
})
export class RoomsModule {}
