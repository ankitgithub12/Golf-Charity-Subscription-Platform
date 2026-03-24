const Joi = require('joi');

/**
 * Middleware factory — validates req.body against a Joi schema
 * Returns 400 with validation details on failure
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message.replace(/["]/g, ''));
    return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
  }
  next();
};

// ─── Schemas ────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const scoreSchema = Joi.object({
  value: Joi.number().integer().min(1).max(45).required(),
  datePlayed: Joi.date().iso().required(),
  notes: Joi.string().max(200).allow('').optional(),
});

const charitySchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().min(10).max(2000).required(),
  shortDescription: Joi.string().max(300).allow('').optional(),
  website: Joi.string().uri().allow('').optional(),
  category: Joi.string()
    .valid('health', 'education', 'environment', 'sports', 'community', 'other')
    .optional(),
  featured: Joi.boolean().optional(),
  registrationNumber: Joi.string().allow('').optional(),
});

const charitySelectSchema = Joi.object({
  charityId: Joi.string().required(),
  charityContributionPct: Joi.number().integer().min(10).max(100).optional(),
});

const drawGenerateSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required(),
  drawType: Joi.string().valid('random', 'algorithm').optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  scoreSchema,
  charitySchema,
  charitySelectSchema,
  drawGenerateSchema,
};
