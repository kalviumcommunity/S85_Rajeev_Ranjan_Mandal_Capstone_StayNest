import * as Yup from 'yup';

export const propertyValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Property title is required')
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: Yup.string()
    .required('Description is required')
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),

  location: Yup.object().shape({
    address: Yup.string()
      .required('Address is required')
      .trim()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must not exceed 200 characters'),
    city: Yup.string()
      .required('City is required')
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must not exceed 50 characters'),
    state: Yup.string()
      .required('State is required')
      .trim()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State must not exceed 50 characters'),
    country: Yup.string()
      .required('Country is required')
      .trim()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country must not exceed 50 characters')
  }),

  price: Yup.number()
    .required('Please enter the property price')
    .typeError('Price must be a valid number')
    .positive('Price cannot be negative')
    .min(1, 'Minimum price is 1 rs.')
    .max(100000, 'Maximum price is 100000 rs.'),

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