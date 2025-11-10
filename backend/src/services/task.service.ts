import { PrismaClient, Prisma } from '@prisma/client';
import { referralService } from './referral.service';

const prisma = new PrismaClient();

export class TaskService {
  async getActiveTasks() {
    try {
      const tasks = await prisma.task.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return tasks.map(t => ({
        ...t,
        reward: t.reward.toNumber()
      }));
    } catch (error) {
      console.error('Get active tasks error:', error);
      throw new Error('Failed to get tasks');
    }
  }
  
  async getTaskById(taskId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        ...task,
        reward: task.reward.toNumber()
      };
    } catch (error) {
      console.error('Get task error:', error);
      throw new Error('Failed to get task');
    }
  }
  
  async submitTask(userId: string, taskId: string, proof?: string) {
    try {
      // Check if task exists
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });
      
      if (!task || !task.isActive) {
        throw new Error('Task not found or inactive');
      }
      
      // Check if user has already submitted this task
      const existingSubmission = await prisma.taskSubmission.findFirst({
        where: { userId, taskId }
      });
      
      if (existingSubmission) {
        throw new Error('Task already submitted');
      }
      
      // Create task submission
      const submission = await prisma.taskSubmission.create({
        data: {
          userId,
          taskId,
          proof,
          status: 'pending'
        }
      });
      
      return submission;
    } catch (error) {
      console.error('Submit task error:', error);
      throw error;
    }
  }
  
  async getUserSubmissions(userId: string) {
    try {
      const submissions = await prisma.taskSubmission.findMany({
        where: { userId },
        include: {
          task: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return submissions.map(s => ({
        ...s,
        task: {
          ...s.task,
          reward: s.task.reward.toNumber()
        }
      }));
    } catch (error) {
      console.error('Get user submissions error:', error);
      throw new Error('Failed to get submissions');
    }
  }
  
  async reviewTaskSubmission(
    submissionId: string,
    adminId: string,
    approved: boolean,
    rejectionReason?: string
  ) {
    try {
      const submission = await prisma.taskSubmission.findUnique({
        where: { id: submissionId },
        include: { task: true }
      });
      
      if (!submission) {
        throw new Error('Submission not found');
      }
      
      if (submission.status !== 'pending') {
        throw new Error('Submission already reviewed');
      }
      
      // Determine if this would be the user's first approved submission
      const preApprovedCount = await prisma.taskSubmission.count({
        where: { userId: submission.userId, status: 'approved' }
      });

      const result = await prisma.$transaction(async (tx) => {
        // Update submission status
        const updatedSubmission = await tx.taskSubmission.update({
          where: { id: submissionId },
          data: {
            status: approved ? 'approved' : 'rejected',
            rejectionReason: approved ? null : rejectionReason,
            processedAt: new Date(),
            processedById: adminId
          }
        });
        
        if (approved) {
          // Award points and balance to user
          const pointsReward = 10; // Fixed points for completing task
          const balanceReward = submission.task.reward;
          
          const user = await tx.user.update({
            where: { id: submission.userId },
            data: {
              points: { increment: pointsReward },
              balance: { increment: balanceReward }
            }
          });
          
          // Create transaction record
          await tx.transaction.create({
            data: {
              userId: submission.userId,
              type: 'bonus',
              amount: balanceReward,
              status: 'completed',
              reference: `TASK-${submission.id}`,
              description: `Task completed: ${submission.task.title}`
            }
          });
          
          return { submission: updatedSubmission, user };
        }
        
        return { submission: updatedSubmission };
      });
      
      // Fire referral bonus if this was the first approved task for the user
      if (approved && preApprovedCount === 0) {
        try {
          await referralService.awardReferralBonus(submission.userId);
        } catch (e) {
          console.error('Referral bonus trigger failed:', e);
        }
      }

      return result;
    } catch (error) {
      console.error('Review task submission error:', error);
      throw error;
    }
  }
  
  async getPendingSubmissions(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [submissions, total] = await Promise.all([
        prisma.taskSubmission.findMany({
          where: { status: 'pending' },
          include: {
            task: true,
            user: {
              select: {
                id: true,
                phoneNumber: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' }
        }),
        prisma.taskSubmission.count({ where: { status: 'pending' } })
      ]);
      
      return {
        submissions: submissions.map(s => ({
          ...s,
          task: {
            ...s.task,
            reward: s.task.reward.toNumber()
          }
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get pending submissions error:', error);
      throw new Error('Failed to get pending submissions');
    }
  }
  
  // Admin functions
  async createTask(data: {
    title: string;
    description?: string;
    type: string;
    reward: number;
    metadata?: any;
  }) {
    try {
      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          reward: new Prisma.Decimal(data.reward),
          metadata: data.metadata
        }
      });
      
      return {
        ...task,
        reward: task.reward.toNumber()
      };
    } catch (error) {
      console.error('Create task error:', error);
      throw new Error('Failed to create task');
    }
  }
  
  async updateTask(taskId: string, data: Partial<{
    title: string;
    description: string;
    type: string;
    reward: number;
    isActive: boolean;
    metadata: any;
  }>) {
    try {
      const updateData: any = { ...data };
      if (data.reward !== undefined) {
        updateData.reward = new Prisma.Decimal(data.reward);
      }
      
      const task = await prisma.task.update({
        where: { id: taskId },
        data: updateData
      });
      
      return {
        ...task,
        reward: task.reward.toNumber()
      };
    } catch (error) {
      console.error('Update task error:', error);
      throw new Error('Failed to update task');
    }
  }
  
  async deleteTask(taskId: string) {
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: { isActive: false }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      throw new Error('Failed to delete task');
    }
  }
  
  async getAllTasks(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.task.count()
      ]);
      
      return {
        tasks: tasks.map(t => ({
          ...t,
          reward: t.reward.toNumber()
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get all tasks error:', error);
      throw new Error('Failed to get tasks');
    }
  }
}

export const taskService = new TaskService();
