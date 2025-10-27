import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de último login',
    example: '2023-10-27T10:30:00Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2023-10-27T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización',
    example: '2023-10-27T10:30:00Z',
  })
  updatedAt: Date;
}