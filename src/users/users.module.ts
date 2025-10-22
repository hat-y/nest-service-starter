import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CreateUserValidationPipe } from './pipes/create-user-validation.pipe';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CreateUserValidationPipe],
})
export class UsersModule {}
