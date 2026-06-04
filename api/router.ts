import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { contactRouter } from "./routers/contact";
import { dealRouter } from "./routers/deal";
import { activityRouter } from "./routers/activity";
import { projectRouter } from "./routers/project";
import { taskRouter } from "./routers/task";
import { serviceRouter } from "./routers/service";
import { aiRouter } from "./routers/ai";
import { dashboardRouter } from "./routers/dashboard";
import { reportRouter } from "./routers/report";
import { userRouter } from "./routers/user";
import { localAuthRouter } from "./routers/localAuth";
import { messageRouter } from "./routers/message";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  contact: contactRouter,
  deal: dealRouter,
  activity: activityRouter,
  project: projectRouter,
  task: taskRouter,
  service: serviceRouter,
  ai: aiRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
  user: userRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
