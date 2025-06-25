import * as Yup from 'yup';

export const propertyValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Property title is required')
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: Yup.string()
    .required('Description is required')
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must not exceed 1000 characters'),

  location: Yup.object().shape({
    address: Yup.string().required('Address is required').trim(),
    city: Yup.string().required('City is required').trim(),
    state: Yup.string().required('State is required').trim(),
    country: Yup.string().required('Country is required').trim()
  }),

  price: Yup.number()
    .required('Price is required')
    .typeError('Price must be a number')
    .positive('Price cannot be negative')
    .min(1, 'Price must be at least 1')
    .max(100000, 'Price must not exceed 10,0000'),

  images: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string().required('Image URL is required'),
        public_id: Yup.string()
      })
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),

  amenities: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one amenity is required'),

  propertyType: Yup.string()
    .required('Property type is required')
    .oneOf(
      ['apartment', 'house', 'villa', 'cottage', 'other'],
      'Invalid property type'
    ),

  bedrooms: Yup.number()
    .required('Number of bedrooms is required')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Too many bedrooms'),

  bathrooms: Yup.number()
    .required('Number of bathrooms is required')
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Too many bathrooms'),

  maxGuests: Yup.number()
    .required('Maximum number of guests is required')
    .min(1, 'Must accommodate at least 1 guest')
    .max(50, 'Too many guests'),

  rules: Yup.array().of(Yup.string()),

  cancellationPolicy: Yup.string()
    .oneOf(['flexible', 'moderate', 'strict'], 'Invalid cancellation policy')
    .default('moderate'),

  availability: Yup.boolean().default(true),
});