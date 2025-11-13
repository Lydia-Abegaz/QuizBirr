import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleQuizzes = [
  {
    question: "Ethiopia is located in East Africa",
    answer: true,
    difficulty: "easy",
    points: 10,
    isActive: true
  },
  {
    question: "Addis Ababa is the capital of Kenya",
    answer: false,
    difficulty: "easy", 
    points: 10,
    isActive: true
  },
  {
    question: "The Ethiopian calendar has 13 months",
    answer: true,
    difficulty: "medium",
    points: 20,
    isActive: true
  },
  {
    question: "Coffee originated from Ethiopia",
    answer: true,
    difficulty: "medium",
    points: 20,
    isActive: true
  },
  {
    question: "Ethiopia was never colonized by European powers",
    answer: true,
    difficulty: "hard",
    points: 30,
    isActive: true
  },
  {
    question: "The Blue Nile starts from Lake Victoria",
    answer: false,
    difficulty: "hard",
    points: 30,
    isActive: true
  },
  {
    question: "Haile Selassie was the last emperor of Ethiopia",
    answer: true,
    difficulty: "medium",
    points: 20,
    isActive: true
  },
  {
    question: "Ethiopia uses the Gregorian calendar",
    answer: false,
    difficulty: "easy",
    points: 10,
    isActive: true
  }
];

async function seedQuizzes() {
  try {
    console.log('🌱 Seeding quizzes...');
    
    for (const quiz of sampleQuizzes) {
      await prisma.quiz.create({
        data: quiz
      });
      console.log(`✅ Created quiz: ${quiz.question.substring(0, 50)}...`);
    }
    
    console.log(`🎉 Successfully seeded ${sampleQuizzes.length} quizzes!`);
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuizzes();
