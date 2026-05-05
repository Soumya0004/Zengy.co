import { dbConnect } from "./lib/mongodb.js";
import Order from "./lib/models/Order.js";
import User from "./lib/models/User.js";

async function checkOrders() {
  await dbConnect();

  const orders = await Order.find().limit(5).lean();
  console.log("Orders:", orders.map(o => ({ id: o._id, user: o.user, userType: typeof o.user })));

  const users = await User.find().limit(5).lean();
  console.log("Users:", users.map(u => ({ id: u._id, name: u.name, email: u.email })));

  process.exit(0);
}

checkOrders();