import { BaseSearchDto } from '../../../common/dto/base-search.dto';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserQueryDto extends BaseSearchDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Buscar por email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}