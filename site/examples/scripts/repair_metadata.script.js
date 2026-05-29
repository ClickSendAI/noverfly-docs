export default async function main(ctx) {
  const pending = await ctx.collections.media_assets.find({ status: 'pending' });

  for (const media of pending.slice(0, 20)) {
    const meta = await ctx.media.process(media);
    await ctx.collections.media_assets.update(media.id, {
      ...meta,
      status: 'ready',
    });
  }

  return { repaired: Math.min(pending.length, 20) };
}
