import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppLogger } from 'src/common/logger/logger';

@Injectable()
export class UsersService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(UsersService.name);
  }
  createUser(name: string, email: string): { id: string; name: string } {
    this.logger.log(`Iniciando validación para el email: ${email}`);

    if (email.includes('test')) {
      this.logger.warn(
        'Email de prueba detectado, omitiendo validación estricta.',
      );
    }

    const userId = 'DB-ID-' + Math.floor(Math.random() * 900 + 100);

    this.logger.log(`Registro completado con éxito. ID interno: ${userId}`);
    return { id: userId, name };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user with data: ${JSON.stringify(updateUserDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
