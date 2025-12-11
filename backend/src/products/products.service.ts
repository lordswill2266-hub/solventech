import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, SearchProductsDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private prisma: PrismaService) { }

    async create(sellerId: string, dto: CreateProductDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: sellerId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== 'SELLER') {
            throw new ForbiddenException('Only sellers can create product listings');
        }

        if (!user.isBvnVerified) {
            throw new BadRequestException('Please complete BVN verification to list products');
        }

        const product = await this.prisma.product.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                category: dto.category,
                condition: dto.condition,
                location: dto.location || 'Nigeria',
                images: dto.images || [],
                sellerId,
                isActive: true,
            },
        });

        this.logger.log(`Product created: ${product.id} by seller ${sellerId}`);

        return {
            success: true,
            product: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: Number(product.price),
                category: product.category,
                condition: product.condition,
                location: product.location,
                images: product.images,

                isActive: product.isActive,
                createdAt: product.createdAt,
            },
        };
    }

    async findAll(dto: SearchProductsDto) {
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
        };

        if (dto.search) {
            where.OR = [
                { title: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        if (dto.category) where.category = dto.category;

        if (dto.condition) where.condition = dto.condition;

        if (dto.location) where.location = { contains: dto.location, mode: 'insensitive' };

        if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
            where.price = {};
            if (dto.minPrice !== undefined) where.price.gte = dto.minPrice;
            if (dto.maxPrice !== undefined) where.price.lte = dto.maxPrice;
        }

        const total = await this.prisma.product.count({ where });

        const products = await this.prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                        isBvnVerified: true,
                    },
                },
            },
        });

        return {
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            products: products.map((p) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                price: Number(p.price),
                category: p.category,
                condition: p.condition,
                location: p.location,
                images: p.images,
                isActive: p.isActive,
                seller: p.seller,
                createdAt: p.createdAt,
            })),
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                        isBvnVerified: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return {
            success: true,
            product: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: Number(product.price),
                category: product.category,
                condition: product.condition,
                location: product.location,
                images: product.images,
                isActive: product.isActive,
                seller: product.seller,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            },
        };
    }

    async getMyProducts(sellerId: string) {
        const products = await this.prisma.product.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            count: products.length,
            products: products.map((p) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                price: Number(p.price),
                category: p.category,
                condition: p.condition,
                location: p.location,
                images: p.images,
                isActive: p.isActive,
                createdAt: p.createdAt,
            })),
        };
    }

    async update(id: string, sellerId: string, dto: UpdateProductDto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.sellerId !== sellerId) {
            throw new ForbiddenException('You can only update your own products');
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: dto,
        });

        this.logger.log(`Product updated: ${id} by seller ${sellerId}`);

        return {
            success: true,
            product: {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                price: Number(updated.price),
                category: updated.category,
                condition: updated.condition,
                location: updated.location,
                images: updated.images,
                isActive: updated.isActive,
                updatedAt: updated.updatedAt,
            },
        };
    }

    async remove(id: string, sellerId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.sellerId !== sellerId) {
            throw new ForbiddenException('You can only delete your own products');
        }

        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Product deleted: ${id} by seller ${sellerId}`);

        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }
}
