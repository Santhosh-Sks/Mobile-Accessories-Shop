const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: "iPhone 14 Pro Silicone Case",
    description: "Premium silicone case designed specifically for iPhone 14 Pro. Provides excellent protection with precise cutouts.",
    price: 2499,
    category: "cases",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1574406582317-a080ec1e8fb5?w=300",
    stock: 50,
    featured: true,
    specifications: {
      compatibility: "iPhone 14 Pro",
      color: "Midnight Blue",
      material: "Silicone",
      warranty: "1 Year"
    }
  },
  {
    name: "Samsung 25W Fast Charger",
    description: "Official Samsung 25W Super Fast Charging adapter. Compatible with all Samsung Galaxy devices.",
    price: 1899,
    category: "chargers",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300",
    stock: 75,
    featured: true,
    specifications: {
      compatibility: "Samsung Galaxy Series",
      color: "White",
      material: "Plastic",
      warranty: "2 Years"
    }
  },
  {
    name: "Sony WH-1000XM4 Wireless Headphones",
    description: "Industry-leading noise cancellation with premium sound quality. 30-hour battery life.",
    price: 24990,
    category: "headphones",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    stock: 25,
    featured: true,
    specifications: {
      compatibility: "Universal",
      color: "Black",
      material: "Premium Plastic",
      warranty: "1 Year"
    }
  },
  {
    name: "Anker PowerCore 10000mAh Power Bank",
    description: "Compact and high-capacity power bank with fast charging technology. Perfect for travel.",
    price: 3499,
    category: "power-banks",
    brand: "Anker",
    image: "https://images.unsplash.com/photo-1609592424157-2b0566e50a91?w=300",
    stock: 100,
    featured: false,
    specifications: {
      compatibility: "Universal",
      color: "Black",
      material: "Aluminum",
      warranty: "18 Months"
    }
  },
  {
    name: "USB-C to Lightning Cable",
    description: "High-quality 1-meter USB-C to Lightning cable for fast charging and data transfer.",
    price: 899,
    category: "cables",
    brand: "Belkin",
    image: "https://images.unsplash.com/photo-1594736797933-d0a3ba4dbecf?w=300",
    stock: 200,
    featured: false,
    specifications: {
      compatibility: "iPhone, iPad",
      color: "White",
      material: "Braided Nylon",
      warranty: "2 Years"
    }
  },
  {
    name: "Tempered Glass Screen Protector",
    description: "9H hardness tempered glass screen protector with oleophobic coating.",
    price: 599,
    category: "screen-protectors",
    brand: "Nillkin",
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300",
    stock: 150,
    featured: false,
    specifications: {
      compatibility: "iPhone 14 Series",
      color: "Transparent",
      material: "Tempered Glass",
      warranty: "6 Months"
    }
  },
  {
    name: "JBL Charge 5 Portable Speaker",
    description: "Powerful portable Bluetooth speaker with IP67 waterproof rating. 20-hour playtime.",
    price: 12999,
    category: "speakers",
    brand: "JBL",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
    stock: 30,
    featured: true,
    specifications: {
      compatibility: "Bluetooth Devices",
      color: "Blue",
      material: "Fabric & Rubber",
      warranty: "1 Year"
    }
  },
  {
    name: "OnePlus Warp Charge 65W",
    description: "SuperVOOC fast charging adapter with 65W power delivery. Charges OnePlus devices in minutes.",
    price: 2799,
    category: "chargers",
    brand: "OnePlus",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300",
    stock: 60,
    featured: false,
    specifications: {
      compatibility: "OnePlus Devices",
      color: "Red",
      material: "Plastic",
      warranty: "1 Year"
    }
  }
];

// Sample admin user
const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@mobileaccessories.com",
  password: "admin123",
  role: "admin"
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-accessories-shop');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted');

    // Insert admin user
    const admin = new User(adminUser);
    await admin.save();
    console.log('Admin user created');

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin@mobileaccessories.com / admin123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
