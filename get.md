## Round 1 - 逻辑解释

> 本轮为「代码理解」第 1 轮，只做逻辑解释，未改动任何源码。以下结论均以本地仓库实际代码为准（而非 README 臆测）。

### 本轮涉及文件与核心导出符号

| 源码文件路径 | 本轮涉及的核心导出符号（函数/中间件/字段） |
| --- | --- |
| BACKEND/models/Proposal.model.js | `projectProposalSchema`、`status`(enum)、`finalSubmission.status`(enum)、`assignedFaculty`、`supervisorRequested`、`teamMembers`、`progress`、`hodReview`、`facultyReview` |
| BACKEND/controllers/student.controller.js | `submitProposal`、`updateProposal`、`requestSupervisor`、`submitFinalProject`、`getAvailableFaculty`、`uploadFile`、`addTimelineUpdate` |
| BACKEND/controllers/hod.controller.js | `approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、`getFacultyWorkload`、`getApprovedFacultyList` |
| BACKEND/controllers/faculty.controller.js | `acceptProposal`、`rejectProposal`、`rejectFinalSubmission`、`approveFinalSubmission` |
| BACKEND/controllers/auth.controller.js | `generateTokens`、`login`、`getModelByRole`、`registerStudent`、`registerFaculty` |
| BACKEND/middleware/auth.middleware.js | `protect`、`authorizeRoles` |
| BACKEND/routes/student.routes.js | `router.use(protect)`、`router.use(authorizeRoles('student'))`、各学生路由 |
| BACKEND/routes/hod.routes.js | `router.use(authorizeRoles('hod','admin'))`、`/proposals/:id/approve`、`/assign`、`/submission` |
| BACKEND/routes/faculty.routes.js | `router.use(authorizeRoles('faculty','hod'))`、`/proposals/:id/accept`、`/approve-submission`、`/reject-submission` |
| BACKEND/routes/auth.routes.js | `/login`、`/register/*`、`/me`(protect) |
| FRONTEND/src/lib/api.js | `api`(axios 实例)、请求拦截器、响应拦截器(401) |

---

### 正文结论

1. **PS-R1-01｜主状态机 `status` 的 8 个枚举值及默认值。**
   结论：`status` 枚举为 `Pending HOD Review` / `Pending Faculty Assignment` / `HOD Approved` / `Rejected (HOD)` / `Faculty Assigned` / `Faculty Accepted` / `Rejected (Faculty)` / `Submitted`，默认 `Pending HOD Review`。
   证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L65-L78) 中 `status` 字段 enum 与 `default`（L65-78）。

2. **PS-R1-02｜终稿子状态 `finalSubmission.status` 的 5 个枚举值及默认值。**
   结论：`finalSubmission.status` 枚举为 `Not Submitted` / `Under HOD Review` / `Under Faculty Review` / `Accepted` / `Rejected`，默认 `Not Submitted`；与之同级的还有 `liveLink/githubLink/linkedinLink/submittedAt/rejectionReason`。
   证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L26-L37)（`finalSubmission` 子文档，L26-37）。

3. **PS-R1-03｜学生 `submitProposal` 只创建 `Pending HOD Review` 记录，不接受前端传入 status。**
   结论：学生提交时 `create` 未显式写 `status`，因此落到 schema 默认值 `Pending HOD Review`；同时强制 `department = req.user.branch`，并做团队去重/唯一性校验（一人只能属于一个「活跃」提案）。
   证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L147-L153) `submitProposal` 的 `ProjectProposal.create`（L147-153）；活跃判定 `status: { $nin: ['Rejected (HOD)','Rejected (Faculty)'] }`（L109-145）。

4. **PS-R1-04｜HOD 审批 `approveProposal` 是「是否带 facultyId」的二分支写入。**
   结论：`req.body.facultyId` 存在 → 校验容量后写 `status='Faculty Assigned'` 且 `assignedFaculty=facultyId`；不存在 → 写 `status='Pending Faculty Assignment'`（`assignedFaculty` 保持不变）。两分支都会写 `hodReview.action='Approved'`。
   证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L202-L231) `approveProposal`（初值 L208-209、带 faculty 分支 L211-226、落库 L228-231）。

5. **PS-R1-05｜HOD 单独指派 `assignFacultyToProposal` 有前置状态白名单。**
   结论：仅当 `status ∈ {HOD Approved, Rejected (Faculty), Pending Faculty Assignment}` 才允许指派，成功后写 `assignedFaculty=facultyId`、`status='Faculty Assigned'`。
   证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L287-L305) 前置校验（L287-289）与落库（L303-305）。

6. **PS-R1-06｜Faculty `acceptProposal` 通过「_id + assignedFaculty=自己」原子更新到 `Faculty Accepted`。**
   结论：`findOneAndUpdate({_id, assignedFaculty: req.user._id}, {status:'Faculty Accepted', facultyReview.action:'Accepted'})`；若不是被指派人则匹配不到（返回 404），构成隐式鉴权。
   证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L129-L136) `acceptProposal`（L131-136）。

7. **PS-R1-07｜Faculty 驳回提案 `rejectProposal` 会清空 `assignedFaculty` 并置 `Rejected (Faculty)`。**
   结论：置 `status='Rejected (Faculty)'`、`facultyReview.action='Rejected'`，并把 `assignedFaculty=null`，从而回到「HOD 待重指派」态（可被 `assignFacultyToProposal` 白名单接住）。
   证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L154-L162) `rejectProposal`（L158-162）。

8. **PS-R1-08｜学生 `submitFinalProject` 是进入终稿流程的唯一入口，双重写状态。**
   结论：前置要求 `status==='Faculty Accepted'` 且 `progress===100`、三个链接齐全、report+ppt（Research Paper 还需 paper）文件齐全；通过后写 `finalSubmission.status='Under HOD Review'` 且主 `status='Submitted'`。
   证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L402-L442) `submitFinalProject`（前置 L408-432、落库 L434-442）。

9. **PS-R1-09｜HOD 复核终稿 `updateProjectSubmission` 决定「转 Faculty」或「驳回」。**
   结论：`body.status==='Under Faculty Review'` → 写 `finalSubmission.status='Under Faculty Review'`（主 `status` 保持 `Submitted` 不变）；`body.status==='Rejected'` → 校验 reason/requiredCorrections≥20 字，写 `finalSubmission.status='Rejected'` 并把主 `status` 重置回 `Faculty Accepted`（重新开放上传），同时压入 `submissionHistory`。其他值报错。
   证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L450-L532) `updateProjectSubmission`（转 Faculty L467-488、驳回 L489-529）。

10. **PS-R1-10｜Faculty 终裁：`approveFinalSubmission` 收口为 `Accepted`，`rejectFinalSubmission` 退回 `Faculty Accepted`。**
    结论：两者都要求 `proposal.status==='Submitted'`；通过 → `finalSubmission.status='Accepted'`、主 `status` 仍保持 `Submitted`（作为完结态）；驳回 → 校验 reason/requiredCorrections≥20 字、写 `finalSubmission.status='Rejected'`、主 `status` 重置 `Faculty Accepted`、压入 `submissionHistory`。
    证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L240-L254) `approveFinalSubmission`（L248-254）；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L181-L218) `rejectFinalSubmission`（L196-217）。

11. **PS-R1-11｜enum 里存在但无实际写入路径的「悬空」主状态：`HOD Approved`。**
    结论：`HOD Approved` 出现在 `status` enum、也被多处「读取/查询」使用（HOD 仪表盘筛选、`assignFacultyToProposal` 白名单），但全仓无任何函数把 `status` 写成 `'HOD Approved'`——HOD 审批只会写 `Faculty Assigned` 或 `Pending Faculty Assignment`。因此该状态实际不可达（对 `assignFacultyToProposal` 而言，可达前置态是 `Pending Faculty Assignment` 与 `Rejected (Faculty)`）。
    证据：写入侧仅见于 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L228)（无 `HOD Approved` 赋值）；读取侧见 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L30-L33) 与 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L287-L289)。

12. **PS-R1-12｜`finalSubmission.status='Under Faculty Review'` 是「写了但不被消费」的子状态。**
    结论：HOD 会把子状态写成 `Under Faculty Review`（PS-R1-09），但 Faculty 终裁函数只判断主 `status==='Submitted'`，从不校验 `finalSubmission.status` 是否等于 `Under Faculty Review`——即该子状态无守卫作用，Faculty 甚至可在 HOD 尚未转发（子状态仍为 `Under HOD Review`）时直接终裁，只要主状态是 `Submitted`。
    证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L248-L250) 与 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L196-L198) 均只判 `status !== 'Submitted'`。

13. **PS-R1-13｜主状态机可达迁移路径汇总（谁在什么函数写下一态）。**
    结论：可达路径为——
    `(创建)→Pending HOD Review` [submitProposal];
    `Rejected(*)→Pending HOD Review` [updateProposal, L234];
    `Pending HOD Review→Rejected (HOD)` [hod.rejectProposal, L260];
    `Pending HOD Review→Pending Faculty Assignment`（无 facultyId）或 `→Faculty Assigned`（带 facultyId）[hod.approveProposal, L208/L224];
    `Pending Faculty Assignment|Rejected (Faculty)→Faculty Assigned` [hod.assignFacultyToProposal, L304];
    `Faculty Assigned→Faculty Accepted` [faculty.acceptProposal, L133] 或 `→Rejected (Faculty)`(清 assignedFaculty) [faculty.rejectProposal, L160];
    `Faculty Accepted→Submitted` [student.submitFinalProject, L441];
    `Submitted→Faculty Accepted`(终稿被驳回) [hod.updateProjectSubmission L513 / faculty.rejectFinalSubmission L217];
    `Submitted→Submitted`(终裁通过、子状态转 Accepted) [faculty.approveFinalSubmission, L253]。
    证据：见上述各行号（引用 PS-R1-03/04/05/06/07/08/09/10 所列位置）。

14. **PS-R1-14｜`requestSupervisor` 只是「预填 `assignedFaculty` + 置 `supervisorRequested`」，不改 `status`。**
    结论：学生请求导师时若 `assignedFaculty` 或 `supervisorRequested` 已存在则拒绝；否则写 `supervisorRequested=true`、`assignedFaculty=facultyId`，但 **主 `status` 保持不变**（仍是 `Pending HOD Review`）。它只是给 HOD/后续流程一个「学生期望的导师」，不构成正式指派。
    证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L326-L339) `requestSupervisor`（守卫 L331-332、落库 L337-339）。

15. **PS-R1-15｜`assignedFaculty` 与 `status` 的联合决定顺序（按真实代码，非 README）。**
    结论：真实优先级为——① 学生 `requestSupervisor` 可先把 `assignedFaculty` 预填为期望导师，但不改 status；② HOD `approveProposal` 若 body 带 `facultyId` 则**以该 facultyId 覆盖** `assignedFaculty` 并置 `Faculty Assigned`，若不带则置 `Pending Faculty Assignment` 且**不覆盖**已有 `assignedFaculty`（即保留学生预填值，但状态并不进入指派态）；③ HOD `assignFacultyToProposal` 强制用 body.facultyId 覆盖并置 `Faculty Assigned`；④ Faculty `acceptProposal` 要求 `assignedFaculty===自己` 才能把状态推进到 `Faculty Accepted`。关键点：`approveProposal` **不读取**学生预填的 `assignedFaculty` 来做指派，只认 body.facultyId。
    证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L337-L338)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L229)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L291-L304)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L131-L133)。

16. **PS-R1-16｜`generateTokens`：Access 1h / Refresh 7d，payload 仅含 `{ id }`，不含 role。**
    结论：两个 token 用不同密钥签发（`JWT_SECRET` / `JWT_REFRESH_SECRET`），payload 只放用户 `_id`，不含角色；角色在 `protect` 阶段通过查表反查得到。
    证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L14-L18) `generateTokens`。

17. **PS-R1-17｜登录响应把 Access 放响应体、Refresh 放 httpOnly Cookie，Refresh 以哈希入库。**
    结论：`login` 校验 verified/approved/ban/密码后签发双 token；`refreshToken` 经 bcrypt 哈希后存到对应用户模型，并以 `httpOnly`（生产环境 `secure`）Cookie 下发，`maxAge=7天`；响应体只返回 `_id/name/email/role/accessToken`（无明文 refreshToken）。
    证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L249-L262) `login`（签发 L249-253、Cookie L255-259、响应 L262）。

18. **PS-R1-18｜`protect` 只验 Access（`JWT_SECRET`），并按「Student→Faculty→Hod→Admin」顺序查表挂载 `req.user`。**
    结论：仅从 `Authorization: Bearer` 取 Access token 校验，成功后用 `decoded.id` 依次在 4 个集合里查找第一个命中者作为 `req.user`（`-password`）；查不到用户或验签失败均返回 401。注意：`protect` **完全不消费 refreshToken**（后端无刷新端点被本轮涉及路由引用）。
    证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L7-L29) `protect`（取 token L9-12、查表 L14-17）。

19. **PS-R1-19｜`authorizeRoles` 基于 `req.user.role` 做白名单，并对 faculty 追加 `isApproved` 复核。**
    结论：无 `req.user`→401；`role` 不在允许集→403；额外地，当 `role==='faculty'` 且 `!isApproved` 时也 403。学生路由要求 `student`；HOD 路由允许 `hod,admin`；Faculty 路由允许 `faculty,hod`（即 HOD 也能命中 faculty 控制器逻辑，但那些控制器又用 `assignedFaculty===req.user._id` 二次收窄）。
    证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L31-L45)；路由挂载见 [student.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/student.routes.js#L13-L14)、[hod.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/hod.routes.js#L12-L13)、[faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js#L10-L11)。

20. **PS-R1-20｜前端 axios：Access 存 localStorage 并注入 Header；401 即清用户跳登录，从不自动刷新。**
    结论：请求拦截器从 `localStorage.getItem('user').accessToken` 取 token 注入 `Authorization`；`withCredentials:true` 使 httpOnly refresh Cookie 随请求携带；响应拦截器遇到任意 401 直接 `localStorage.removeItem('user')` + `window.location.href='/login'`。即前端没有「用 refresh 续签」的逻辑——Access 过期（1h 后）的实际后果就是被强制登出重登。
    证据：[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js#L14-L43)（实例 L14-18、请求拦截 L21-31、401 处理 L34-43）。

21. **PS-R1-21｜导师容量「强制校验」只在两处触发，且上限硬编码为 60（非 `maxStudents`）。**
    结论：容量硬校验只发生在 HOD 的 `approveProposal`（带 facultyId 时）与 `assignFacultyToProposal` 两处；统计口径为「该导师名下 `status ∈ {Faculty Assigned, Faculty Accepted, Submitted}` 的提案」，人数 = Σ(1 + `teamMembers.length`)（组长+成员），当 `已有 + 本次 > 60` 时拒绝。上限数字 `60` 直接写死在这两个函数里。
    证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L216-L222) `approveProposal` 容量段；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L295-L301) `assignFacultyToProposal` 容量段。

22. **PS-R1-22｜容量「展示口径」用 `maxStudents || 60`，与强制校验的硬编码 60 存在不一致。**
    结论：`getAvailableFaculty`（学生端）、`getFacultyWorkload`、`getApprovedFacultyList`（HOD 端）都用 `capacity = f.maxStudents || 60` 计算 `availableSlots/isAvailable`，统计的活跃 status 集合与强制校验一致（`Faculty Assigned/Faculty Accepted/Submitted`）；但真正拦截指派时用的是**写死的 60**，不读 `maxStudents`——若某导师 `maxStudents≠60`，展示的可用名额与实际能否指派会对不上。
    证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L299-L316)；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L136-L147)；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L184-L195)。

---

### 本轮编号索引

- **PS-R1-01**：`status` 8 枚举值，默认 `Pending HOD Review`。
- **PS-R1-02**：`finalSubmission.status` 5 枚举值，默认 `Not Submitted`。
- **PS-R1-03**：学生 `submitProposal` 只建 `Pending HOD Review`，不接受前端 status，强制 department。
- **PS-R1-04**：HOD `approveProposal` 按是否带 facultyId 二分支写 `Faculty Assigned`/`Pending Faculty Assignment`。
- **PS-R1-05**：`assignFacultyToProposal` 有前置状态白名单，成功后置 `Faculty Assigned`。
- **PS-R1-06**：Faculty `acceptProposal` 用 `_id+assignedFaculty=自己` 原子更新到 `Faculty Accepted`。
- **PS-R1-07**：Faculty `rejectProposal` 置 `Rejected (Faculty)` 并清空 `assignedFaculty`。
- **PS-R1-08**：学生 `submitFinalProject` 是终稿唯一入口，写 `Under HOD Review` + 主 `Submitted`。
- **PS-R1-09**：HOD `updateProjectSubmission` 转发（`Under Faculty Review`）或驳回（`Rejected`+回退 `Faculty Accepted`）。
- **PS-R1-10**：Faculty 终裁 `approveFinalSubmission`→`Accepted`（主态留 Submitted）/`rejectFinalSubmission`→回退 `Faculty Accepted`。
- **PS-R1-11**：`HOD Approved` 在 enum 中但无任何写入路径，实际不可达。
- **PS-R1-12**：`Under Faculty Review` 子状态被写但从不被 Faculty 终裁校验消费。
- **PS-R1-13**：主状态机可达迁移路径全量汇总（含函数与行号）。
- **PS-R1-14**：`requestSupervisor` 仅预填 `assignedFaculty`+`supervisorRequested`，不改 status。
- **PS-R1-15**：`assignedFaculty` 与 `status` 联合决定的真实顺序；`approveProposal` 只认 body.facultyId、不读学生预填值。
- **PS-R1-16**：`generateTokens` Access 1h/Refresh 7d，payload 仅 `{id}`，不含 role。
- **PS-R1-17**：登录把 Access 放响应体、Refresh 哈希入库并以 httpOnly Cookie 下发。
- **PS-R1-18**：`protect` 只验 Access，按 Student→Faculty→Hod→Admin 查表挂 `req.user`。
- **PS-R1-19**：`authorizeRoles` 角色白名单 + faculty 的 `isApproved` 复核；三类路由的允许角色。
- **PS-R1-20**：前端 Access 存 localStorage 注入 Header，401 即登出跳登录，无自动刷新。
- **PS-R1-21**：容量强制校验仅在 `approveProposal`/`assignFacultyToProposal`，上限硬编码 60。
- **PS-R1-22**：容量展示口径用 `maxStudents||60`，与硬编码 60 的强制校验不一致。

---

## Round 2 - 潜在风险

> 本轮为「代码理解」第 2 轮，只做风险审查，未改动任何源码。每条风险均回引第 1 轮编号（PS-R1-YY），并落到具体函数/行号。严重度分「高/中/低」。

### 本轮涉及文件与核心导出符号

| 源码文件路径 | 核心导出符号（函数/中间件/字段） |
| --- | --- |
| BACKEND/middleware/upload.middleware.js | `upload`(multer)、`storage`、`limits`（本轮新读） |
| BACKEND/utils/localFiles.js | `UPLOAD_ROOT`、`toPublicUrl`、`pickUploadSubdir`、`deleteLocalFile`（本轮新读） |
| BACKEND/index.js | `app.use('/uploads', express.static)`、CORS 配置、路由挂载（本轮新读） |
| BACKEND/controllers/project.controller.js | `getProjectMessages`、`sendProjectMessage`、`updatePrivateNotes`（本轮新读，一跳扩展） |
| BACKEND/models/Student.model.js | `isBanned`、`banReason`、`otpAttempts`、`refreshToken`（本轮新读，一跳扩展） |
| BACKEND/controllers/faculty.controller.js | `acceptProposal`、`rejectProposal`（复用 R1） |
| BACKEND/controllers/student.controller.js | `requestSupervisor`、`submitFinalProject`、`addTimelineUpdate`、`uploadFile`（复用 R1） |
| BACKEND/controllers/hod.controller.js | `approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、`getHodDashboard`、`getAllProjects`（复用 R1） |
| BACKEND/controllers/auth.controller.js | `login`、`forgotPassword`、`verifyResetOtp`、`verifyOTP`、`generateTokens`（复用 R1） |
| BACKEND/middleware/auth.middleware.js | `protect`、`authorizeRoles`（复用 R1） |
| FRONTEND/src/lib/api.js | 响应拦截器(401)、`withCredentials`（复用 R1） |

---

### 正文结论

1. **PS-R2-01｜【高】学生 `requestSupervisor` + Faculty `acceptProposal` 组合可完全绕过 HOD 审批与 `Faculty Assigned` 态。**
   回引：PS-R1-06、PS-R1-14、PS-R1-15。
   触发条件：任意 `student` 对一个仍处 `Pending HOD Review` 的提案调用 `requestSupervisor`（此时 `assignedFaculty` 被预填为目标 faculty、status 不变），随后该 `faculty` 调用 `acceptProposal`。
   风险：`acceptProposal` 的更新条件只有 `{_id, assignedFaculty: req.user._id}`，**完全没有校验当前 `status` 是否为 `Faculty Assigned`**（PS-R1-06），因此会把 `Pending HOD Review` 直接推进到 `Faculty Accepted`——HOD 从未审批、`hodReview` 为空、`Faculty Assigned` 态被跳过。之后学生即可进入终稿流程（见 PS-R2-11）。这是状态机最严重的授权绕过。
   证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L326-L339) `requestSupervisor`（预填 assignedFaculty，不改 status）；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L131-L136) `acceptProposal`（无 status 守卫）。

2. **PS-R2-02｜【中】Faculty `rejectProposal` 同样无 `status` 守卫，可从任意状态清空 `assignedFaculty`。**
   回引：PS-R1-07、PS-R1-06。
   触发条件：某 `faculty` 是提案的 `assignedFaculty`（含 PS-R2-01 中被学生预填的情形），无论当前 status 为何（`Pending HOD Review`、`Faculty Accepted`、`Submitted` 等）均可调用。
   风险：更新条件同为 `{_id, assignedFaculty: req.user._id}`，无 status 白名单；执行后无差别写 `Rejected (Faculty)` 且 `assignedFaculty=null`。可导致「已进入终稿的项目被单方面打回」或「学生预填导师后被该导师直接拒掉」，与 HOD 审批流脱节。
   证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L154-L162) `rejectProposal`（L158-162）。

3. **PS-R2-03｜【高】HOD 全部写操作不校验 `proposal.department` 与自身部门一致（读路径却按部门收窄）。**
   回引：PS-R1-04、PS-R1-05、PS-R1-09。
   触发条件：任意 `hod`（或 `admin`）已知/枚举到他系某提案 `_id`。
   风险：`approveProposal`/`rejectProposal`/`assignFacultyToProposal`/`updateProjectSubmission` 均以 `findById(req.params.id)` 取记录后直接改写，**无 `proposal.department === req.user.department` 校验**；而读路径 `getHodDashboard`/`getAllProjects` 都用 `department: dept` 过滤。读写口径不一致，构成跨部门越权：A 系 HOD 可审批/驳回/指派/终稿处理 B 系项目。对照 [project.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/project.controller.js#L16) 里 HOD 分支明确带 `proposal.department === req.user.department`，说明该项目本应有此校验，HOD 控制器属遗漏。
   证据：写路径无部门校验 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L202-L231)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L278-L305)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L454-L465)；读路径按部门 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L26-L33) 与 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L62-L65)。

4. **PS-R2-04｜【中】指派导师时不校验 `faculty.department` 与 `proposal.department` 匹配。**
   回引：PS-R1-05、PS-R1-21。
   触发条件：HOD 指派（`approveProposal` 带 facultyId 或 `assignFacultyToProposal`）时传入任意已审批 faculty 的 `_id`。
   风险：两处只校验 `faculty.isApproved`，未校验 `faculty.department === proposal.department`（容量校验也只按写死的 60，PS-R1-21），可把跨系导师指派给本系项目；叠加 PS-R2-03 后果放大。
   证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L211-L226) 与 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L291-L301)（均只判 `isApproved`）。

5. **PS-R2-05｜【高】`/uploads` 以 `express.static` 无鉴权托管，任何人可下载报告/简历/私有文档（未授权下载 / IDOR）。**
   回引：PS-R1-08。
   触发条件：任意未认证访问者拿到或猜到 `/uploads/<subdir>/<Date.now()>_<filename>` 路径（该 URL 由 `toPublicUrl` 生成并明文存库、随各 dashboard 接口返回）。
   风险：终稿报告、PPT、研究论文、学生简历、头像等全部落在同一公开静态目录，`protect` 完全不介入静态路由；文件名前缀仅为时间戳+原名，可枚举/可从接口响应直接获得。属敏感数据泄露。
   证据：静态托管 [index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js#L35)；URL 生成 [localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js#L23-L27)；上传入口 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L263-L274) `uploadFile`。

6. **PS-R2-06｜【中】multer 无 `fileFilter`，仅限 50MB，文件类型校验缺失。**
   回引：PS-R1-08。
   触发条件：任意可上传角色（学生上传项目文件、各角色上传头像）。
   风险：`upload` 只配置了 `limits.fileSize`，**没有 `fileFilter`**；类型判断仅由 `pickUploadSubdir` 依据 mime/扩展名分目录（可伪造），控制器侧 `uploadFile` 只在 `fileType==='code'` 时拒 ZIP、并要求 doc/ppt 存在，但不阻止上传任意扩展名/内容的文件到公开的 `/uploads`。结合 PS-R2-05，可上传 HTML/SVG/脚本类文件并通过公开 URL 分发（存储型内容注入/钓鱼载体）。
   证据：[upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js#L22-L25)（无 fileFilter）；分目录逻辑 [localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js#L41-L48)。

7. **PS-R2-07｜【低-中】`refreshToken` 全链路为「死代码」：生成、哈希入库、下发 Cookie，却无任何刷新 API 消费它。**
   回引：PS-R1-16、PS-R1-17、PS-R1-18、PS-R1-20。
   触发条件：常规登录后。
   风险：全仓不存在 `/refresh` 路由或消费 `JWT_REFRESH_SECRET`/Cookie 的控制器（`protect` 明确不读 refresh，PS-R1-18）。因此 7 天 refresh 生命周期形同虚设，前端也无续签逻辑（PS-R1-20），Access 1h 过期即强制登出——功能缺口；同时哈希后的 refreshToken 长期驻留 DB 却永不校验，属无用攻击面/维护误导。
   证据：签发与下发 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L249-L259)；无刷新端点 [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js#L16-L27)；`protect` 不读 refresh [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L7-L29)。

8. **PS-R2-08｜【中】`isBanned` 只在 `login` 校验、`protect` 不校验 → 封禁存在最长 1 小时旁路窗口。**
   回引：PS-R1-17、PS-R1-18。
   触发条件：学生在被 HOD `toggleStudentBan` 封禁前已登录（持有未过期 Access token）。
   风险：`login` 会因 `isBanned` 拒绝新登录，但 `protect` 挂载 `req.user` 时不检查 `isBanned`；由于 JWT 无状态且 Access 存活 1h，已在线的被封学生可继续调用全部受保护接口直到 token 自然过期。封禁非即时生效。
   证据：登录校验 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L238-L241)；`protect` 无 ban 校验 [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L12-L21)；字段定义 [Student.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Student.model.js#L24-L25)。

9. **PS-R2-09｜【中-高】邮件不可用/离线时，注册与找回密码把明文 OTP 回传到 HTTP 响应体。**
   回引：PS-R1-17。
   触发条件：`SKIP_EMAIL_VERIFICATION`/`LOCAL_OFFLINE` 或 SMTP 不可用时（`forgotPassword` 只要邮件发送失败即触发）。
   风险：`forgotPassword` 在 `emailSent` 为假时直接返回 `{ otp, local:true }`；`registerStudent/Faculty` 在未验证分支返回 `otp`。任何能发起找回请求的人（仅需知道目标邮箱+role）可直接从响应拿到重置 OTP，完成账户接管。生产误配 `LOCAL_OFFLINE` 时后果严重。
   证据：找回明文 OTP [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L292-L299)；注册返回 otp [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L90-L97)。

10. **PS-R2-10｜【高】`verifyResetOtp` 无尝试次数限制，可对密码重置 OTP 暴力破解（注册验证 `verifyOTP` 有 5 次上限，二者不一致）。**
    回引：PS-R1-17。
    触发条件：攻击者对已发起找回的邮箱+role 反复提交 OTP。
    风险：`verifyOTP` 有 `otpAttempts >= 5` 熔断；但 `verifyResetOtp` 仅校验过期与 `bcrypt.compare`，**无任何计数/锁定**，验证成功即签发 15 分钟 `resetToken`。6 位数字 OTP 在 10 分钟有效期内可被高频枚举，配合 `resetPassword` 直接改密，形成账户接管链。
    证据：无限制的重置校验 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L307-L331)；对照注册校验的次数熔断 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L184-L192)。

11. **PS-R2-11｜【中】`progress` 由学生自报（`addTimelineUpdate`），可单方面满足 `submitFinalProject` 的 `progress===100` 前置。**
    回引：PS-R1-08。
    触发条件：状态达 `Faculty Accepted`（含 PS-R2-01 绕过路径）后，学生自行推送时间线 `PROJECT COMPLETE`/`PROJECT SUBMITTED`。
    风险：`addTimelineUpdate` 用 `progressMap` 把学生提交的 status 直接映射为 `progress`（100 由学生触发），而 `submitFinalProject` 的核心门槛正是 `progress===100`。进度并非由 faculty 核定，学生可自证「100% 完成」并提交终稿；`submitFinalProject` 其余门槛（三链接+文件存在）亦均为学生可控。终稿真实性门槛薄弱。
    证据：自报进度 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L506-L515) `addTimelineUpdate`；终稿门槛 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L411-L416) `submitFinalProject`。

12. **PS-R2-12｜【中】终稿子状态 `Under Faculty Review` 无守卫 + 驳回后主/子状态错位，导致「界面以为完成/实际仍可改」类逻辑风险。**
    回引：PS-R1-09、PS-R1-10、PS-R1-12。
    触发条件：终稿进入 `Submitted` 后，faculty 直接终裁（无需 HOD 先转发）；或被 HOD/faculty 驳回后。
    风险：(a) 承接 PS-R1-12，`approveFinalSubmission`/`rejectFinalSubmission` 只判主 `status==='Submitted'`，不校验子状态是否为 `Under Faculty Review`，faculty 可在 HOD 尚未复核（子状态仍 `Under HOD Review`）时抢先终裁，破坏「HOD→Faculty」串行评审契约（PS-R1-09）。(b) 驳回时主 `status` 回退 `Faculty Accepted` 但 `finalSubmission.status` 停留 `Rejected`（PS-R1-10），主/子状态语义不一致，前端若按其一渲染会出现「已提交/可再改」判断分歧，属前后端契约缺口。
    证据：终裁只判主状态 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L248-L253) 与 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L196-L217)；HOD 转发写子状态 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L467-L513)。

13. **PS-R2-13｜【中】CORS 实际对所有来源放行且 `credentials:true`，削弱 Cookie/凭证边界。**
    回引：PS-R1-17、PS-R1-20。
    触发条件：浏览器端任意第三方站点发起带凭证的跨域请求。
    风险：CORS 的 `origin` 回调对不在白名单的来源也执行 `callback(null, true)`（等价于反射式允许全部来源），同时 `credentials:true`。虽然 Access token 走 `Authorization` 头（PS-R1-20）不随 CORS 自动带上，但 httpOnly refresh Cookie（PS-R1-17）会随 `withCredentials` 请求发送；一旦将来引入基于 Cookie 的端点，此配置将直接暴露 CSRF/跨源读取面。当前属配置层高风险隐患。
    证据：CORS 放行逻辑 [index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js#L20-L29)（L21-25 无条件 `callback(null, true)`）。

---

### 本轮编号索引

- **PS-R2-01**：【高】`requestSupervisor`+`acceptProposal` 无 status 守卫，绕过 HOD 审批与 `Faculty Assigned`（回引 PS-R1-06/14/15）。
- **PS-R2-02**：【中】Faculty `rejectProposal` 无 status 守卫，可从任意态清空 `assignedFaculty`（回引 PS-R1-07）。
- **PS-R2-03**：【高】HOD 写操作缺 `department` 校验，读按部门/写不按部门 → 跨系越权（回引 PS-R1-04/05/09）。
- **PS-R2-04**：【中】指派导师不校验 `faculty.department` 与项目一致（回引 PS-R1-05/21）。
- **PS-R2-05**：【高】`/uploads` 无鉴权静态托管，报告/简历等可未授权下载（回引 PS-R1-08）。
- **PS-R2-06**：【中】multer 无 `fileFilter`，类型校验缺失（回引 PS-R1-08）。
- **PS-R2-07**：【低-中】refreshToken 无刷新 API，属死代码/无用攻击面（回引 PS-R1-16/17/18/20）。
- **PS-R2-08**：【中】`isBanned` 只在 login 校验、protect 不校验 → 封禁最长 1h 旁路（回引 PS-R1-17/18）。
- **PS-R2-09**：【中-高】离线/邮件失败时注册与找回密码回传明文 OTP（回引 PS-R1-17）。
- **PS-R2-10**：【高】`verifyResetOtp` 无尝试次数限制，可暴力破解重置 OTP（回引 PS-R1-17）。
- **PS-R2-11**：【中】`progress` 学生自报即可满足终稿 `progress===100` 门槛（回引 PS-R1-08）。
- **PS-R2-12**：【中】`Under Faculty Review` 无守卫 + 驳回后主/子状态错位，前后端契约缺口（回引 PS-R1-09/10/12）。
- **PS-R2-13**：【中】CORS 实际全来源放行且 `credentials:true`，凭证边界削弱（回引 PS-R1-17/20）。

---

## Round 3 - 技术细节与跨轮核验

> 本轮为「代码理解」第 3 轮，只做技术问答与跨轮一致性核验，未改动任何源码、未提交。每条技术细节同时回引 `PS-R1-*` 与 `PS-R2-*`；本轮为核验重读了 admin.controller.js、Faculty.model.js 并复核了 hod/faculty/student/auth 控制器相关片段。

### 本轮涉及文件与核心导出符号

| 源码文件路径 | 核心导出符号（函数/中间件/字段） |
| --- | --- |
| BACKEND/controllers/auth.controller.js | `generateTokens`、`login`（复用 R1/R2，本轮复核 payload） |
| BACKEND/middleware/auth.middleware.js | `protect`、`authorizeRoles`（复用 R1/R2） |
| BACKEND/models/Proposal.model.js | `status`(enum) 含 `HOD Approved`、`finalSubmission.status`、`targets`（复用 R1） |
| BACKEND/controllers/hod.controller.js | `approveProposal`、`assignFacultyToProposal`、`getHodDashboard`、`getAllProjects`（复用 R1/R2） |
| BACKEND/controllers/admin.controller.js | `getAdminDashboard`（`countDocuments({status:'HOD Approved'})`，本轮新读核验） |
| BACKEND/models/Faculty.model.js | `maxStudents`(default 60)、`isApproved`（本轮新读核验） |
| BACKEND/controllers/faculty.controller.js | `acceptProposal`、`approveFinalSubmission`（复用 R1/R2） |
| BACKEND/controllers/student.controller.js | `requestSupervisor`、`submitFinalProject`、`updateProjectTarget`、`addProjectTarget`、`addTimelineUpdate`（复用 R1/R2） |
| FRONTEND/src/lib/api.js | 响应拦截器(401)、`withCredentials`（复用 R1/R2） |

---

### 技术细节问答

1. **PS-R3-01｜Q1：accessToken payload 不含 role；角色鉴权在中间件层；`protect` 查找顺序会造成「同 ObjectId 时 Student 优先命中」。**
   回引：PS-R1-16、PS-R1-18、PS-R1-19；PS-R2-08。
   答：`generateTokens` 的 payload 仅 `{ id }`，不含 role（PS-R1-16），因此角色信息只能在请求期通过查库反推。角色鉴权发生在**中间件层**：`protect` 先按 `decoded.id` 查表挂 `req.user`，`authorizeRoles(...)` 再基于 `req.user.role` 做白名单+faculty 的 isApproved 复核（PS-R1-18/19）。`protect` 的查找顺序是 `Student → Faculty → Hod → Admin`（短路 `||`），若同一 ObjectId 理论上跨集合存在，则**永远命中 Student**（第一个非空结果即返回），后面的 Faculty/Hod/Admin 记录不可达——身份会被误判为学生，`authorizeRoles` 也据此放行/拒绝。注意这也意味着 `protect` 不校验 `isBanned`（PS-R2-08 的旁路根因同在此处）。
   证据：payload [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L14-L18)；查找顺序 [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L12-L21)；角色白名单 [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L31-L45)。

2. **PS-R3-02｜Q2：`HOD Approved` 是「只读不写」的死状态——全仓无任何写入点，只有查询/计数/比较处引用它。**
   回引：PS-R1-04、PS-R1-05、PS-R1-11；PS-R2-03。
   答：结合 Round 1 迁移图（PS-R1-04：HOD 审批只写 `Faculty Assigned` 或 `Pending Faculty Assignment`）与本轮全仓字面量检索，`'HOD Approved'` **无任何写入点**（无 `proposal.status = 'HOD Approved'` 或 `findByIdAndUpdate({status:'HOD Approved'})`）。所有引用均为「读取/比较/枚举」：
   - enum 定义：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L70)
   - HOD 仪表盘筛选 `$in`：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L31)
   - HOD 项目列表 `approved` 过滤 `$in`：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L71)
   - `assignFacultyToProposal` 前置白名单比较：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L287)
   - Admin 仪表盘计数：[admin.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/admin.controller.js#L56)（`countDocuments({status:'HOD Approved'})` 恒为 0）
   判定：**死状态（无写入点）**，与 PS-R1-11 完全一致；它既非活跃迁移目标，也不是被后续覆盖的历史值——是「读侧白名单/计数考虑了它、但写侧从未产生它」的悬空枚举。这也解释了 PS-R2-03 里 `assignFacultyToProposal` 的可达前置态实为 `Pending Faculty Assignment` 与 `Rejected (Faculty)`。

3. **PS-R3-03｜Q3：硬编码 60 恰等于 `maxStudents` 默认值；approve 与 assign 两处都查；统计集合不含 Pending 类状态。**
   回引：PS-R1-21、PS-R1-22；PS-R2-04。
   答：`Faculty.maxStudents` 的 schema 默认值就是 60，与两处强制校验里写死的 `60` 数值巧合相等；但强制校验**不读** `f.maxStudents`，因此当某导师被改成 `maxStudents≠60` 时，展示口径（`maxStudents||60`）与拦截口径（写死 60）会背离（PS-R1-22 得本轮 Faculty.model 佐证）。容量检查**在 `approveProposal`（带 facultyId 时）与 `assignFacultyToProposal` 两处都存在**（并非只在 approve，PS-R1-21）。统计口径为 `status ∈ {Faculty Assigned, Faculty Accepted, Submitted}`，人数 = Σ(1 + teamMembers.length)——**不包含任何 Pending 类状态**（`Pending HOD Review`/`Pending Faculty Assignment` 均不计），意味着「已指派但导师尚未 accept」阶段之前的项目不占额度。叠加 PS-R2-04（不校验导师同系）后，容量与部门双重约束都偏弱。
   证据：默认值 [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js#L24)；approve 校验 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L216-L222)；assign 校验 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L295-L301)。

4. **PS-R3-04｜Q4：终稿 `Accepted` 后主 `status` 仍是 `Submitted`（无 Completed 值）；学生被 `finalSubmission.status==='Accepted'` 守卫全面锁死，改不了 targets/timeline。**
   回引：PS-R1-01、PS-R1-10；PS-R2-11、PS-R2-12。
   答：主状态机 enum 里**没有 `Completed`**（PS-R1-01），`approveFinalSubmission` 通过后 `finalSubmission.status='Accepted'` 而主 `status` 保持 `Submitted`（PS-R1-10）——「完成」语义只由子状态 `Accepted` 表达，主状态不迁移。此后学生**不能**再改 targets/timeline：`addProjectTarget`、`updateProjectTarget`、`addTimelineUpdate`（以及 `updateProposal`/`uploadFile`/`submitFinalProject`/`requestDeadlineExtension`/`markDeadlineSubmitted`）开头都有同一守卫 `if (proposal.finalSubmission?.status === 'Accepted') return 400`。即锁定依据是**子状态 `Accepted`**，而非主状态——这正是 PS-R2-12 指出的主/子状态错位在「完成态」下的正向利用：子状态成为唯一可信的完结判据。
   证据：无 Completed 值 [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L65-L78)；终裁保持 Submitted [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L252-L253)；targets 守卫 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L387-L389)、[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L369-L371)；timeline 守卫 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L494-L496)。

5. **PS-R3-05｜Q5：最高severity 是 PS-R2-01；最小复现序列可被 R1 迁移图验证——属 R1「迁移图未标注的隐藏边」，非 R2 误判。**
   回引：PS-R1-06、PS-R1-13、PS-R1-14；PS-R2-01。
   答：Round 2 最高严重度为 **PS-R2-01（高，绕过 HOD 审批直达 `Faculty Accepted`）**。最小复现步骤（角色→动作→期望 status）：
   1) 学生 S 提交提案 → `submitProposal`，`status='Pending HOD Review'`，`assignedFaculty` 空（PS-R1-13 起点）。
   2) 学生 S 调 `POST /api/student/faculty/request/:facultyId`（目标为导师 F）→ `requestSupervisor`：`supervisorRequested=true`、`assignedFaculty=F`，**`status` 仍为 `Pending HOD Review`**（PS-R1-14；守卫仅拦 `assignedFaculty` 已存在/已请求，初次通过）。
   3) 导师 F 调 `PUT /api/faculty/proposals/:id/accept` → `acceptProposal`：匹配条件 `{_id, assignedFaculty:F}` 成立，无 status 守卫（PS-R1-06），写 `status='Faculty Accepted'`。
   期望 status 变化：`Pending HOD Review → (不变) → Faculty Accepted`，**跳过 `Pending Faculty Assignment`/`Faculty Assigned`，`hodReview` 始终为空**。
   可验证性判定：该终态 `Faculty Accepted` 本身在 PS-R1-13 迁移图中存在，但图中标注的**唯一入边**是 `Faculty Assigned →(acceptProposal)→ Faculty Accepted`；本序列产生的是一条 `Pending HOD Review →(acceptProposal)→ Faculty Accepted` 的**隐藏边**。因此这是 **R1 迁移图的遗漏（未标注 acceptProposal 缺 status 守卫导致的额外入边）**，而非 R2 误判。更新判定：PS-R2-01 成立且严重度维持【高】；同时对 PS-R1-13 作补充——`acceptProposal` 的实际入边应为「任意持有 `assignedFaculty=自己` 的状态」，而非仅 `Faculty Assigned`（详见下文跨轮冲突清单）。
   证据：requestSupervisor 无状态迁移 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L331-L339)；acceptProposal 无 status 守卫 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L131-L136)。

6. **PS-R3-06｜Q6：401 即登出 + refreshToken 无消费端 → 产品后果是「每小时被动强制重登、无静默续期」的会话体验缺陷。**
   回引：PS-R1-16、PS-R1-17、PS-R1-20；PS-R2-07。
   答：`generateTokens` 让 Access 仅 1h、Refresh 7d 且哈希入库+Cookie 下发（PS-R1-16/17），但后端**无任何刷新端点消费 refresh**（PS-R2-07），前端 `api.js` 又在任意 401 时直接 `localStorage.removeItem('user')`+跳 `/login`（PS-R1-20）。产品后果链：用户登录后最多 1 小时，Access 一过期，下一个请求即 401 → 被强制登出重登，**7 天的 refresh 生命周期完全无法兑现**（既无 `/refresh` 调用、也无前端拦截器里的重试续签逻辑）。即「表面上实现了双 token 续期机制，实际退化为 1 小时硬会话」，属功能缺口而非纯安全问题；同时 DB 中长期存着永不被校验的 refreshToken 哈希（PS-R2-07 的无用攻击面）。
   证据：token 时效 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L14-L18)；401 强制登出 [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js#L34-L43)。

---

### 跨轮冲突清单

| 冲突编号对 | 冲突点 | 以哪次重读为准 | 最终判定 |
| --- | --- | --- | --- |
| PS-R1-13 ↔ PS-R2-01 / PS-R3-05 | R1 迁移图把 `→Faculty Accepted` 的唯一入边写为 `Faculty Assigned →(acceptProposal)`；R2/R3 证明 `acceptProposal` 无 status 守卫，`Pending HOD Review` 也能直达 `Faculty Accepted` | 以 R3 重读 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L131-L136) 为准 | R1-13 为**不完整**（非错误）：它只列了「预期」入边，遗漏了 acceptProposal 缺守卫产生的隐藏入边。补正：`acceptProposal` 的真实前置是「`assignedFaculty===自己` 的任意状态」。PS-R2-01 判定维持【高】 |
| PS-R1-11 ↔ PS-R2-03 | R1-11 称 `HOD Approved` 不可达/悬空；R2-03 讨论 `assignFacultyToProposal` 白名单含 `HOD Approved` | 以 R3 全仓字面量检索（PS-R3-02）为准 | 二者**不矛盾**：`HOD Approved` 确无写入点（R1-11 成立），白名单里保留它只是「防御性读比较」，实际可达前置态是 `Pending Faculty Assignment`/`Rejected (Faculty)`。无需改判 |

> 说明：本轮未发现「R1 与 R2 直接互相矛盾到需要推翻某编号」的情形；上表第一行为「不完整需补正」，第二行为「表面冲突实则一致」。

---

### 本轮编号索引

- **PS-R3-01**：accessToken 无 role；鉴权在中间件层；`protect` 查找顺序使同 ObjectId 时 Student 优先命中（回引 PS-R1-16/18/19、PS-R2-08）。
- **PS-R3-02**：`HOD Approved` 全仓无写入点，仅 enum/查询/计数/比较引用 → 死状态（回引 PS-R1-04/05/11、PS-R2-03）。
- **PS-R3-03**：硬编码 60 = `maxStudents` 默认值；approve 与 assign 两处都查；统计集合不含 Pending 类（回引 PS-R1-21/22、PS-R2-04）。
- **PS-R3-04**：终稿 Accepted 后主 status 仍 `Submitted`（无 Completed）；学生被 `finalSubmission.status==='Accepted'` 守卫锁死 targets/timeline（回引 PS-R1-01/10、PS-R2-11/12）。
- **PS-R3-05**：PS-R2-01 为最高severity；给出三步最小复现，判定为 R1-13 迁移图遗漏的隐藏边、非 R2 误判（回引 PS-R1-06/13/14、PS-R2-01）。
- **PS-R3-06**：401 强制登出 + refresh 无消费端 → 退化为 1 小时硬会话的产品缺陷（回引 PS-R1-16/17/20、PS-R2-07）。

---

### 三轮追溯摘要

| Round1 编号 | Round2 编号 | Round3 编号 | 证据链主题 |
| --- | --- | --- | --- |
| PS-R1-06 / PS-R1-14 | PS-R2-01 | PS-R3-05 | acceptProposal 缺 status 守卫 → 学生 requestSupervisor 后导师 accept 绕过 HOD 审批直达 Faculty Accepted |
| PS-R1-11 | PS-R2-03 | PS-R3-02 | `HOD Approved` 死状态：读侧白名单/计数保留、写侧从不产生 |
| PS-R1-21 / PS-R1-22 | PS-R2-04 | PS-R3-03 | 容量上限硬编码 60（=maxStudents 默认）、approve+assign 双查、统计不含 Pending、不校验导师同系 |
| PS-R1-10 | PS-R2-12 | PS-R3-04 | 终稿完结只由子状态 `Accepted` 表达，主状态停 `Submitted`，学生写操作按子状态锁死 |
| PS-R1-16 / PS-R1-17 / PS-R1-20 | PS-R2-07 | PS-R3-06 | 双 token 机制退化：refresh 无消费端 + 前端 401 直接登出 → 1 小时硬会话 |
