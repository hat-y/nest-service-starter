import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseSearchDto {
  static readonly DEFAULT_PAGE_NUMBER = 1;
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly MAX_PAGE_SIZE_ALLOWED = 100;

  @ApiPropertyOptional({
    description: 'Campo de ordenamiento (usar - para descendente)',
    example: 'name',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: BaseSearchDto.DEFAULT_PAGE_NUMBER,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  pageNumber: number = BaseSearchDto.DEFAULT_PAGE_NUMBER;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    default: BaseSearchDto.DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: BaseSearchDto.MAX_PAGE_SIZE_ALLOWED,
  })
  @Type(() => Number)
  @IsInt()
  @Max(BaseSearchDto.MAX_PAGE_SIZE_ALLOWED)
  @IsOptional()
  pageSize: number = BaseSearchDto.DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Búsqueda textual general',
    example: 'search term',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Dirección de ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  getPageNumber(): number {
    return this.pageNumber;
  }

  getOffset(): number {
    return (this.getPageNumber() - 1) * this.getTake();
  }

  getTake(): number {
    return Math.min(this.pageSize, BaseSearchDto.MAX_PAGE_SIZE_ALLOWED);
  }

  getSortBy(): string {
    return this.sortBy || 'id';
  }

  getSortOrder(): 'ASC' | 'DESC' {
    return (this.sortOrder || 'desc').toUpperCase() as 'ASC' | 'DESC';
  }
}