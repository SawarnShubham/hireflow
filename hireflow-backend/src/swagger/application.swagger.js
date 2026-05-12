/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application APIs
 */

/**
 * @swagger
 * /api/applications/apply/{jobId}:
 *   post:
 *     summary: Apply to a job (Candidate)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted
 */

/**
 * @swagger
 * /api/applications/{applicationId}/status:
 *   patch:
 *     summary: Update application status (Recruiter)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPLIED, INTERVIEW_SCHEDULED, REJECTED, HIRED]
 *     responses:
 *       200:
 *         description: Status updated
 */
