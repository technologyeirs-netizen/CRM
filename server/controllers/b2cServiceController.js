const Service = require('../models/WebsiteService');

exports.getServices = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const services = await Service.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.description || data.price === undefined) {
      return res.status(400).json({ success: false, message: 'name, description and price are required' });
    }
    const service = await Service.create({
      name: data.name,
      description: data.description,
      price: Number(data.price) || 0,
      availableDates: Array.isArray(data.availableDates) ? data.availableDates : [],
      image: data.image || null,
      features: Array.isArray(data.features) ? data.features : [],
    });
    res.status(201).json({ success: true, message: 'Service created successfully', service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A service with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const data = req.body;
    const update = {
      name: data.name,
      description: data.description,
      price: data.price !== undefined ? Number(data.price) || 0 : undefined,
      availableDates: data.availableDates,
      image: data.image,
      features: data.features,
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
