export default async function main(ctx) {
  const campaigns = await ctx.collections.marketing_campaigns.find({ status: 'active' });
  const users = await ctx.collections.users.find({ segment: ctx.input.segment });

  return {
    campaigns,
    segment: ctx.input.segment,
    targetCount: users.length,
  };
}
