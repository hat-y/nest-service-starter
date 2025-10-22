import {
  BadRequestException,
  Injectable,
  Scope,
  type PipeTransform,
} from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger';
import { CreateUserDto } from '../dto/create-user.dto';

type IncomingCreateUserDto = Partial<Record<'name' | 'email', unknown>> &
  Record<string, unknown>;

@Injectable({ scope: Scope.REQUEST })
export class CreateUserValidationPipe
  implements PipeTransform<CreateUserDto | undefined, CreateUserDto>
{
  constructor(private readonly logger: AppLogger) {}

  transform(value: CreateUserDto | undefined): CreateUserDto {
    if (value == null) {
      this.warnAndThrow(
        'Cuerpo de la petición faltante para crear usuario.',
        {},
      );
    }

    const payload: IncomingCreateUserDto = value as IncomingCreateUserDto;

    const { name, email, ...rest } = payload;

    if (!this.isNonEmptyString(name)) {
      this.warnAndThrow(
        'El campo "name" es obligatorio para crear un usuario.',
        { name },
      );
    }

    if (!this.isNonEmptyString(email)) {
      this.warnAndThrow(
        'El campo "email" es obligatorio para crear un usuario.',
        { email },
      );
    }

    return {
      ...(rest as Record<string, unknown>),
      name: name.trim(),
      email: email.trim(),
    } as CreateUserDto;
  }

  private warnAndThrow(
    message: string,
    details: Record<string, unknown>,
  ): never {
    this.logger.warn(
      {
        message,
        ...details,
      },
      CreateUserValidationPipe.name,
    );

    throw new BadRequestException(message);
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
