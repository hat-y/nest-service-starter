export class OrderByDto {
  sortBy: string;
  orderBy: 'ASC' | 'DESC';

  constructor(sortCriteria: string) {
    this.sortBy = sortCriteria;

    if (this.sortBy.startsWith('+') || this.sortBy.startsWith('-')) {
      this.sortBy = this.sortBy.substring(1);
    }

    this.orderBy =
      sortCriteria && !sortCriteria.startsWith('-') ? 'ASC' : 'DESC';
  }

  getSortBy(): string {
    return this.sortBy;
  }

  getOrderBy(): 'ASC' | 'DESC' {
    return this.orderBy;
  }

  static createArray(sortCriteria: string): OrderByDto[] {
    return sortCriteria
      ? sortCriteria.split(',').map((criteria) => new OrderByDto(criteria.trim()))
      : [new OrderByDto('-id')];
  }
}