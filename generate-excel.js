const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// 1. Products Sample Data
const productsData = [
  {
    name: 'Dolo 650 Tablet 15s',
    shortName: 'Dolo 650',
    brand: 'Micro Labs',
    categoryId: 'cat-prescription',
    productType: 'Medicine',
    price: 30.50,
    oldPrice: 35.00,
    stock: 250,
    reorderLevel: 25,
    sku: 'DOLO-650-01',
    note: 'Strip of 15 Tablets',
    badge: 'BESTSELLER',
    dosageForm: 'Tablet',
    composition: 'Paracetamol 650mg',
    manufacturer: 'Micro Labs Ltd',
    storageCondition: 'Room Temperature',
    shortDescription: 'Effective relief from fever and body pain',
    fullDescription: 'Dolo 650 Tablet contains Paracetamol 650mg for fast relief from high fever, headache, and body aches.',
    thumbnail: 'https://example.com/dolo.jpg',
    status: 'active'
  },
  {
    name: 'Ashwagandha Extract 500mg 60 Capsules',
    shortName: 'Ashwagandha 500mg',
    brand: 'Dabur',
    categoryId: 'cat-ayurveda',
    productType: 'Ayurveda',
    price: 180.00,
    oldPrice: 220.00,
    stock: 120,
    reorderLevel: 15,
    sku: 'DAB-ASH-60',
    note: 'Bottle of 60 Capsules',
    badge: '',
    dosageForm: 'Capsule',
    composition: 'Ashwagandha Extract 500mg',
    manufacturer: 'Dabur India Ltd',
    storageCondition: 'Room Temperature',
    shortDescription: 'Pure herbal extract for stress relief and energy',
    fullDescription: 'Helps boost immunity, reduces stress and fatigue, and enhances overall vitality.',
    thumbnail: 'https://example.com/ashwagandha.jpg',
    status: 'active'
  },
  {
    name: 'Vitamin C 1000mg + Zinc 60 Tablets',
    shortName: 'Vitamin C 1000',
    brand: 'HealthKart',
    categoryId: 'cat-vitamins',
    productType: 'Vitamins & Supplements',
    price: 399.00,
    oldPrice: 599.00,
    stock: 300,
    reorderLevel: 30,
    sku: 'HK-VITC-60',
    note: '60 Chewable Tablets',
    badge: '15% OFF',
    dosageForm: 'Tablet',
    composition: 'Ascorbic Acid 1000mg + Zinc 10mg',
    manufacturer: 'HealthKart Wellness',
    storageCondition: 'Protect from Light',
    shortDescription: 'Immunity booster with antioxidant protection',
    fullDescription: 'Daily Vitamin C and Zinc supplement for radiant skin, immunity support, and cellular protection.',
    thumbnail: '',
    status: 'active'
  },
  {
    name: 'Advanced Blood Glucose Monitor Kit',
    shortName: 'Glucose Monitor',
    brand: 'Dr. Morepen',
    categoryId: 'cat-healthcare',
    productType: 'Healthcare Device',
    price: 850.00,
    oldPrice: 1200.00,
    stock: 45,
    reorderLevel: 10,
    sku: 'DM-BG-03',
    note: 'Kit with 50 Test Strips',
    badge: 'BESTSELLER',
    dosageForm: 'Other',
    composition: 'Digital Device',
    manufacturer: 'Dr. Morepen Labs',
    storageCondition: 'Room Temperature',
    shortDescription: 'Accurate blood sugar monitoring at home in 5 seconds',
    fullDescription: 'Includes digital meter, 50 strips, lancing device, lancets, and protective travel case.',
    thumbnail: '',
    status: 'active'
  },
  {
    name: 'Liv 52 DS Syrup 200ml',
    shortName: 'Liv 52 DS',
    brand: 'Himalaya',
    categoryId: 'cat-ayurveda',
    productType: 'Ayurveda',
    price: 175.00,
    oldPrice: 195.00,
    stock: 80,
    reorderLevel: 20,
    sku: 'HIM-LIV52-200',
    note: '200ml Bottle',
    badge: '',
    dosageForm: 'Syrup',
    composition: 'Herbal Liver Formulation',
    manufacturer: 'Himalaya Wellness',
    storageCondition: 'Room Temperature',
    shortDescription: 'Ayurvedic liver care syrup for improved appetite and liver protection',
    fullDescription: 'Double strength formulation to protect liver against hepatotoxins and improve metabolic health.',
    thumbnail: '',
    status: 'active'
  }
];

