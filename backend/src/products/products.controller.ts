import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, SearchProductsDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product listing (sellers only)' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(@Request() req, @Body() dto: CreateProductDto) {
        return this.productsService.create(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with filters' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
    async findAll(@Query() dto: SearchProductsDto) {
        return this.productsService.findAll(dto);
    }

    @Get('my-products')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my product listings' })
    @ApiResponse({ status: 200, description: 'My products retrieved' })
    async getMyProducts(@Request() req) {
        return this.productsService.getMyProducts(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, req.user.id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async remove(@Request() req, @Param('id') id: string) {
        return this.productsService.remove(id, req.user.id);
    }
}
