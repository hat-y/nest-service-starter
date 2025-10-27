import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { User } from '../entities/user.entity';
import { AppLogger } from '../../../common/logger/logger';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Iniciando validación para el email: ${createUserDto.email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      this.logger.warn(`Usuario con email ${createUserDto.email} ya existe`);
      throw new ConflictException('User with this email already exists');
    }

    if (createUserDto.email.includes('test')) {
      this.logger.warn(
        'Email de prueba detectado, omitiendo validación estricta.',
      );
    }

    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`Usuario creado exitosamente con ID: ${savedUser.id}`);
    return savedUser;
  }

  async findAll(query: UserQueryDto) {
    const { page, limit, sortBy, sortOrder, search } = query;

    this.logger.log({
      message: 'Buscando usuarios',
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where('user.name LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, (sortOrder || 'asc').toUpperCase() as 'ASC' | 'DESC')
      .skip(((page || 1) - 1) * (limit || 10))
      .take(limit || 10);

    const [users, total] = await queryBuilder.getManyAndCount();

    this.logger.log(`Encontrados ${total} usuarios`);
    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Buscando usuario con ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      this.logger.warn(`Usuario con ID ${id} no encontrado`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`Usuario con ID ${id} encontrado`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log({
      message: 'Actualizando usuario',
      id,
      data: updateUserDto,
    });

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!existingUser) {
      this.logger.warn(`Usuario con ID ${id} no encontrado para actualizar`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        this.logger.warn(`Email ${updateUserDto.email} ya está en uso`);
        throw new ConflictException('Email already in use');
      }
    }

    await this.userRepository.update(id, updateUserDto);
    const user = await this.userRepository.findOne({
      where: { id },
    });

    this.logger.log(`Usuario con ID ${id} actualizado exitosamente`);
    return user!;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Eliminando usuario con ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      this.logger.warn(`Usuario con ID ${id} no encontrado para eliminar`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softDelete(id);
    this.logger.log(`Usuario con ID ${id} eliminado exitosamente`);
  }

  async activate(id: string): Promise<void> {
    this.logger.log(`Activando usuario con ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.update(id, { isActive: true });
    this.logger.log(`Usuario con ID ${id} activado`);
  }

  async deactivate(id: string): Promise<void> {
    this.logger.log(`Desactivando usuario con ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.update(id, { isActive: false });
    this.logger.log(`Usuario con ID ${id} desactivado`);
  }
}