// 2. Categories Sheet Data
const categoriesData = [
  { 'Category ID': 'cat-prescription', 'Category Name': 'Prescription Meds', 'Description': 'All prescription tablets, capsules & injections' },
  { 'Category ID': 'cat-vitamins', 'Category Name': 'Vitamins & Supplements', 'Description': 'Multivitamins, Vitamin C, D3, Calcium & Minerals' },
  { 'Category ID': 'cat-ayurveda', 'Category Name': 'Ayurveda', 'Description': 'Herbal medicines, syrups, churna & ayurvedic supplements' },
  { 'Category ID': 'cat-homeopathy', 'Category Name': 'Homeopathy', 'Description': 'Homeopathic drops, dilutions & globes' },
  { 'Category ID': 'cat-healthcare', 'Category Name': 'Healthcare Devices', 'Description': 'BP monitors, Glucometers, Thermometers, Oximeters' },
  { 'Category ID': 'cat-diabetes', 'Category Name': 'Diabetes Care', 'Description': 'Diabetes medicines, sugar-free foods, testing strips' },
  { 'Category ID': 'cat-skin-care', 'Category Name': 'Skin Care', 'Description': 'Medicated lotions, creams, sunscreens & face washes' },
  { 'Category ID': 'cat-winter-care', 'Category Name': 'Winter Care', 'Description': 'Cold & cough syrups, balms, moisturizers' },
  { 'Category ID': 'cat-sexual-wellness', 'Category Name': 'Sexual Wellness', 'Description': 'Wellness supplements & protection' },
  { 'Category ID': 'cat-elderly-care', 'Category Name': 'Elderly Care', 'Description': 'Adult diapers, walking aids, joint care' },
  { 'Category ID': 'cat-supplements', 'Category Name': 'Supplements & Fitness', 'Description': 'Protein powders, amino acids, gym nutrition' },
  { 'Category ID': 'cat-health-food', 'Category Name': 'Health Food & Drinks', 'Description': 'Health drinks, green tea, herbal juices' },
];

// 3. Brands Sheet Data
const brandsData = [
  { 'Brand Name': 'Himalaya', 'Type': 'Ayurveda & Wellness' },
  { 'Brand Name': 'Dabur', 'Type': 'Ayurveda & Healthcare' },
  { 'Brand Name': 'Dr. Morepen', 'Type': 'Medical Devices & Diagnostics' },
  { 'Brand Name': 'HealthKart', 'Type': 'Vitamins & Nutrition' },
  { 'Brand Name': 'Mamaearth', 'Type': 'Personal & Baby Care' },
  { 'Brand Name': 'Horlicks', 'Type': 'Nutrition & Health Food' },
  { 'Brand Name': 'Bournvita', 'Type': 'Health Drinks' },
  { 'Brand Name': 'JIVA', 'Type': 'Ayurvedic Remedies' },
  { 'Brand Name': 'Cipla', 'Type': 'Pharmaceuticals' },
  { 'Brand Name': 'Sun Pharma', 'Type': 'Pharmaceuticals' },
  { 'Brand Name': 'Micro Labs', 'Type': 'Pharmaceuticals' },
  { 'Brand Name': 'Abbott', 'Type': 'Healthcare & Nutrition' },
  { 'Brand Name': 'Zydus', 'Type': 'Pharmaceuticals' },
  { 'Brand Name': 'Mankind', 'Type': 'Pharmaceuticals' }
];

// 4. Health Concerns Reference Data
const healthConcernsData = [
  { 'Health Concern ID': 'hc-1', 'Concern Name': 'Diabetes care' },
  { 'Health Concern ID': 'hc-2', 'Concern Name': 'Cardiac care / Heart' },
  { 'Health Concern ID': 'hc-3', 'Concern Name': 'Pain relief & Joint care' },
  { 'Health Concern ID': 'hc-4', 'Concern Name': 'Kidney care' },
  { 'Health Concern ID': 'hc-5', 'Concern Name': 'Muscle care & Fitness' },
  { 'Health Concern ID': 'hc-6', 'Concern Name': 'Liver care' },
  { 'Health Concern ID': 'hc-7', 'Concern Name': 'Respiratory care / Cold & Cough' },
  { 'Health Concern ID': 'hc-8', 'Concern Name': 'Eye care' },
  { 'Health Concern ID': 'hc-9', 'Concern Name': 'Mental Wellness & Stress relief' }
];

