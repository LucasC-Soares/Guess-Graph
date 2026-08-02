import { Module } from '@nestjs/common';
import { GraphGeneratorService } from './graph-generator.service';
import { GraphPropertiesService } from './graph-properties.service';

@Module({
  providers: [GraphGeneratorService, GraphPropertiesService],
  exports: [GraphGeneratorService, GraphPropertiesService],
})
export class GraphsModule {}
