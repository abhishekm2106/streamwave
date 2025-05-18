import { Router } from "express";
import protectedRoutes from "../middlewares/protectedRoutes.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../controllers/users.controller.js";

const router = Router();
router.use(protectedRoutes);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;
// 44575r6ftyei8344
// diamond@gmail.com

// {
//   "success": true,
//   "user": {
//       "_id": "6828873fd5b78ed8fbd1194d",
//       "fullName": "optimus prime",
//       "email": "diamond@gmail.com",
//       "bio": "autobots",
//       "profilePic": "https://avatar.iran.liara.run/public/14",
//       "nativeLanguage": "HINDI",
//       "learningLanguage": "ENGLISH",
//       "location": "BANGALORE",
//       "isOnboarded": true,
//       "friends": [],
//       "createdAt": "2025-05-17T12:55:27.493Z",
//       "updatedAt": "2025-05-18T03:27:08.420Z",
//       "__v": 0
//   }
// }
