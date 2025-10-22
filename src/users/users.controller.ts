import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AppLogger } from 'src/common/logger/logger';
import { CreateUserValidationPipe } from './pipes/create-user-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(AppLogger) private readonly logger: AppLogger,
    private readonly userService: UsersService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Post()
  create(@Body(CreateUserValidationPipe) dto: CreateUserDto) {
    const { name, email } = dto;
    this.logger.log({
      message: `Petición [POST] recibida para ${email}`,
      name,
      email,
    });

    const user = this.userService.createUser(name, email);
    this.logger.log({
      message: 'Petición completada, enviando respuesta.',
      userId: user.id,
    });
    return user;
  }
}
