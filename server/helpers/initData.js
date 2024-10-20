const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
const Feature = require("../models/Feature");
async function generateUsers(num) {
	const users = [];
	const iterable = [0, ...Array(num - 1).fill(1)];
	let index = 0;
	for await (let i of iterable) {
		const user = {
			userName: "user" + Math.random().toString(36).substring(7),
			email: `${i === 0 ? "admin" : `test${index++}`}@dev.com`,
			password: await bcrypt.hash("anhanh", 12),
			role: i === 0 ? "admin" : "user",
		};
		users.push(user);
	}
	return users;
}
async function generateProducts(num) {
	const products = [];
	const categories = ["men","women","kids","accessories","footwear"]
	const brands = ["nike", "adidas", "puma", "levi", "zara", "h&m"]
	for (let i = 0; i < num; i++) {
		let price = Math.floor(Math.random() * 1000)
		const product = {
			image: "https://picsum.photos/400/600",
			title: "Product " + i,
			description: "This is a description for product " + i,
			category: categories[Math.floor(Math.random() * categories.length)],
			brand: brands[Math.floor(Math.random() * categories.length)],
			price,
			salePrice: price - Math.floor(Math.random() * 100) - 20,
			totalStock: Math.floor(Math.random() * 100),
			averageReview: Math.floor(Math.random() * 5),
		};
		products.push(product);
	}
	return products;
}


async function seedDatabase() {
	const users = await generateUsers(100);
	const products = await generateProducts(100);
	const featureImages = [{ image: "http://res.cloudinary.com/drhpxgfnn/image/upload/v1729425073/ies59xgfnasjdljwg3bw.jpg" }, { image: "http://res.cloudinary.com/drhpxgfnn/image/upload/v1729425171/a5btdlpuo490p0fvhddp.jpg" }]
	try {
		const checkExistsUser = await User.find();
		const checkExistsProduct = await Product.find();
		const checkExistsFeature = await Feature.find();
		if (checkExistsUser.length == 0) {
			await User.insertMany(users);
			console.log('100 users have been added to the database.');
		}
		if (checkExistsProduct == 0) {
			await Product.insertMany(products);
			console.log('100 products have been added to the database.');
		}
		if (checkExistsFeature == 0) {
			await Feature.insertMany(featureImages);
			console.log('100 features have been added to the database.');
		}
	} catch (error) {
		console.error('Error inserting users:', error.message);
	}
}


module.exports = {
	seedDatabase
}