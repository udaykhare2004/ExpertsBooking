const Expert = require('../models/Expert');

exports.getExperts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; 
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const experts = await Expert.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Expert.countDocuments(query);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching experts',
      error: error.message
    });
  }
};

exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }

    res.json({
      success: true,
      data: expert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expert',
      error: error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Expert.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};