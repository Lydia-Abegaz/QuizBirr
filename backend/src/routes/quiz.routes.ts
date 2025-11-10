import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// User routes
router.get('/random', authenticate, quizController.getRandomQuiz.bind(quizController));
router.post('/submit', authenticate, quizController.submitAnswer.bind(quizController));
router.get('/stats', authenticate, quizController.getUserStats.bind(quizController));

// Admin routes
router.post('/', authenticate, isAdmin, quizController.createQuiz.bind(quizController));
router.get('/all', authenticate, isAdmin, quizController.getAllQuizzes.bind(quizController));
router.put('/:quizId', authenticate, isAdmin, quizController.updateQuiz.bind(quizController));
router.delete('/:quizId', authenticate, isAdmin, quizController.deleteQuiz.bind(quizController));

export default router;
