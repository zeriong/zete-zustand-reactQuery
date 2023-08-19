import { ApiProperty } from '@nestjs/swagger';

export class CoreOutput {
  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  target?: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ type: Boolean })
  success: boolean;
}
