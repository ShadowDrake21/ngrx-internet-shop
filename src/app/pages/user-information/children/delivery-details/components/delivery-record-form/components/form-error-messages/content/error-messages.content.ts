export const deliveryRecordFormErrorMessages = {
  name: {
    required: 'Name field is mandatory',
    length: 'Name must be at least 3 and maximum 40 characters long',
  },
  phone: {
    required: 'Phone field is mandatory',
    pattern: 'Phone number is not valid',
  },
  address: {
    country: {
      required: 'Country field is mandatory',
    },
    code: {
      pattern: 'Incorrect country code',
    },
    city: {
      required: 'City field is mandatory',
    },
    line1: {
      required: 'Address line 1 field is mandatory',
    },
    line2: {
      required: 'Address line 2 field is mandatory',
    },
    postalCode: {
      required: 'Postal code field is mandatory',
    },
  },
};
