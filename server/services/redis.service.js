const { getRedis } = require("../helpers/init.redis");
const Product = require("../models/Product");

class RedisService {
	constructor() {
		this.client = getRedis();
	}
	async set(key, value, expires) {
		return await this.client.set(key, JSON.stringify(value), { EX: expires });
	}
	async setnx(key, value, expires = null) {
		if (expires) {
			return await this.client.set(key, JSON.stringify(value), { EX: expires, NX: true });
		}
		return await this.client.set(key, JSON.stringify(value), { NX: true });
	}
	async get(key) {
		const value = await this.client.get(key);
		if (value) return JSON.parse(value);
		return null;
	}
	async releaseKey(key) {
		console.log("Release key", key);
		await this.client.del(key);
	}
	async releaseManyKeys(keys) {
		await this.client.del(keys);
	}
	async acquireLock({ productId, quantity }) {
		const key = `lock_v2024_${productId}`;
		const retryCount = 10;
		const retryDelay = 50;
		const expireTime = 3000;
		for (let i = 0; i < retryCount; i++) {

			const result = await this.setnx(key, quantity);
			const totalStock = await this.client.get(`stock${productId}`);
			if (quantity > +totalStock) {
				return null;
			}
			console.log("result", result);

			if (result) {
				const { modifiedCount } = await Product.updateOne({ _id: productId }, {
					$inc: { totalStock: -quantity },
				});
				console.log("modifiedCount", modifiedCount);
				if (modifiedCount) {
					await this.client.pExpire(key, expireTime);
					await this.client.set(`stock${productId}`, +totalStock - quantity);
					return key;
				}
				return null;
			} else {
				await new Promise((resolve, reject) =>
					setTimeout(() => {
						resolve();
					}, retryDelay),
				);
			}
		}
	}
	async exists(key) {
		return await this.client.exists(key);
	}
	async delAllKeyWithPattern(pattern) {
		const keys = await this.client.keys(pattern);
		if (keys.length) {
			return await this.client.del(keys);
		}
		return 0;
	}
	async incrBy(key, quantity) {
		return await this.client.incrBy(key, quantity);
	}
	async incr(key) {
		return await this.client.incr(key);
	}
}

module.exports = RedisService;
