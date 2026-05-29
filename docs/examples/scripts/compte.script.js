export default async function main(ctx) {
  const userId = ctx.input.userId;
  if (!userId) {
    throw new Error('userId is required');
  }

  const user = await ctx.collections.users.findById(userId);
  const orders = await ctx.collections.orders.find({ userId });
  const messages = await ctx.collections.messages.find({ userId });
  const notifications = await ctx.collections.notifications.find({ userId, read: false });

  return {
    user,
    stats: {
      ordersCount: orders.length,
      unreadMessages: messages.length,
      unreadNotifications: notifications.length,
    },
    recentOrders: orders.slice(0, 5),
    notifications,
  };
}
