import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Collections";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "30");
    
    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);

    // Overview stats
    const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Product.countDocuments(),
    ]);

    const overview = {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      averageOrderValue: totalOrders > 0 
        ? (totalRevenue[0]?.total || 0) / totalOrders 
        : 0,
      conversionRate: 3.2, // Placeholder - would need visitor tracking
    };

    // Revenue by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedRevenue = revenueByMonth.map((r) => ({
      month: monthNames[parseInt(r._id?.split("-")[1] || "1") - 1] + " " + r._id?.split("-")[0],
      revenue: r.revenue || 0,
      orders: r.orders || 0,
    }));

    // Top products
    const topProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const topProductIds = topProductsAgg.map((p) => p._id).filter(Boolean);
    const topProductsData = await Product.find({ _id: { $in: topProductIds } }).lean();

    const topProducts = topProductsAgg.map((agg) => {
      const product = topProductsData.find(
        (p) => p._id?.toString() === agg._id?.toString()
      );
      return {
        product: product || { _id: agg._id, title: "Unknown Product" },
        totalSold: agg.totalSold,
        revenue: agg.revenue,
      };
    });

    // Top categories
    const topCategoriesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "collections",
          localField: "products.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $group: {
          _id: "$productData.category",
          revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const topCategories = topCategoriesAgg.map((c) => ({
      category: c._id || "Uncategorized",
      revenue: c.revenue || 0,
      orders: c.orders || 0,
    }));

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    const statusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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

    // Recent activity
    const recentOrders = await Order.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = recentOrders.map((order) => ({
      type: "order",
      description: `New order #${order._id?.toString().slice(-6)} from ${order.user?.name || "Unknown"} - $${order.totalPrice}`,
      timestamp: order.createdAt,
    }));

    // User stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const [newUsersThisMonth, returningUsersAgg] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$email" } },
        { $count: "total" },
      ]),
    ]);

    const userStats = {
      newUsersThisMonth,
      returningUsers: returningUsersAgg[0]?.total || 0,
      userGrowth: 12, // Placeholder calculation
    };

    return NextResponse.json({
      overview,
      revenueByMonth: formattedRevenue,
      topProducts,
      topCategories,
      ordersByStatus,
      recentActivity,
      userStats,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}