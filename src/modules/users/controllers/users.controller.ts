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
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PageDto } from '../../../common/dto/page.dto';
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
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search users with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PageDto<UserResponseDto>,
  })
  async search(@Query() query: UserQueryDto): Promise<PageDto<UserResponseDto>> {
    const searchQuery = plainToInstance(UserQueryDto, query);
    return this.usersService.search(searchQuery);
  }

  @Get('legacy')
  @ApiOperation({ summary: 'Legacy endpoint for backward compatibility - use /users instead' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully (legacy format)',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: UserQueryDto) {
    // Legacy compatibility endpoint
    const result = await this.search(query);
    return {
      users: result.data,
      total: result.metadata.count,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
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
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
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
    await this.usersService.remove(id);
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
    await this.usersService.activate(id);
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
    await this.usersService.deactivate(id);
  }
}
