import { protectedRoute } from '../middleware/auth.middleware.js';
import express from 'express';
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendReqs, getRecomendedUsers, sendFriendRequest } from '../controller/user.controller.js';

const router=express.Router();
router.use(protectedRoute);

router.get('/',getRecomendedUsers);
router.get('/Friends',getMyFriends);

router.post('/friend-request/:id',sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);

router.get("/friend-requests",getFriendRequests);
router.get("/outgoing-friend-requests",getOutgoingFriendReqs);

export default router;