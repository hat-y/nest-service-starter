import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';
import { PageDto } from '../../../common/dto/page.dto';
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

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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

    return plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async search(query: UserQueryDto): Promise<PageDto<UserResponseDto>> {
    this.logger.log({
      message: 'Buscando usuarios con paginación',
      query: {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        sortBy: query.getSortBy(),
        sortOrder: query.getSortOrder(),
        q: query.q,
        name: query.name,
        email: query.email,
        isActive: query.isActive,
      },
    });

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Aplicar filtros específicos
    if (query.name) {
      queryBuilder.andWhere('user.name ILIKE :name', { name: `%${query.name}%` });
    }

    if (query.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${query.email}%` });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    // Búsqueda textual general
    if (query.q) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.q}%` },
      );
    }

    // Validación de campos de ordenamiento
    const validSortFields = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'isActive'];
    const sortBy = query.getSortBy();

    if (validSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`user.${sortBy}`, query.getSortOrder());
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    // Ejecutar consulta paginada
    const [users, total] = await queryBuilder
      .skip(query.getOffset())
      .take(query.getTake())
      .getManyAndCount();

    this.logger.log(`Encontrados ${total} usuarios para la página ${query.pageNumber}`);

    // Transformar entidades a DTOs
    const userDtos = users.map((user) =>
      plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    );

    // Construir respuesta paginada
    return PageDto.create(
      userDtos,
      total,
      query.pageNumber,
      query.pageSize,
      query.getSortBy(),
      query.sortOrder,
    );
  }

  async findOne(id: string): Promise<UserResponseDto> {
    this.logger.log(`Buscando usuario con ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      this.logger.warn(`Usuario con ID ${id} no encontrado`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`Usuario con ID ${id} encontrado`);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
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

    return plainToInstance(UserResponseDto, user!, {
      excludeExtraneousValues: true,
    });
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