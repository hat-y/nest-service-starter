import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AppLogger } from '../../../common/logger/logger';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log({
      message: `Intento de registro para usuario: ${registerDto.email}`,
      email: registerDto.email,
      name: registerDto.name,
    });

    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      this.logger.warn({
        message: `Intento de registro con email ya existente: ${registerDto.email}`,
        email: registerDto.email,
      });
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const tokens = await this.generateTokens(savedUser.id, savedUser.email);

    await this.updateLastLogin(savedUser.id);

    this.logger.log({
      message: `Usuario registrado exitosamente`,
      userId: savedUser.id,
      email: savedUser.email,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log({
      message: `Intento de login para usuario: ${loginDto.email}`,
      email: loginDto.email,
    });

    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn({
        message: `Login fallido - usuario no encontrado: ${loginDto.email}`,
        email: loginDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn({
        message: `Login fallido - contraseña inválida: ${loginDto.email}`,
        email: loginDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn({
        message: `Login fallido - cuenta desactivada: ${loginDto.email}`,
        email: loginDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException('User account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.updateLastLogin(user.id);

    this.logger.log({
      message: `Login exitoso para usuario: ${loginDto.email}`,
      email: loginDto.email,
      userId: user.id,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, email: payload.email },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      } as any),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      } as any),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
}