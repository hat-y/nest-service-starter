import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageMetadataDto } from './page-metadata.dto';

export class PageDto<T> {
  @ApiProperty({
    description: 'Datos de la página',
    isArray: true,
  })
  @Expose()
  data: T[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PageMetadataDto,
  })
  @Expose()
  metadata: PageMetadataDto;

  constructor(data: T[], count: number) {
    this.data = data;
    this.metadata = new PageMetadataDto(count);
  }

  static create<T>(data: T[], count: number, pageNumber: number, pageSize: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): PageDto<T> {
    const pageDto = new PageDto<T>(data, count);
    pageDto.metadata.setPaginationData(pageNumber, pageSize);
    if (sortBy) pageDto.metadata.sortBy = sortBy;
    if (sortOrder) pageDto.metadata.sortOrder = sortOrder;
    return pageDto;
  }
}