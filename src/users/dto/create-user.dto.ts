import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

const trimValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
  @Transform(({ value }) => trimValue(value))
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(({ value }) => trimValue(value))
  @IsEmail()
  email!: string;
}
