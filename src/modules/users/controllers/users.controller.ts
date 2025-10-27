import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { User } from '../entities/user.entity';
import { AppLogger } from '../../../common/logger/logger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { name, email } = createUserDto;
    this.logger.log({
      message: `Petición [POST] recibida para ${email}`,
      name,
      email,
    });

    const user = await this.usersService.create(createUserDto);

    this.logger.log({
      message: 'Petición completada, enviando respuesta.',
      userId: user.id,
    });

    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: UserQueryDto) {
    this.logger.log({
      message: 'Petición [GET] recibida para listar usuarios',
      query,
    });

    const result = await this.usersService.findAll(query);

    this.logger.log({
      message: 'Petición de listado completada',
      total: result.total,
    });

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    this.logger.log({
      message: `Petición [GET] recibida para usuario ${id}`,
      userId: id,
    });

    const user = await this.usersService.findOne(id);

    this.logger.log({
      message: 'Petición de obtención completada',
      userId: id,
    });

    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.logger.log({
      message: `Petición [PATCH] recibida para actualizar usuario ${id}`,
      userId: id,
      data: updateUserDto,
    });

    const user = await this.usersService.update(id, updateUserDto);

    this.logger.log({
      message: 'Petición de actualización completada',
      userId: id,
    });

    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log({
      message: `Petición [DELETE] recibida para eliminar usuario ${id}`,
      userId: id,
    });

    await this.usersService.remove(id);

    this.logger.log({
      message: 'Petición de eliminación completada',
      userId: id,
    });
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User successfully activated',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async activate(@Param('id') id: string): Promise<void> {
    this.logger.log({
      message: `Petición [PATCH] recibida para activar usuario ${id}`,
      userId: id,
    });

    await this.usersService.activate(id);

    this.logger.log({
      message: 'Petición de activación completada',
      userId: id,
    });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User successfully deactivated',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deactivate(@Param('id') id: string): Promise<void> {
    this.logger.log({
      message: `Petición [PATCH] recibida para desactivar usuario ${id}`,
      userId: id,
    });

    await this.usersService.deactivate(id);

    this.logger.log({
      message: 'Petición de desactivación completada',
      userId: id,
    });
  }
}
