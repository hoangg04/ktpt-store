const redis = require("redis");
class ErrorResponse extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
	
}
class RedisErrorResponse extends ErrorResponse {
	constructor(message = "Connection redis error", status = -99) {
		super(message, status);
	}

}
class InitRedis {
	static client = null;
	constructor() {
		this.statusConnectRedis = {
			CONNECT: "connect",
			END: "end",
			RECONNECT: "reconnecting",
			ERROR: "error",
		};
		this.REDIS_CONNECT_TIMEOUT = 10000;
		this.REDIS_CONNECT_MESSAGE = {
			code: -99,
			message: {
				vn: "Kết nối redis thất bại",
				en: "Connect redis failed",
			},
		};
		this.connectionTimeout = null;
		this.connect();
	}
	handleTimeoutError() {
		this.connectionTimeout = setTimeout(() => {
			throw new RedisErrorResponse({
				code: this.REDIS_CONNECT_MESSAGE.code,
				message: this.REDIS_CONNECT_MESSAGE.message.en,
			});
		}, this.REDIS_CONNECT_TIMEOUT);
	}

	handleEventRedis(client) {
		client.on(this.statusConnectRedis.CONNECT, () => {
			console.log("Connect redis status: " + this.statusConnectRedis.CONNECT);
			clearTimeout(this.connectionTimeout);
		});
		client.on(this.statusConnectRedis.END, (e) => {
			console.log("Connect redis status: " + this.statusConnectRedis.END);
			this.handleTimeoutError();
		});
		client.on(this.statusConnectRedis.RECONNECT, () => {
			console.log("Connect redis status: " + this.statusConnectRedis.RECONNECT);
			clearTimeout(this.connectionTimeout);
		});
		client.on(this.statusConnectRedis.ERROR, () => {
			console.log("Connect redis status: " + this.statusConnectRedis.ERROR);
			this.handleTimeoutError();
		});
	}
	async connect() {
		if (!this.client) {
			const host =
				process.env.NODE_ENV !== "dev" ? process.env.LOCALHOST_PRO : process.env.LOCALHOST_DEV;
			const options = {
				socket: {
					host,
					port: "6379",
				},
			};
			if (process.env.NODE_ENV !== "dev") {
				options.password = process.env.REDIS_PASSWORD;
			}
			InitRedis.client = redis.createClient(options);
			InitRedis.client.connect();
			this.handleEventRedis(InitRedis.client);
		}
	}
	getRedis() {
		return InitRedis.client;
	}
	async closeRedis() {
		if (InitRedis.client) {
			await this.client.disconnect();
			console.log("Redis client disconnected successfully");
		}
	}
}

module.exports = new InitRedis();
