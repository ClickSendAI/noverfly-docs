export default async function main(ctx) {
  const limit = Number(ctx.input.limit || 20);
  const page = Number(ctx.input.page || ctx.input.cursor || 1);

  const posts = await ctx.collections.posts.find({
    status: 'published',
    limit,
    page,
  });

  const mediaIds = posts.flatMap((post) => {
    const ids = post.mediaIds || post.data?.mediaIds;
    return Array.isArray(ids) ? ids : [];
  });

  const userIds = [...new Set(posts.flatMap((post) => {
    const authorId = post.authorId || post.userId || post.data?.authorId || post.data?.userId;
    return authorId ? [String(authorId)] : [];
  }))];

  const [mediaMap, users] = await Promise.all([
    ctx.collections.media_assets.findMapByIds(mediaIds),
    userIds.length > 0 ? ctx.collections.users.findByIds(userIds) : Promise.resolve([]),
  ]);

  const userMap = Object.fromEntries(users.map((user) => [String(user.id), user]));

  const items = posts.map((post) => {
    const ids = post.mediaIds || post.data?.mediaIds || [];
    const media = (Array.isArray(ids) ? ids : [])
      .map((id) => mediaMap[String(id)])
      .filter(Boolean);

    const authorId = post.authorId || post.userId || post.data?.authorId || post.data?.userId;
    const author = authorId ? userMap[String(authorId)] : null;

    return {
      id: post.id,
      type: post.type || post.data?.type || 'post',
      text: post.text || post.data?.text,
      author: author ? {
        id: author.id,
        name: author.name || author.data?.name,
        avatarUrl: author.avatarUrl || author.data?.avatarUrl,
      } : null,
      media: media.map((m) => ({
        id: m.id,
        kind: m.kind || m.data?.kind,
        url: m.originalUrl || m.data?.originalUrl,
        thumbnailUrl: m.thumbnailUrl || m.data?.thumbnailUrl,
        width: m.width || m.data?.width,
        height: m.height || m.data?.height,
        aspectRatio: m.aspectRatio || m.data?.aspectRatio,
        dominantColor: m.dominantColor || m.data?.dominantColor,
        blurhash: m.blurhash || m.data?.blurhash,
      })),
      layout: ctx.layout.computePostLayout(post, media),
      performance: ctx.performance.computePolicy(post, media),
    };
  });

  return {
    items,
    page,
    limit,
    nextCursor: ctx.pagination.nextCursor(page, limit, items.length),
  };
}
