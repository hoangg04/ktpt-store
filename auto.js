

const login = async (body) => {
	const res = await fetch("https://e50d-116-96-110-215.ngrok-free.app/api/auth/login", {
		"headers": {
			"content-type": "application/json",
		},
		"body": JSON.stringify(body),
		"method": "POST"
	});

	const data = await res.json();
	return `${data.user.id},${res.headers.get("set-cookie").split(";")[0].split("=")[1]}`;
};
const addToCart = async ({ body, cookie }) => {
	const res = await fetch("https://e50d-116-96-110-215.ngrok-free.app/api/shop/cart/add", {
		"headers": {
			"content-type": "application/json",
			cookie,
		},
		"body": JSON.stringify(body),
		"method": "POST"
	});
}
const addAddress = async ({ body, cookie, result, user }) => {
	const res = await fetch("https://e50d-116-96-110-215.ngrok-free.app/api/shop/address/add", {
		"headers": {
			"content-type": "application/json",
			cookie,
		},
		"body": JSON.stringify(body),
		"method": "POST"
	});
	const data = await res.json();
	result.push(`${user},${data.data._id}`)
}
const fs = require('fs/promises');

(async () => {
	const race = [];
	const BATCH_SIZE = 20; // Batch size for handling requests concurrently

	// Simulate user login
	for (let i = 0; i < 99; i++) {
		race.push(
			login({ email: `test${i}@dev.com`, password: "anhanh" })
				.catch(err => {
					console.error(`Login failed for test${i}@dev.com:`, err);
					return null;
				})
		);
	}
	const processInBatches = async (tasks, batchSize) => {
		const users = []
		for (let i = 0; i < tasks.length; i += batchSize) {
			users.push(...await Promise.all(tasks.slice(i, i + batchSize)))
		}
		return users;
	};
	const users = await processInBatches(race, BATCH_SIZE)
	if (users.length === 0) {
		console.log("No users logged in successfully.");
		return;
	}
	console.log(users.length, "users logged in successfully.");
	if (users.length < 99) {
		console.log("Not all users logged in successfully.");
	}
	const result = [];
	const raceCart = [];
	const raceAddress = [];

	for (const userData of users) {
		const [userId, token] = userData.split(",");
		raceCart.push(
			addToCart({
				body: { userId, productId: "673724f150946a1adb0227be", quantity: 1 },
				cookie: `token=${token}`
			}).catch(err => console.error(`Failed to add to cart for user ${userId}:`, err))
		);

		raceAddress.push(
			addAddress({
				body: {
					userId,
					address: "abc",
					city: "abc",
					phone: "abc",
					pincode: "abc",
					notes: "abc"
				},
				cookie: `token=${token}`,
				result,
				user: userData,
			}).catch(err => console.error(`Failed to add address for user ${userId}:`, err))
		);
	}

	// Process in batches


	await processInBatches(raceCart, BATCH_SIZE);
	await processInBatches(raceAddress, BATCH_SIZE);

	// Write to CSV
	try {
		await fs.writeFile('users.csv', result.join("\n"), 'utf8');
		console.log("Users data saved to users.csv!");
	} catch (err) {
		console.error("Error saving users data to file:", err);
	}
})();
