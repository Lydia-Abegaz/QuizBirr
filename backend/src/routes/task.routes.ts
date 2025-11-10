import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// User routes
router.get('/', taskController.getActiveTasks.bind(taskController));
router.get('/:taskId', taskController.getTaskById.bind(taskController));
router.post('/submit', authenticate, taskController.submitTask.bind(taskController));
router.get('/user/submissions', authenticate, taskController.getUserSubmissions.bind(taskController));

// Admin routes
router.get('/admin/all', authenticate, isAdmin, taskController.getAllTasks.bind(taskController));
router.get('/admin/pending', authenticate, isAdmin, taskController.getPendingSubmissions.bind(taskController));
router.post('/', authenticate, isAdmin, taskController.createTask.bind(taskController));
router.put('/:taskId', authenticate, isAdmin, taskController.updateTask.bind(taskController));
router.delete('/:taskId', authenticate, isAdmin, taskController.deleteTask.bind(taskController));
router.post('/submissions/:submissionId/review', authenticate, isAdmin, taskController.reviewTaskSubmission.bind(taskController));

export default router;
