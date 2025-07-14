import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Min } from "class-validator";

export class GetPaginatedProductsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number

  @ApiPropertyOptional({
    description: 'Number of products per page',
    example: 10
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number

  @ApiPropertyOptional({ enum: ['id', 'title'], default: 'id' })
  @IsIn(['id', 'title'])
  @IsOptional()
  sortBy: 'id' | 'title' = 'id';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'asc';
}