// 5. Allowed Values Dropdown Data
const allowedValuesData = [
  {
    'Allowed Product Types': 'Medicine',
    'Allowed Dosage Forms': 'Tablet',
    'Allowed Storage Conditions': 'Room Temperature'
  },
  {
    'Allowed Product Types': 'OTC Medicine',
    'Allowed Dosage Forms': 'Capsule',
    'Allowed Storage Conditions': 'Refrigerated'
  },
  {
    'Allowed Product Types': 'Vitamins & Supplements',
    'Allowed Dosage Forms': 'Syrup',
    'Allowed Storage Conditions': 'Frozen'
  },
  {
    'Allowed Product Types': 'Ayurveda',
    'Allowed Dosage Forms': 'Suspension',
    'Allowed Storage Conditions': 'Protect from Light'
  },
  {
    'Allowed Product Types': 'Homeopathy',
    'Allowed Dosage Forms': 'Injection',
    'Allowed Storage Conditions': 'Protect from Moisture'
  },
  {
    'Allowed Product Types': 'Healthcare Device',
    'Allowed Dosage Forms': 'Drops',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Personal Care',
    'Allowed Dosage Forms': 'Eye Drops',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Skin Care',
    'Allowed Dosage Forms': 'Cream / Ointment / Gel',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Hair Care',
    'Allowed Dosage Forms': 'Lotion / Oil',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Sexual Wellness',
    'Allowed Dosage Forms': 'Powder / Sachet',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Diabetes Care',
    'Allowed Dosage Forms': 'Spray / Inhaler',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Elderly Care',
    'Allowed Dosage Forms': 'Mouthwash / Solution',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Baby Care',
    'Allowed Dosage Forms': 'Soap / Shampoo',
    'Allowed Storage Conditions': ''
  },
  {
    'Allowed Product Types': 'Health Food',
    'Allowed Dosage Forms': 'Granules / Other',
    'Allowed Storage Conditions': ''
  },
];

// Create Workbook
const wb = XLSX.utils.book_new();

// Add Sheets
const wsProducts = XLSX.utils.json_to_sheet(productsData);
const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
const wsBrands = XLSX.utils.json_to_sheet(brandsData);
const wsHealthConcerns = XLSX.utils.json_to_sheet(healthConcernsData);
const wsAllowedValues = XLSX.utils.json_to_sheet(allowedValuesData);

// Set column widths
wsProducts['!cols'] = [
  { wch: 30 }, // name
  { wch: 20 }, // shortName
  { wch: 15 }, // brand
  { wch: 18 }, // categoryId
  { wch: 22 }, // productType
  { wch: 10 }, // price
  { wch: 10 }, // oldPrice
  { wch: 8 },  // stock
  { wch: 12 }, // reorderLevel
  { wch: 15 }, // sku
  { wch: 22 }, // note
  { wch: 14 }, // badge
  { wch: 12 }, // dosageForm
  { wch: 28 }, // composition
  { wch: 22 }, // manufacturer
  { wch: 20 }, // storageCondition
  { wch: 45 }, // shortDescription
  { wch: 60 }, // fullDescription
  { wch: 30 }, // thumbnail
  { wch: 10 }  // status
];

wsCategories['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 55 }];
wsBrands['!cols'] = [{ wch: 20 }, { wch: 35 }];
wsHealthConcerns['!cols'] = [{ wch: 20 }, { wch: 35 }];
wsAllowedValues['!cols'] = [{ wch: 26 }, { wch: 26 }, { wch: 28 }];

XLSX.utils.book_append_sheet(wb, wsProducts, 'Products_Template');
XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories_List');
XLSX.utils.book_append_sheet(wb, wsBrands, 'Brands_List');
XLSX.utils.book_append_sheet(wb, wsHealthConcerns, 'Health_Concerns');
XLSX.utils.book_append_sheet(wb, wsAllowedValues, 'Allowed_Values');

// Write file in root and public directory
const rootPath = path.join(__dirname, 'product-import-master-template.xlsx');
const publicPath = path.join(__dirname, 'public', 'product-import-master-template.xlsx');

XLSX.writeFile(wb, rootPath);
XLSX.writeFile(wb, publicPath);

console.log('Master Excel File Created Successfully at:', rootPath);
