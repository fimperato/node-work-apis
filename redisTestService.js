import redis from "redis";

//const redisclient = redis.createClient();
const redisclient = redis.createClient(
			{
        "host": "",
        "port": 0,
        "password": "",
				"username": "default"
      });

(async () => {
	await redisclient.connect();
})();

console.log("Connecting to the Redis");

redisclient.on("ready", () => {
	console.log("Connected!");
});

redisclient.on("error", (err) => {
	console.log("Error in the Connection " + err);
});

app.all('/testRedisAllParts',
  (req, res) => {
    console.log('testRedisAllParts ..');
    var all_parts = {};

    redisclient.keys("*", function(err, keys) {
      var count = keys.length;
      keys.forEach( function(key) {
        redisclient.hgetall(key, function(err, obj) {
          all_parts[key] = obj;
          --count;
          if (count <= 0) {
            console.log('retrieved key  ' + key);
            console.log('retrieved part ' + all_parts);
          } else {
            console.log('waiting');
          }
        });
      });
    });
    console.log('testRedisAllParts end ' + all_parts);
});


app.all('/searchRedisKeys',
  (req, res) => {
    console.log('searchRedisKeys ..');
    (async () => {
        const pingCommandResult = await redisclient.ping();
        console.log("Check Redis call response: ", pingCommandResult);
        const kdata = await redisclient.keys("*");
        console.log("First key result: ", kdata[0]);
        const firstKeyRes = kdata[0];
        const firstData = await redisclient.get(firstKeyRes);
        console.log("Get firstKeyRes data: ", firstData);
        const listData = await redisclient.lrange(firstKeyRes, 0, -1);
        console.log("Get firstKeyRes list data: ", listData);
        const hsData = await redisclient.hgetall(firstKeyRes);
        console.log("Get firstKeyRes hash stored data: ", hsData);
    })();
})
