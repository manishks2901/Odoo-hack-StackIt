import { prisma } from '@/lib/prisma';

export async function testDatabaseConnection() {
  try {
    // Test basic connectivity
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test if we can query users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    // Test if we can query questions
    const questionCount = await prisma.question.count();
    console.log(`❓ Total questions: ${questionCount}`);
    
    // Test if we can query tags
    const tagCount = await prisma.tag.count();
    console.log(`🏷️  Total tags: ${tagCount}`);
    
    return { success: true, userCount, questionCount, tagCount };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}
