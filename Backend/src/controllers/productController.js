const Product = require('../models/Product');

exports.getProducts = async (req, res, next) => {
  try {
    const { search, brand, category, rimSize, minPrice, maxPrice, inStock, sort } = req.query;

    let query = { active: true };

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { size: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (rimSize) {
      query.rimSize = rimSize;
    }
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.b2bPrice = {};
      if (minPrice) query.b2bPrice.$gte = Number(minPrice);
      if (maxPrice) query.b2bPrice.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { b2bPrice: 1 };
    else if (sort === 'price-desc') sortOption = { b2bPrice: -1 };
    else if (sort === 'name-asc') sortOption = { model: 1 };

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const availableBrands = await Product.distinct('brand', { active: true });
    const availableCategories = await Product.distinct('category', { active: true });

    res.status(200).json({
      status: 'success',
      message: 'Products retrieved successfully.',
      data: {
        products,
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        availableBrands,
        availableCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.active) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or currently unavailable.',
        data: null
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product details retrieved successfully.',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};
