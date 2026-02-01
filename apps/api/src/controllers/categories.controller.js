// src/controllers/categories.controller.js
import { prisma } from '@lapancomido/database';

/**
 * Get all categories (public endpoint)
 */
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { category: 'asc' },
            select: {
                id: true,
                category: true,
            },
        });
        res.json(categories);
    } catch (err) {
        next(err);
    }
};

/**
 * Get all categories with product count (admin endpoint)
 */
const getAdminCategories = async (req, res, next) => {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { category: 'asc' },
            include: {
                _count: {
                    select: { categories_products: true },
                },
            },
        });
        
        const result = categories.map(c => ({
            id: c.id,
            category: c.category,
            productCount: c._count.categories_products,
            created_at: c.created_at,
            updated_at: c.updated_at,
        }));
        
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new category
 */
const createCategory = async (req, res, next) => {
    try {
        const { category } = req.body;
        
        if (!category || !category.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        // Check if category already exists
        const existing = await prisma.categories.findUnique({
            where: { category: category.trim() },
        });

        if (existing) {
            return res.status(409).json({ error: 'Esta categoría ya existe' });
        }

        const newCategory = await prisma.categories.create({
            data: { category: category.trim() },
        });

        res.status(201).json({
            id: newCategory.id,
            category: newCategory.category,
            productCount: 0,
            created_at: newCategory.created_at,
            updated_at: newCategory.updated_at,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update (rename) a category
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        const { category } = req.body;

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'ID de categoría inválido' });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        // Check if new name already exists (different category)
        const existing = await prisma.categories.findFirst({
            where: { 
                category: category.trim(),
                NOT: { id: categoryId },
            },
        });

        if (existing) {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre' });
        }

        const updated = await prisma.categories.update({
            where: { id: categoryId },
            data: { category: category.trim() },
            include: {
                _count: {
                    select: { categories_products: true },
                },
            },
        });

        res.json({
            id: updated.id,
            category: updated.category,
            productCount: updated._count.categories_products,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        next(err);
    }
};

/**
 * Delete a category
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'ID de categoría inválido' });
        }

        // Get product count before deleting
        const category = await prisma.categories.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { categories_products: true },
                },
            },
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Delete the category (cascades to categories_products junction)
        await prisma.categories.delete({
            where: { id: categoryId },
        });

        res.json({ 
            message: 'Categoría eliminada',
            id: categoryId,
            affectedProducts: category._count.categories_products,
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        next(err);
    }
};

export { 
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
