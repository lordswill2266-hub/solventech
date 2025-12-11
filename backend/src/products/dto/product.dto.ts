import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductCategory {
    ELECTRONICS = 'ELECTRONICS',
    FASHION = 'FASHION',
    PHONES = 'PHONES',
    LAPTOPS = 'LAPTOPS',
    ACCESSORIES = 'ACCESSORIES',
    BOOKS = 'BOOKS',
    OTHER = 'OTHER',
}

export enum ProductCondition {
    NEW = 'NEW',
    USED_LIKE_NEW = 'USED_LIKE_NEW',
    USED_GOOD = 'USED_GOOD',
    USED_FAIR = 'USED_FAIR',
}

export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 13 Pro Max' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ example: 'Excellent condition, barely used' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: 250000 })
    @IsNotEmpty()
    @IsNumber()
    @Min(100)
    price: number;

    @ApiProperty({ enum: ProductCategory, example: 'ELECTRONICS' })
    @IsNotEmpty()
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiProperty({ enum: ProductCondition, example: 'USED_LIKE_NEW' })
    @IsNotEmpty()
    @IsEnum(ProductCondition)
    condition: ProductCondition;

    @ApiProperty({ example: 'Jalingo, Taraba', required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ example: ['https://example.com/image1.jpg'], type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

export class UpdateProductDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(100)
    price?: number;

    @ApiProperty({ enum: ProductCategory, required: false })
    @IsOptional()
    @IsEnum(ProductCategory)
    category?: ProductCategory;

    @ApiProperty({ enum: ProductCondition, required: false })
    @IsOptional()
    @IsEnum(ProductCondition)
    condition?: ProductCondition;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

export class SearchProductsDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ enum: ProductCategory, required: false })
    @IsOptional()
    @IsEnum(ProductCategory)
    category?: ProductCategory;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    minPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    maxPrice?: number;

    @ApiProperty({ enum: ProductCondition, required: false })
    @IsOptional()
    @IsEnum(ProductCondition)
    condition?: ProductCondition;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;
}
