import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const trimValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
    minLength: 1,
  })
  @Transform(({ value }) => trimValue(value))
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  @Transform(({ value }) => trimValue(value))
  @IsEmail()
  email!: string;
}