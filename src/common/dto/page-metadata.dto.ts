import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PageMetadataDto {
  @ApiProperty({
    description: 'Total de registros',
    example: 150,
  })
  @Expose()
  count: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10,
  })
  @Expose()
  pageSize: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  @Expose()
  pageNumber: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 15,
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: 'Campo de ordenamiento aplicado',
    example: 'name',
  })
  @Expose()
  sortBy?: string;

  @ApiProperty({
    description: 'Dirección de ordenamiento',
    example: 'asc',
  })
  @Expose()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Tiene página siguiente',
    example: true,
  })
  @Expose()
  hasNext: boolean;

  @ApiProperty({
    description: 'Tiene página anterior',
    example: false,
  })
  @Expose()
  hasPrevious: boolean;

  constructor(count: number) {
    this.count = count;
  }

  setPaginationData(pageNumber: number, pageSize: number) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(this.count / this.pageSize);
    this.hasNext = this.pageNumber < this.totalPages;
    this.hasPrevious = this.pageNumber > 1;
  }
}