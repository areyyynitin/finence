import prisma from "../prisma";


export async function getDashboardStats(organizationId: string) {
    // SQL Aggregation for totals
    const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM "Transaction"
    WHERE "organizationId" = ${organizationId}
  `;

    const totalIncome = Number(stats[0]?.total_income || 0);
    const totalExpense = Number(stats[0]?.total_expense || 0);

    // Get monthly data for the chart
    const monthlyStats = await prisma.$queryRaw<any[]>`
    SELECT 
      TO_CHAR(date, 'Mon') as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM "Transaction"
    WHERE "organizationId" = ${organizationId}
    AND date > NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(date, 'Mon'), DATE_TRUNC('month', date)
    ORDER BY DATE_TRUNC('month', date) ASC
  `;

    const recentTransactions = await prisma.transaction.findMany({
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 5
    });

    return {
        totalBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        monthlyStats,
        recentTransactions
    };
}
