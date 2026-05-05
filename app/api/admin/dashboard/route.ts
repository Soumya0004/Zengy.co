import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Collections";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Get totals
    const [productCount, orderCount, userCount] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    // Get total revenue
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get top products (by order count)
    const topProductsAgg = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const topProductIds = topProductsAgg.map((p) => p._id);
    const topProducts = await Product.find({ _id: { $in: topProductIds } }).lean();

    // Map the aggregated data to products
    const topProductsWithCount = topProductsAgg.map((agg) => {
      const product = topProducts.find(
        (p) => p._id.toString() === agg._id?.toString()
      );
      return {
        ...product,
        totalSold: agg.totalSold,
      };
    });

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    statusCounts.forEach((s) => {
      ordersByStatus[s._id || "Unknown"] = s.count;
    });

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedRevenue = revenueByMonth.map((r) => ({
      month: monthNames[parseInt(r._id?.split("-")[1] || "1") - 1] + " " + r._id?.split("-")[0],
      revenue: r.revenue || 0,
    }));

    return NextResponse.json({
      totalProducts: productCount,
      totalOrders: orderCount,
      totalUsers: userCount,
      totalRevenue,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        user: o.user,
      })),
      topProducts: topProductsWithCount,
      ordersByStatus,
      revenueByMonth: formattedRevenue,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}