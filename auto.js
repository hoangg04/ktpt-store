var fs = require('fs');


const login = async (body) => {
	const res = await fetch("http://localhost:5000/api/auth/login", {
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
	const res = await fetch("http://localhost:5000/api/shop/cart/add", {
		"headers": {
			"content-type": "application/json",
			cookie,
		},
		"body": JSON.stringify(body),
		"method": "POST"
	});
}
const addAddress = async ({ body, cookie }) => {
	const res = await fetch("http://localhost:5000/api/shop/address/add", {
		"headers": {
			"content-type": "application/json",
			cookie,
		},
		"body": JSON.stringify(body),
		"method": "POST"
	});
}
(async () => {
	const race = []
	for (let i = 0; i < 99; i++) {
		race.push(login({
			"email": `test${i}@dev.com`, password: "anhanh"
		}))
	};
	const users = await Promise.all(race)
	const raceCart = []
	const raceAddress = []
	if (users.length > 0) {
		for (let i of users) {
			let user = i.split(",")
			raceCart.push(addToCart({ body: { userId: user[0], "productId": "6714f1d1b1269137d1f768bb", "quantity": 1 }, cookie: `token=${user[1]}` }))
			raceAddress.push(addAddress({ body: { userId: user[0], address: "abc", city: "abc", phone: "abc", pincode: "abc", notes: "abc" }, cookie: `token=${user[1]}` }))
		}
		await Promise.all([...raceCart, ...raceAddress])
	}
	fs.writeFile('users.csv', users.join("\n"), 'utf8', function (err) {
		if (err) {
			console.log('Some error occured - file either not saved or corrupted file saved.');
		} else {
			console.log('It\'s saved!');
		}
	});
})()
