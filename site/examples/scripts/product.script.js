export default async function main(ctx) {
  const products = await ctx.collections.products.find({ status: 'published', limit: Number(ctx.input.limit || 50) });
  const mediaIds = products.flatMap((product) => product.mediaIds || product.data?.mediaIds || []);
  const mediaMap = await ctx.collections.media_assets.findMapByIds(mediaIds);

  return {
    items: products.map((product) => ({
      id: product.id,
      name: product.name || product.data?.name,
      price: product.price || product.data?.price,
      media: (product.mediaIds || product.data?.mediaIds || []).map((id) => mediaMap[id]).filter(Boolean),
    })),
  };
}
