## Round 1 - 逻辑解释

| 源码文件路径 | 本轮涉及的核心导出符号（函数/中间件/字段） |
| --- | --- |
| BACKEND/models/Proposal.model.js | `ProjectProposal`；`status` enum、`finalSubmission.status` enum、`supervisorRequested`、`assignedFaculty`、`hodReview`、`facultyReview`、`submissionHistory`、`timeline`、`progress` |
| BACKEND/models/Faculty.model.js | `Faculty`；`maxStudents`（默认 60）、`isApproved`、`refreshToken`、`role` |
| BACKEND/controllers/student.controller.js | `submitProposal`、`updateProposal`、`requestSupervisor`、`submitFinalProject`、`getAvailableFaculty`、`uploadFile`、`addTimelineUpdate` |
| BACKEND/controllers/hod.controller.js | `approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、`getHodDashboard`、`getFacultyWorkload`、`getApprovedFacultyList`、`getAllProjects` |
| BACKEND/controllers/faculty.controller.js | `acceptProposal`、`rejectProposal`、`rejectFinalSubmission`、`approveFinalSubmission`、`getFacultyDashboard` |
| BACKEND/controllers/auth.controller.js | `generateTokens`、`getModelByRole`、`login`、`registerStudent`、`registerFaculty`、`verifyOTP` |
| BACKEND/middleware/auth.middleware.js | `protect`、`authorizeRoles` |
| BACKEND/routes/student.routes.js | 路由表；`router.use(protect)` + `authorizeRoles('student')` |
| BACKEND/routes/hod.routes.js | 路由表；`authorizeRoles('hod', 'admin')` |
| BACKEND/routes/faculty.routes.js | 路由表；`authorizeRoles('faculty', 'hod')` |
| BACKEND/routes/auth.routes.js | 路由表（无 refresh 端点）；`/me` |
| FRONTEND/src/lib/api.js | 默认导出 axios 实例；请求拦截器、401 响应拦截器 |
| FRONTEND/src/pages/Login.jsx | 登录成功后 `localStorage.setItem('user', ...)`（L745） |

1. **PS-R1-01**：主状态字段 `status` 共 8 个枚举值：`'Pending HOD Review'`、`'Pending Faculty Assignment'`、`'HOD Approved'`、`'Rejected (HOD)'`、`'Faculty Assigned'`、`'Faculty Accepted'`、`'Rejected (Faculty)'`、`'Submitted'`，默认 `'Pending HOD Review'`。证据：BACKEND/models/Proposal.model.js，`status` 字段，L65-78。

2. **PS-R1-02**：终稿子状态 `finalSubmission.status` 共 5 个枚举值：`'Not Submitted'`、`'Under HOD Review'`、`'Under Faculty Review'`、`'Accepted'`、`'Rejected'`，默认 `'Not Submitted'`；与主 `status` 相互独立、由不同函数分别写入。证据：BACKEND/models/Proposal.model.js，`finalSubmission`，L26-37。

3. **PS-R1-03**：学生 `submitProposal` 创建提案时不显式写 `status`，落库即为默认值 `'Pending HOD Review'`；创建前做组队唯一性校验（队长/队员不得挂在其他"非拒绝"状态提案下，口径为 `status $nin ['Rejected (HOD)','Rejected (Faculty)']`），团队上限 4 人。证据：BACKEND/controllers/student.controller.js，`submitProposal`，L92-160（校验 L98-145，创建 L147-153）。

4. **PS-R1-04**：学生 `updateProposal` 仅当 `status ∈ {'Rejected (HOD)','Rejected (Faculty)'}` 且终稿未被 Accepted 时允许，保存时把 `status` 重置为 `'Pending HOD Review'`（重新进入 HOD 评审）。证据：BACKEND/controllers/student.controller.js，`updateProposal`，L162-242（准入 L167-172，重置 L234）。

5. **PS-R1-05**：HOD `approveProposal` 按 body 是否带 `facultyId` 分两支：不带 → `status='Pending Faculty Assignment'` 且不 touch `assignedFaculty`；带 → 先验 faculty 存在且 `isApproved`、再做容量检查，通过后 `status='Faculty Assigned'` 且写入 `assignedFaculty`；两支都写 `hodReview`。该函数本身**没有**前置 status 校验、也没有终稿 Accepted 锁。证据：BACKEND/controllers/hod.controller.js，`approveProposal`，L202-253（分支 L208-229，写盘 L228-231）。

6. **PS-R1-06**：`'HOD Approved'` 是 enum 中的"死状态"——全仓库没有任何写入路径（全量检索仅发现读取：hod.controller.js L31/L71/L287、admin.controller.js L56、模型 L70）；`assignFacultyToProposal` 把它当作合法前置状态（L287），但永远不会真的遇到。证据：BACKEND/models/Proposal.model.js L70；BACKEND/controllers/hod.controller.js L31、L71、L287。

7. **PS-R1-07**：HOD `rejectProposal` 要求理由 ≥20 字符，直接把 `status` 写为 `'Rejected (HOD)'` 并记录 `hodReview`；学生随后只能走 PS-R1-04 的改稿重提。证据：BACKEND/controllers/hod.controller.js，`rejectProposal`，L255-276（写入 L259-262）。

8. **PS-R1-08**：HOD `assignFacultyToProposal` 的前置判断顺序为：提案存在 → 终稿非 Accepted（L283）→ `status ∈ {'HOD Approved','Rejected (Faculty)','Pending Faculty Assignment'}`（L287）→ faculty 存在且已批准（L292）→ 容量检查（L295-301）；通过后无条件覆盖 `assignedFaculty=facultyId` 并置 `status='Faculty Assigned'`（L303-304）。证据：BACKEND/controllers/hod.controller.js，`assignFacultyToProposal`，L278-319。

9. **PS-R1-09**：Faculty `acceptProposal` 的唯一匹配条件是 `{ _id, assignedFaculty: req.user._id }`，**没有任何 status 前置校验**，命中即写 `status='Faculty Accepted'` + `facultyReview`；因此对"学生 requestSupervisor 指定、但 HOD 尚未批准"的提案也可直接接受，形成跳过 HOD 评审的可达捷径。证据：BACKEND/controllers/faculty.controller.js，`acceptProposal`，L129-151（更新 L131-135）。

10. **PS-R1-10**：Faculty `rejectProposal` 在同一匹配条件下写 `status='Rejected (Faculty)'` 并把 `assignedFaculty` 置 `null`；但 `supervisorRequested` 一旦在 `requestSupervisor` 中置 true 后全仓库无任何复位代码，故被 Faculty 拒绝的学生不能再次发起导师请求，只能由 HOD 走 `assignFacultyToProposal` 重新分配。证据：BACKEND/controllers/faculty.controller.js，`rejectProposal`，L154-178（写入 L158-162）；BACKEND/controllers/student.controller.js，`requestSupervisor`，L332、L337。

11. **PS-R1-11**：学生 `submitFinalProject` 的准入链：终稿非 Accepted → 主 `status === 'Faculty Accepted'` → `progress >= 100` → 三个链接齐全 → 已上传 document 与 presentation 文件（`projectType='Research Paper'` 还需 paper 文件）；通过后写 `finalSubmission={...,status:'Under HOD Review'}` 并把主 `status` 写为 `'Submitted'`，然后通知本部门 HOD。证据：BACKEND/controllers/student.controller.js，`submitFinalProject`，L402-459（准入 L408-432，写入 L434-441）。

12. **PS-R1-12**：HOD `updateProjectSubmission` 是终稿的 HOD 关口：`status='Under Faculty Review'` 分支仅推进 `finalSubmission.status`（主 status 不变，仍为 `'Submitted'`）并通知 Faculty/学生；`status='Rejected'` 分支要求驳回理由与整改要求各 ≥20 字符，把当前提交快照 push 进 `submissionHistory`、写 `finalSubmission.status='Rejected'`，并把主 `status` **回退为 `'Faculty Accepted'`** 以重新开放上传。注意该函数不校验当前 `finalSubmission.status` 是否为 `'Under HOD Review'`。证据：BACKEND/controllers/hod.controller.js，`updateProjectSubmission`，L450-537（推进 L467-469，驳回 L489-514，回退 L513）。

13. **PS-R1-13**：Faculty `rejectFinalSubmission` 要求主 `status === 'Submitted'`（L196），同样记录 `submissionHistory`（reviewerRole='Faculty'）、写 `finalSubmission.status='Rejected'` + `rejectionReason`，并把主 `status` 回退为 `'Faculty Accepted'` 供学生重交。证据：BACKEND/controllers/faculty.controller.js，`rejectFinalSubmission`，L181-237（写入 L215-217）。

14. **PS-R1-14**：Faculty `approveFinalSubmission` 同样要求主 `status === 'Submitted'`，命中后写 `finalSubmission.status='Accepted'`，主 `status` 保持 `'Submitted'` 不变（终态）；此后各控制器中以 `finalSubmission?.status === 'Accepted'` 为全局锁，拒绝一切后续修改。证据：BACKEND/controllers/faculty.controller.js，`approveFinalSubmission`，L240-275（写入 L252-253）；锁示例见 student.controller.js L167、L408，faculty.controller.js L193、L245。

15. **PS-R1-15**：可达迁移路径汇总（主 status / 终稿 status）如下表；"写入方"列为真实代码位置：

    | 迁移 | 写入方（函数 → 下一状态） |
    | --- | --- |
    | （新建）→ Pending HOD Review | `submitProposal`（默认值）→ Pending HOD Review |
    | Rejected (HOD)/(Faculty) → Pending HOD Review | `updateProposal` L234 |
    | Pending HOD Review → Pending Faculty Assignment | `hod.approveProposal`（无 facultyId）L208/L228 |
    | Pending HOD Review → Faculty Assigned | `hod.approveProposal`（带 facultyId）L224/L228 |
    | Pending HOD Review → Rejected (HOD) | `hod.rejectProposal` L260 |
    | HOD Approved/Rejected (Faculty)/Pending Faculty Assignment → Faculty Assigned | `hod.assignFacultyToProposal` L304 |
    | 任意状态（assignedFaculty 匹配）→ Faculty Accepted | `faculty.acceptProposal` L133 |
    | 任意状态（assignedFaculty 匹配）→ Rejected (Faculty) | `faculty.rejectProposal` L160 |
    | Faculty Accepted → Submitted | `submitFinalProject` L441 |
    | Submitted → Faculty Accepted（退回重交） | `hod.updateProjectSubmission` L513 或 `faculty.rejectFinalSubmission` L217 |
    | Submitted → Submitted（终态锁定） | `faculty.approveFinalSubmission` L253 |
    | Not Submitted/Rejected → Under HOD Review（终稿） | `submitFinalProject` L439 |
    | Under HOD Review → Under Faculty Review（终稿） | `hod.updateProjectSubmission` L468 |
    | 非 Accepted → Rejected（终稿） | `hod.updateProjectSubmission` L511 / `faculty.rejectFinalSubmission` L215 |
    | Under Faculty Review → Accepted（终稿） | `faculty.approveFinalSubmission` L252 |

    证据：各行对应的控制器函数与行号见表内；enum 定义见 Proposal.model.js L65-78、L31-35。

16. **PS-R1-16**：学生 `requestSupervisor` 的判断顺序为：有提案（L329-330）→ `assignedFaculty` 为空（L331）→ `supervisorRequested` 为 false（L332）→ 目标 faculty 存在（L334-335）；随后写 `supervisorRequested=true` 且**直接写 `assignedFaculty=facultyId`，但不改 `status`**。它不校验 faculty 的 `isApproved`、department，也不做容量检查。证据：BACKEND/controllers/student.controller.js，`requestSupervisor`，L326-352（写入 L337-339）。

17. **PS-R1-17**：`assignedFaculty` 全仓库共 4 个写入点，优先级/覆盖关系为：`requestSupervisor`（student.controller.js L338，学生意向）→ `approveProposal` 带 facultyId（hod.controller.js L229，仅当本次给了 facultyId 才覆盖）→ `assignFacultyToProposal`（hod.controller.js L303，无条件覆盖）→ `faculty.rejectProposal` 清空（faculty.controller.js L160）；`status` 只被 HOD/Faculty 的动作推进，学生请求本身不推进状态机。三者组合的真实效果是：学生请求只表达意向并占位，HOD 分配可推翻占位，Faculty 接受以"当前 assignedFaculty 是谁"为唯一依据。证据：见四处行号；另见 PS-R1-09、PS-R1-10。

18. **PS-R1-18**：`generateTokens(id)` 签发的两类 token payload 均只含 `{ id }`：accessToken 用 `JWT_SECRET`、1 小时过期；refreshToken 用 `JWT_REFRESH_SECRET`、7 天过期。证据：BACKEND/controllers/auth.controller.js，`generateTokens`，L14-18。

19. **PS-R1-19**：`login` 的校验顺序：必须带 role → `getModelByRole` 选模型 → 用户存在 → `isEmailVerified` → faculty 须 `isApproved` → student 须未 `isBanned` → bcrypt 比对密码；成功后 refreshToken 经 bcrypt 哈希存入用户文档的 `refreshToken` 字段，明文 refreshToken 写入 `httpOnly` cookie（`secure` 仅生产环境，maxAge 7 天），响应 JSON 只返回 `{ _id, name, email, role, accessToken }`（不含 refreshToken）。证据：BACKEND/controllers/auth.controller.js，`login`，L209-267（哈希入库 L250-253，cookie L255-259，响应 L262）；模型字段见 Faculty.model.js L16。

20. **PS-R1-20**：`protect` 从 `Authorization: Bearer` 取 token，用 `JWT_SECRET` 验签后按 `decoded.id` 依次尝试 Student → Faculty → Hod → Admin 四个模型查人；`authorizeRoles(...roles)` 校验 `req.user.role`，且对 faculty 额外要求 `isApproved`。三组业务路由均以 `router.use` 全局挂载：student 组 `authorizeRoles('student')`、hod 组 `authorizeRoles('hod','admin')`、faculty 组 `authorizeRoles('faculty','hod')`（即 HOD 可调用 faculty 路由）。证据：BACKEND/middleware/auth.middleware.js，`protect` L7-29、`authorizeRoles` L31-46；BACKEND/routes/student.routes.js L13-14；hod.routes.js L12-13；faculty.routes.js L10-11。

21. **PS-R1-21**：前端把登录响应整体存入 `localStorage['user']`（Login.jsx L745）；api.js 请求拦截器从中读 `user.accessToken` 拼 `Bearer` 头（L21-31），实例带 `withCredentials: true`（L16）故 refreshToken cookie 会随请求发出——但后端**不存在任何 refresh 端点**（auth.routes.js L16-27 无 refresh 路由，全仓库检索确认 refreshToken 只被签发/存哈希/查询时排除，从未被验证使用）；响应拦截器对任意 401 直接删除 `localStorage['user']` 并跳转 `/login`（L37-40）。结论：accessToken 1 小时过期后的真实行为是强制重新登录，refresh 机制是未接线的死代码。证据：FRONTEND/src/lib/api.js L14-43；FRONTEND/src/pages/Login.jsx L745；BACKEND/routes/auth.routes.js L16-27。

22. **PS-R1-22**：导师容量的**阻断性**校验只出现在两处 HOD 函数：`approveProposal`（L215-222）与 `assignFacultyToProposal`（L294-301）；统计口径为 `assignedFaculty=facultyId 且 status ∈ {'Faculty Assigned','Faculty Accepted','Submitted'}` 的提案，人数按 `Σ(1 + teamMembers.length)`（队长+队员）计；判定式为 `current + incoming > 60` 即拒绝——上限 60 是写死的字面量，**不读** `faculty.maxStudents`。证据：BACKEND/controllers/hod.controller.js L216-222、L295-301。

23. **PS-R1-23**：容量在其余三处仅作展示：`getAvailableFaculty`（student.controller.js L300-316）、`getFacultyWorkload`（hod.controller.js L137-148）、`getApprovedFacultyList`（hod.controller.js L185-195），口径同上但 capacity 取 `f.maxStudents || 60`（模型默认 60，Faculty.model.js L24）；学生侧 `requestSupervisor` 完全没有容量校验，因此"学生请求 + Faculty 直接 accept"路径（PS-R1-09/16）可绕过 60 人上限。证据：见各函数行号；BACKEND/models/Faculty.model.js L24。

### 本轮编号索引

- **PS-R1-01**：主 `status` 8 个枚举值，默认 Pending HOD Review（Proposal.model.js L65-78）。
- **PS-R1-02**：`finalSubmission.status` 5 个枚举值，默认 Not Submitted，独立于主状态（Proposal.model.js L26-37）。
- **PS-R1-03**：`submitProposal` 不显式写状态，落库即 Pending HOD Review（student.controller.js L92-160）。
- **PS-R1-04**：`updateProposal` 仅限被拒状态，保存时重置回 Pending HOD Review（student.controller.js L234）。
- **PS-R1-05**：`hod.approveProposal` 双分支写 Pending Faculty Assignment 或 Faculty Assigned，无前置状态校验（hod.controller.js L202-253）。
- **PS-R1-06**：`'HOD Approved'` 在 enum 中但无写入路径，是死状态（hod.controller.js L31/L71/L287 仅读取）。
- **PS-R1-07**：`hod.rejectProposal` 写 Rejected (HOD)（hod.controller.js L259-262）。
- **PS-R1-08**：`assignFacultyToProposal` 前置链：Accepted 锁 → 三态白名单 → faculty 已批准 → 容量，通过后覆盖 assignedFaculty 并置 Faculty Assigned（hod.controller.js L278-319）。
- **PS-R1-09**：`faculty.acceptProposal` 只按 assignedFaculty 匹配、无状态前置，可直接把任意状态提案置 Faculty Accepted（faculty.controller.js L129-151）。
- **PS-R1-10**：`faculty.rejectProposal` 置 Rejected (Faculty) 并清空 assignedFaculty；supervisorRequested 永不复位，学生只能等 HOD 重派（faculty.controller.js L154-178）。
- **PS-R1-11**：`submitFinalProject` 需 Faculty Accepted + 进度 100 + 三链接 + 报告/PPT 文件，写终稿 Under HOD Review、主状态 Submitted（student.controller.js L402-459）。
- **PS-R1-12**：`hod.updateProjectSubmission` 推进终稿到 Under Faculty Review 或驳回（记历史、主状态回退 Faculty Accepted）（hod.controller.js L450-537）。
- **PS-R1-13**：`faculty.rejectFinalSubmission` 要求主状态 Submitted，驳回后回退 Faculty Accepted（faculty.controller.js L181-237）。
- **PS-R1-14**：`faculty.approveFinalSubmission` 写终稿 Accepted、主状态锁死 Submitted，全局 Accepted 锁生效（faculty.controller.js L240-275）。
- **PS-R1-15**：主/子状态全部可达迁移路径汇总表（见正文第 15 条）。
- **PS-R1-16**：`requestSupervisor` 写 supervisorRequested + assignedFaculty 但不推进状态，且无容量/审批校验（student.controller.js L326-352）。
- **PS-R1-17**：assignedFaculty 的 4 个写入点及"HOD 分配可推翻学生请求、Faculty 以当前 assignedFaculty 为准"的覆盖关系。
- **PS-R1-18**：access/refresh token payload 仅 {id}，分别 1h（JWT_SECRET）/7d（JWT_REFRESH_SECRET）（auth.controller.js L14-18）。
- **PS-R1-19**：登录成功：refreshToken 哈希入 DB + 明文进 httpOnly cookie，响应 JSON 只回 accessToken（auth.controller.js L209-267）。
- **PS-R1-20**：`protect` 按 id 依次查四类模型；`authorizeRoles` 验角色且 faculty 须 isApproved；三组路由的角色矩阵（auth.middleware.js L7-46）。
- **PS-R1-21**：前端存 localStorage['user']、请求头带 accessToken；无 refresh 端点，401 即清本地登录态跳 /login（api.js L14-43，Login.jsx L745）。
- **PS-R1-22**：阻断性容量校验仅在 hod.approveProposal / assignFacultyToProposal，口径为三状态提案的师生总数，上限 60 写死（hod.controller.js L215-222、L294-301）。
- **PS-R1-23**：展示侧容量用 `maxStudents || 60`（默认 60），requestSupervisor 路径可绕过上限（student.controller.js L300-316；Faculty.model.js L24）。

## Round 2 - 潜在风险

> 说明：本轮重读 Round 1 全文后，未发现需要纠正的 `PS-R1-XX` 结论；以下全部风险均挂在 Round 1 表格已列链路或其一跳扩展文件（upload.middleware.js / localFiles.js / index.js / otp.util.js）上。

| 源码文件路径 | 核心导出符号 |
| --- | --- |
| BACKEND/middleware/upload.middleware.js | `upload`（multer diskStorage；文件名清洗 L17-18；50MB 上限 L24；无 fileFilter） |
| BACKEND/utils/localFiles.js | `UPLOAD_ROOT`、`toPublicUrl`、`deleteLocalFile`（防穿越 L34-35）、`pickUploadSubdir`、`ensureUploadDirs` |
| BACKEND/index.js | `/uploads` 静态托管（L35）；CORS 配置（L12-29）；路由挂载（L72-80） |
| BACKEND/utils/otp.util.js | `generateOTP`（6 位 A-Z0-9，36^6 空间） |
| BACKEND/controllers/student.controller.js | 复用 R1：`requestSupervisor`、`addTimelineUpdate`、`uploadFile`、`submitFinalProject`、`updateProposal`、`getAvailableFaculty` |
| BACKEND/controllers/hod.controller.js | 复用 R1：`approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、`approveFaculty`、`rejectFaculty`、`toggleStudentBan`；读路径 `getHodDashboard`、`getAllProjects`、`getAllStudents` |
| BACKEND/controllers/faculty.controller.js | 复用 R1：`acceptProposal`、`rejectProposal`、`updateProgress`、`rejectFinalSubmission`、`approveFinalSubmission`、`getFacultyDashboard` |
| BACKEND/controllers/auth.controller.js | 复用 R1：`login`、`registerStudent`、`registerFaculty`、`forgotPassword`、`verifyOTP`、`verifyResetOtp`、`resetPassword`、`generateTokens` |
| BACKEND/middleware/auth.middleware.js | 复用 R1：`protect`、`authorizeRoles` |
| BACKEND/routes/faculty.routes.js | 复用 R1：`PUT /proposals/:id/progress` 挂载（L17） |
| BACKEND/routes/auth.routes.js | 复用 R1：路由表（确认无 refresh 端点，L16-27） |
| FRONTEND/src/lib/api.js | 复用 R1：axios 实例、`withCredentials`、401 拦截器 |

1. **PS-R2-01**（回引 PS-R1-09、PS-R1-16、PS-R1-17、PS-R1-22、PS-R1-23）
   - 风险标题：「学生请求 + 导师直收」路径完全绕过 HOD 审批、Faculty Assigned 状态与 60 人容量上限。
   - 严重度：高。
   - 触发条件：学生角色且提案处于 `Pending HOD Review`（`submitProposal` 后默认即此态，PS-R1-03）；任一 `isApproved` 的 faculty 配合或主动接受。
   - 说明：`requestSupervisor` 直接写 `assignedFaculty` 为自选导师，不校验 `isApproved`/部门/容量、不推进状态（PS-R1-16）；`acceptProposal` 只按 `assignedFaculty` 匹配、无任何 status 前置（PS-R1-09）。组合后提案从 `Pending HOD Review` 直达 `Faculty Accepted`：`hodReview` 永远为空、HOD 两处阻断性容量检查（PS-R1-22）与展示侧上限（PS-R1-23）全部失效，状态机中的 `Pending Faculty Assignment`/`Faculty Assigned` 被整体跳过。
   - 证据：BACKEND/controllers/student.controller.js `requestSupervisor` L326-352；BACKEND/controllers/faculty.controller.js `acceptProposal` L129-151；BACKEND/controllers/hod.controller.js 容量检查 L215-222、L294-301（被绕过方）。

2. **PS-R2-02**（回引 PS-R1-07、PS-R1-09、PS-R1-14、PS-R1-15）
   - 风险标题：`hod.rejectProposal` 无状态前置、不清 `assignedFaculty`、无终稿 Accepted 锁——HOD 已拒提案可被 Faculty「复活」，已完成项目可被打入矛盾态。
   - 严重度：高。
   - 触发条件：hod/admin 角色 + 任意提案 id；「复活」需该提案当前 `assignedFaculty` 对应的 faculty 再调 accept。
   - 说明：`rejectProposal` 用 `findByIdAndUpdate` 直写 `Rejected (HOD)`，唯一校验是理由 ≥20 字符；它不清空 `assignedFaculty`。因此 `Faculty Assigned` 状态下被 HOD 驳回后，Faculty 仍可用无状态前置的 `acceptProposal`（PS-R1-09）把状态拉回 `Faculty Accepted`，`hodReview.action='Rejected'` 与 `status` 自相矛盾。对终稿已 Accepted 的项目 HOD 同样能驳回（缺 PS-R1-14 的全局锁），形成「终稿 Accepted 但主状态 Rejected (HOD)」死锁态——学生改稿反被 `updateProposal` 的 Accepted 锁挡住（L167-172），项目无法回到正常流转。
   - 证据：BACKEND/controllers/hod.controller.js `rejectProposal` L255-276；BACKEND/controllers/faculty.controller.js `acceptProposal` L131-135；BACKEND/controllers/student.controller.js `updateProposal` L167-172。

3. **PS-R2-03**（回引 PS-R1-05、PS-R1-14、PS-R1-15）
   - 风险标题：`hod.approveProposal` 无状态前置/无 Accepted 锁——可将 `Submitted` 或已完成项目任意回拨。
   - 严重度：中。
   - 触发条件：hod/admin 角色 + 任意提案 id（含终稿已 Accepted 的项目）。
   - 说明：该函数全程不检查当前 `status`（PS-R1-05），可把 `Submitted`（甚至终稿 Accepted）项目写回 `Pending Faculty Assignment` 或 `Faculty Assigned` 并改写 `hodReview`，造成主状态倒退、与终稿子状态矛盾；与 PS-R2-02 同属「HOD 写操作游离于状态机之外」。
   - 证据：BACKEND/controllers/hod.controller.js `approveProposal` L202-253（写入 L228-231）。

4. **PS-R2-04**（回引 PS-R1-05、PS-R1-07、PS-R1-08、PS-R1-12）
   - 风险标题：HOD 全部写操作不校验 `proposal.department` 与本人部门一致，与读路径的部门过滤不一致——跨系 IDOR。
   - 严重度：高。
   - 触发条件：hod 角色（非 admin）+ 目标对象 id（ObjectId 在 dashboard、项目列表、Excel 导出等响应中广泛出现）。
   - 说明：读路径全部按 `req.user.department` 过滤（`getHodDashboard` L27/L31、`getAllProjects` L65、`getAllStudents` L122、`getFacultyWorkload` L135），而写路径全部裸用 `findById(req.params.id)`：`approveProposal` L205、`rejectProposal` L259、`assignFacultyToProposal` L281、`updateProjectSubmission` L454，以及 `approveFaculty` L157、`rejectFaculty` L171、`toggleStudentBan` L384。任一系的 HOD 可批准/驳回/派导师/处置终稿于他系提案，批准他系 faculty 账号、封禁他系学生。
   - 证据：上述行号，均位于 BACKEND/controllers/hod.controller.js。

5. **PS-R2-05**（回引 PS-R1-16、PS-R1-17）
   - 风险标题：`requestSupervisor` 不校验 faculty 部门与学生 branch 一致——跨系指导关系。
   - 严重度：中。
   - 触发条件：学生角色 + 提案无 `assignedFaculty` 且 `supervisorRequested=false`；目标为他系 faculty id。
   - 说明：`getAvailableFaculty` 展示侧按 `req.user.branch` 过滤（L296），但 `requestSupervisor` 只查 facultyId 存在（L334-335），不比对 department；与 PS-R2-01 组合后，他系 faculty 可 accept，且其 dashboard 按 `assignedFaculty` 取项目（`getFacultyDashboard` L14-21）——院系隔离在读侧也随之失效。
   - 证据：BACKEND/controllers/student.controller.js `requestSupervisor` L326-352、`getAvailableFaculty` L296；BACKEND/controllers/faculty.controller.js `getFacultyDashboard` L14-21。

6. **PS-R2-06**（回引 PS-R1-11）
   - 风险标题：上传中间件无 fileFilter/类型白名单，`fileType` 由客户端自报——任意类型文件可入库，HTML/SVG 经静态托管形成存储型 XSS 面。
   - 严重度：中。
   - 触发条件：任意已登录角色；学生 `uploadFile` 需 progress=100，但 progress 可自报（见 PS-R2-13），且注册头像、简历、延期证明等上传入口无进度门槛。
   - 说明：multer 仅限制 50MB（L24），无 fileFilter；`uploadFile` 只排除 body 里的 `fileType==='code'`（L247-249）；`pickUploadSubdir` 按 mimetype 归类（SVG 因 `image/*` 进 profiles，L44）。攻击者可上传 HTML/SVG，经 `/uploads` 以可执行 MIME 直接返回，在 API 源下执行脚本（可窃取 localStorage 中的 accessToken，联动 PS-R2-09）。
   - 证据：BACKEND/middleware/upload.middleware.js L11-25；BACKEND/controllers/student.controller.js `uploadFile` L246-261；BACKEND/utils/localFiles.js `pickUploadSubdir` L41-49；BACKEND/index.js L35。

7. **PS-R2-07**（回引 PS-R1-11、PS-R1-21）
   - 风险标题：`/uploads` 静态目录完全无鉴权——简历、延期证明、报告/PPT 凭 URL 公开下载。
   - 严重度：中。
   - 触发条件：无需任何角色，只需 URL；文件名形如 `时间戳_清洗后原名`，不可目录枚举，但 URL 会在 dashboard 响应、通知与邮件中广泛分发。
   - 说明：`index.js` L35 直接 `express.static(UPLOAD_ROOT)`，未挂 `protect`；敏感材料仅靠文件名 obscurity 保护。正面事实：`deleteLocalFile` 有路径穿越防护（L34-35），上传文件名经字符清洗（upload.middleware.js L17-18），上传链路本身无路径穿越风险。
   - 证据：BACKEND/index.js L35；BACKEND/utils/localFiles.js `toPublicUrl` L23-27、`deleteLocalFile` L30-39。

8. **PS-R2-08**（回引 PS-R1-21）
   - 风险标题：CORS 白名单是死代码——origin 回调所有分支均放行且 `credentials: true`。
   - 严重度：低。
   - 触发条件：无（配置缺陷）；当前现实影响有限：accessToken 在 localStorage 而非 cookie（PS-R1-21），refreshToken cookie 又无端点消费（PS-R2-09），跨站脚本无法伪造 Authorization 头。
   - 说明：`allowedOrigins` 名单从未生效（L21-25 三分支都 `callback(null, true)`）；一旦未来有端点开始读取 refreshToken cookie，立即变成可携带凭据的任意源跨域。
   - 证据：BACKEND/index.js L12-29。

9. **PS-R2-09**（回引 PS-R1-18、PS-R1-19、PS-R1-21）
   - 风险标题：Token 生命周期契约缺口——无 refresh API，refreshToken 全链路死代码；前端 401 一刀切登出。
   - 严重度：低。
   - 触发条件：正常使用约 1 小时后必现（accessToken 过期，PS-R1-18）。
   - 说明：后端只签发/哈希存库/写 cookie，无任何验证 refreshToken 的端点（auth.routes.js L16-27）；前端响应拦截器对任意 401 清登录态跳 `/login`。结果：7 天 refresh 设计完全不生效，用户被每小时强制登出；且 accessToken 存 localStorage，任何 XSS（联动 PS-R2-06）即可窃取。
   - 证据：BACKEND/controllers/auth.controller.js `generateTokens` L14-18、`login` L249-262；BACKEND/routes/auth.routes.js L16-27；FRONTEND/src/lib/api.js L34-43。

10. **PS-R2-10**（回引 PS-R1-19、PS-R1-20）
    - 风险标题：`isBanned` 仅在 login 检查、`protect` 不复查——封禁对学生最长滞后 1 小时才生效，与 faculty `isApproved` 的每请求检查策略不一致。
    - 严重度：中。
    - 触发条件：学生被封禁时已持有未过期 accessToken（有效期 ≤1h，PS-R1-18）。
    - 说明：`login` L238-241 拦截 banned 学生，但 `protect`（auth.middleware.js L7-29）只验签+查人，不看 `isBanned`；而 faculty 的 `isApproved` 却在 `authorizeRoles` 每次请求都查（L41-43）。HOD 调 `toggleStudentBan` 后，该学生剩余 token 有效期内仍可改提案、传文件、推 timeline。
    - 证据：BACKEND/controllers/auth.controller.js `login` L238-241；BACKEND/middleware/auth.middleware.js `protect` L7-29、`authorizeRoles` L41-43；BACKEND/controllers/hod.controller.js `toggleStudentBan` L381-396。

11. **PS-R2-11**（回引 PS-R1-19）
    - 风险标题：邮件发送失败/离线模式下，注册与忘记密码接口在响应中回传明文 OTP——可对任意邮箱直接取 OTP 完成密码重置。
    - 严重度：高。
    - 触发条件：无需登录；`LOCAL_OFFLINE=true` 或 `SKIP_EMAIL_VERIFICATION=true` 或 SMTP 未配置/`sendEmail` 失败（本地部署默认即此态）；攻击者只需知道目标邮箱。
    - 说明：`forgotPassword` 在 `emailSent=false` 时返回 `{ otp, local: true }`（L294-298），随后 `verifyResetOtp` + `resetPassword` 即可重置任意角色账户（`getModelByRole` 覆盖 hod/admin 模型）；`registerStudent`（L96）与 `registerFaculty`（L161）在未验证时同样把 otp 写进 201 响应。
    - 证据：BACKEND/controllers/auth.controller.js `forgotPassword` L269-305、`registerStudent` L90-97、`registerFaculty` L152-162、`resetPassword` L337-359。

12. **PS-R2-12**（回引 PS-R1-19）
    - 风险标题：`verifyResetOtp` 无尝试次数限制（对比 `verifyOTP` 的 5 次上限）——重置 OTP 可无限次试错；全仓库无速率限制中间件。
    - 严重度：低（OTP 为 6 位 A-Z0-9、36^6≈21.8 亿空间且 10 分钟过期，纯爆破不现实；但与注册 OTP 的防护强度明显不一致，若配合 PS-R2-11 的部分泄露场景则风险放大）。
    - 触发条件：无需登录；目标邮箱已被触发 `forgotPassword`。
    - 说明：`verifyOTP` 有 `otpAttempts >= 5` 拦截并递增计数（L184、L189-190）；`verifyResetOtp`（L307-335）只查 OTP 存在性与过期，从不计数；全仓库检索无任何 rate-limit 中间件。
    - 证据：BACKEND/controllers/auth.controller.js `verifyOTP` L184-193、`verifyResetOtp` L307-335；BACKEND/utils/otp.util.js `generateOTP` L3-12。

13. **PS-R2-13**（回引 PS-R1-11）
    - 风险标题：`progress` 由学生自报 timeline 状态映射生成——「进度 100%」门槛形同虚设。
    - 严重度：中。
    - 触发条件：学生角色 + 终稿非 Accepted（`addTimelineUpdate` 唯一前置，L494）。
    - 说明：`progressMap` 允许学生随时 push `PROJECT COMPLETE`/`PROJECT SUBMITTED` 直接把 `progress` 写为 100（L506-515），无任何 faculty 确认；`uploadFile`（L259-261）与 `submitFinalProject`（L414-416）的两处「progress≥100」硬门槛因此都可自我满足，终稿前置条件实际只剩「三链接 + 报告/PPT 文件齐全」。
    - 证据：BACKEND/controllers/student.controller.js `addTimelineUpdate` L489-535、`uploadFile` L259-261、`submitFinalProject` L414-416。

14. **PS-R2-14**（回引 PS-R1-12、PS-R1-13、PS-R1-14）
    - 风险标题：`hod.updateProjectSubmission` 不校验当前终稿状态——可对「未提交」项目执行推进/驳回，产生幽灵评审与空快照历史。
    - 严重度：中。
    - 触发条件：hod/admin 角色 + 提案 id（不要求其 `finalSubmission.status` 为 `Under HOD Review`）。
    - 说明：函数只查终稿非 Accepted（L458），甚至在 `finalSubmission` 缺失时兜底初始化为 `Not Submitted`（L463-465）后继续：可把从未提交的项目直接推进 `Under Faculty Review`（L467-469），或对空提交执行「驳回」——`submissionHistory` push 一条链接全为 undefined 的空快照（L498-509）并把主状态回退 `Faculty Accepted`。对比 Faculty 侧两个终稿函数都强制主 `status==='Submitted'`（faculty.controller.js L196、L248），HOD 侧缺这道对称校验，直接造成「界面以为在审、实际无稿可审」的错乱。
    - 证据：BACKEND/controllers/hod.controller.js `updateProjectSubmission` L450-537；BACKEND/controllers/faculty.controller.js `rejectFinalSubmission` L196、`approveFinalSubmission` L248。

15. **PS-R2-15**（回引 PS-R1-14）
    - 风险标题：终态锁覆盖不全——`faculty.updateProgress`（路由仍挂载）无 Accepted 锁，已完成项目 progress 仍可被改写。
    - 严重度：低。
    - 触发条件：faculty/hod 角色 + 分配给该 faculty 的项目 id（含终稿已 Accepted 的项目）。
    - 说明：注释自称「kept for backward compat but no longer used in UI」，但 `PUT /proposals/:id/progress` 仍挂载（faculty.routes.js L17）；函数只验 progress 取值范围与 `assignedFaculty` 匹配，不查终稿 Accepted。连同 PS-R2-02、PS-R2-03，「界面以为已完成、实际仍可再改」的写面共有三处漏网：`updateProgress`、`hod.approveProposal`、`hod.rejectProposal`。
    - 证据：BACKEND/controllers/faculty.controller.js `updateProgress` L297-312；BACKEND/routes/faculty.routes.js L17；BACKEND/controllers/hod.controller.js L202-276。

### 本轮编号索引

- **PS-R2-01**：学生请求 + 导师直收可绕过 HOD 审批、Faculty Assigned 状态与容量上限（高）。
- **PS-R2-02**：hod.rejectProposal 无状态前置/不清 assignedFaculty/无 Accepted 锁，被拒提案可复活、已完成项目可入矛盾态（高）。
- **PS-R2-03**：hod.approveProposal 无状态前置/无 Accepted 锁，可任意回拨项目状态（中）。
- **PS-R2-04**：HOD 全部写操作不校验 department，读路径却按部门过滤——跨系 IDOR（高）。
- **PS-R2-05**：requestSupervisor 不校验部门/isApproved，可建跨系指导关系（中）。
- **PS-R2-06**：上传无类型白名单、fileType 客户端自报，HTML/SVG 可经 /uploads 形成存储型 XSS 面（中）。
- **PS-R2-07**：/uploads 静态目录无鉴权，敏感文件凭 URL 公开下载（中）。
- **PS-R2-08**：CORS origin 回调全分支放行 + credentials:true，白名单为死代码（低）。
- **PS-R2-09**：无 refresh API，refreshToken 全链路死代码，前端 401 一刀切登出（低）。
- **PS-R2-10**：isBanned 仅在 login 检查、protect 不复查，封禁最长滞后 1 小时（中）。
- **PS-R2-11**：邮件失败/离线时注册与 forgotPassword 回传明文 OTP，可重置任意账户（高）。
- **PS-R2-12**：verifyResetOtp 无尝试次数限制，与 verifyOTP 的 5 次上限不一致；全仓库无限流（低）。
- **PS-R2-13**：progress 可由学生自报 timeline 直达 100，uploadFile/submitFinalProject 进度门槛失效（中）。
- **PS-R2-14**：hod.updateProjectSubmission 不校验当前终稿状态，可对未提交项目幽灵推进/驳回并写空快照（中）。
- **PS-R2-15**：终态锁覆盖不全——faculty.updateProgress、hod.approveProposal、hod.rejectProposal 三处无 Accepted 锁（低）。

## Round 3 - 技术细节与跨轮核验

| 源码文件路径 | 核心导出符号 |
| --- | --- |
| BACKEND/utils/emailTemplates.js | `proposalApproved` 邮件模板（L210）；L209 仅为注释「// 3. HOD Approved proposal」，非状态字面量比较 |
| BACKEND/controllers/admin.controller.js | 复用 R1 检索结果：L56 `countDocuments({ status: 'HOD Approved' })`（本轮未重读文件本体） |
| BACKEND/controllers/auth.controller.js | 复用 R1/R2：`generateTokens`、`login` |
| BACKEND/middleware/auth.middleware.js | 复用 R1/R2：`protect`、`authorizeRoles` |
| BACKEND/models/Proposal.model.js | 复用 R1：`status` enum、`finalSubmission.status` enum |
| BACKEND/models/Faculty.model.js | 复用 R1：`maxStudents`（L24） |
| BACKEND/controllers/hod.controller.js | 复用 R1/R2：`approveProposal`、`assignFacultyToProposal`、`rejectProposal`、`updateProjectSubmission` |
| BACKEND/controllers/faculty.controller.js | 复用 R1/R2：`acceptProposal`、`approveFinalSubmission`、`updateProgress` |
| BACKEND/controllers/student.controller.js | 复用 R1/R2：`submitProposal`、`requestSupervisor`、`addProjectTarget`、`updateProjectTarget`、`addTimelineUpdate` |
| BACKEND/routes/auth.routes.js | 复用 R1/R2：无 refresh 端点（L16-27） |
| BACKEND/routes/faculty.routes.js | 复用 R2：`updateProgress` 挂载（L17） |
| FRONTEND/src/lib/api.js | 复用 R1/R2：401 响应拦截器（L34-43） |

1. **Q1 → PS-R3-01**（回引 PS-R1-18、PS-R1-20；PS-R2-10）：JWT accessToken 的 payload **不含 role**，只有 `{ id }`（`generateTokens`，auth.controller.js L15）。角色鉴权发生在**中间件层**而非 token 层：`protect` 验签后用 id 从 DB 捞出用户文档（auth.middleware.js L12-17），`authorizeRoles` 再读该文档的 `role` 字段做比对（L36）——即角色以数据库实时值为准，token 只是身份指针（这也是 faculty `isApproved` 能每请求生效、而学生 `isBanned` 不在 protect 复查的原因，见 PS-R2-10）。

2. **Q1 → PS-R3-02**（回引 PS-R1-20；PS-R2-10）：若同一 ObjectId 理论上跨集合存在，`protect` 的链式 `||` 按 Student → Faculty → Hod → Admin **短路**（auth.middleware.js L14-17），先命中的集合生效、后续集合完全被遮蔽。例：某 id 同时存在于 Student 与 Hod，则该 token 一律被当作 Student 文档（`role='student'`），hod 组路由被 `authorizeRoles` 拒 403、student 组放行——角色解析结果由**查找顺序**决定，与登录时选择的 role 无关（登录侧 role 只决定 `getModelByRole` 查哪个集合做密码比对，auth.controller.js L219-224）。ObjectId 的生成机制使真实碰撞概率可忽略，但这是设计上的隐式依赖。

3. **Q2 → PS-R3-03**（回引 PS-R1-06、PS-R1-15；PS-R2-03）：`'HOD Approved'` 判定为**死状态（历史兼容残留）**。字符串字面量出现位置全清单：Proposal.model.js L70（enum 声明）；hod.controller.js L31（dashboard `$in` 查询）、L71（`getAllProjects` 的 approved 过滤 `$in`）、L287（`assignFacultyToProposal` 前置白名单）；admin.controller.js L56（`countDocuments` 统计）；emailTemplates.js L209 只是注释文字「// 3. HOD Approved proposal」，非比较/写入。**无写入点**：全仓库不存在任何把 `status` 赋值为 `'HOD Approved'` 的代码——`approveProposal` 实际写的是 `'Pending Faculty Assignment'` 或 `'Faculty Assigned'`（PS-R1-05），即便它无状态前置（PS-R2-03）也永远不会产出该值。读侧仍引用它，说明是早期「先批准后分配」两段式流程的残留。

4. **Q3 → PS-R3-04**（回引 PS-R1-22、PS-R1-23；PS-R2-01）：硬编码 60 与 `maxStudents` 的关系是「字段存在但阻断逻辑不读它」：`Faculty.model.js` L24 定义 `maxStudents` 默认 60；三处展示函数用 `f.maxStudents || 60`（PS-R1-23）；而阻断性检查**不只 approve 时有**——`approveProposal`（hod.controller.js L216-222）与 `assignFacultyToProposal`（L295-301）**两处都检查**，且判定式 `current + incoming > 60` 写死字面量 60。后果：若管理员把某 faculty 的 `maxStudents` 改为非 60，展示口径与阻断口径立即不一致（前端兜底也不统一：FacultyDashboard 用 `|| 60`，AdminDashboard L766/L786 用 `|| 5`）。统计 status 集合为 `{'Faculty Assigned','Faculty Accepted','Submitted'}`，**不含任何 Pending 类状态**（`Pending HOD Review`/`Pending Faculty Assignment` 均不计入）。另注意 PS-R2-01 的绕过路径使这两处检查整体失效。

5. **Q4 → PS-R3-05**（回引 PS-R1-01、PS-R1-14；PS-R2-15）：终稿 Accepted 后主 status **不会**变成 Completed 类值——8 个枚举里根本没有 Completed（PS-R1-01），`approveFinalSubmission` 显式保持 `'Submitted'` 作为终态（faculty.controller.js L253，PS-R1-14）。学生**不能**再改 targets/timeline，依据的 if 守卫均为 `if (proposal.finalSubmission?.status === 'Accepted') return 400`：`addProjectTarget`（student.controller.js L369-371）、`updateProjectTarget`（L387-389）、`addTimelineUpdate`（L494-496）；同款守卫还见于 `updateProposal` L167、`uploadFile` L253、`requestDeadlineExtension` L542、`markDeadlineSubmitted` L594。

6. **Q4 → PS-R3-06**（回引 PS-R1-14；PS-R2-02、PS-R2-03、PS-R2-15）：但 Accepted 全局锁**只覆盖学生侧全部写操作与 faculty 侧大部分函数**，仍有三处漏网可对已完成项目产生写：`faculty.updateProgress`（faculty.controller.js L298-312，路由仍挂载于 faculty.routes.js L17）、`hod.approveProposal`、`hod.rejectProposal`（均无 Accepted 锁，PS-R2-15/02/03）。即「学生不可再改」成立，「项目不可再被任何人改」不成立。

7. **Q5 → PS-R3-07**（回引 PS-R1-03、PS-R1-09、PS-R1-15、PS-R1-16；验证对象 PS-R2-01）：选 Round 2 最高严重度条目 **PS-R2-01**（高）。最小复现（账号：学生 S 已验证邮箱；Faculty F 已 `isApproved` 以通过 `authorizeRoles`，PS-R1-20）：
   1. S 调 `POST /api/student/proposal`（合法标题/描述）→ 201；期望 `status='Pending HOD Review'`（PS-R1-03）。
   2. S 调 `POST /api/student/faculty/request/<F._id>` → 200；期望 `supervisorRequested=true`、`assignedFaculty=F._id`、`status` 仍为 `'Pending HOD Review'`（PS-R1-16）。
   3. F 调 `PUT /api/faculty/proposals/<proposalId>/accept` → 200；期望 `status='Faculty Accepted'`、`facultyReview.action='Accepted'`（PS-R1-09）。
   观测链：`Pending HOD Review →（占位不变）→ Faculty Accepted`；全程无 `Pending Faculty Assignment`/`Faculty Assigned`，`hodReview` 为空，容量检查（PS-R1-22）与部门校验（PS-R2-05）均未执行。该链与 Round 1 迁移表第 7 行「任意状态（assignedFaculty 匹配）→ Faculty Accepted | faculty.acceptProposal L133」（PS-R1-15）**完全一致**——既非 R1 遗漏、也非 R2 误判，PS-R2-01 判定维持「高」。

8. **Q6 → PS-R3-08**（回引 PS-R1-18、PS-R1-19、PS-R1-21；PS-R2-06、PS-R2-09、PS-R2-10）：产品后果有四层：① accessToken 1 小时过期（PS-R1-18）后，后端没有任何端点接受 refreshToken 换新（PS-R1-21、PS-R2-09），前端响应拦截器对任意 401 一律 `localStorage.removeItem('user')` 并跳 `/login`（api.js L37-40）——**全体用户每小时被强制重新登录**，7 天 refresh 设计完全空转，cookie 每次随 `withCredentials` 发出却无任何消费者（PS-R1-19）；② 401 一刀切把非过期类 401（如 `protect` 查不到人返回的 'user not found'，auth.middleware.js L18-20）也当成会话失效，偶发 DB 抖动即踢人；③ 意外的正面效果：被封禁学生的已签发 token 最长 1 小时自然死亡，PS-R2-10 的封禁滞后窗口因此被锁死在 1h 内；④ 因无 refresh 轮换做缓冲，accessToken 又存于 localStorage，一旦 XSS（PS-R2-06）被盗即在被盗窗口内完全冒用。

### 跨轮冲突清单

| 冲突编号对 | 冲突点 | 以哪次重读源码为准 | 最终判定 |
| --- | --- | --- | --- |
| PS-R1-15 ↔ PS-R2-03 | R1 迁移表把 `hod.approveProposal` 的源状态画成仅以 `Pending HOD Review` 为起点；R2-03 指出该函数无状态前置、可从任意状态（含 `Submitted`、终稿 Accepted）触发 | 以本轮重读 hod.controller.js L202-253 为准（与 PS-R2-03 一致；且 R1 正文 PS-R1-05 本就注明「没有前置 status 校验」，仅表格行未泛化） | 非实质矛盾：PS-R1-15 描述名义主流程，PS-R2-03 是攻击面泛化；迁移表相应两行应按「任意状态 → Pending Faculty Assignment / Faculty Assigned」理解 |

除上表外，Round 1 与 Round 2 之间未发现其他相互矛盾的结论。

### 本轮编号索引

- **PS-R3-01**：accessToken payload 仅 `{id}` 不含 role；角色鉴权在 `authorizeRoles` 中间件层、以 DB 文档 role 为准（Q1）。
- **PS-R3-02**：同 ObjectId 跨集合时 `protect` 按 Student→Faculty→Hod→Admin 短路，先命中者遮蔽其余（Q1）。
- **PS-R3-03**：`'HOD Approved'` 为死状态/历史残留，仅 4 处读取 + 1 处注释，无写入点（Q2）。
- **PS-R3-04**：阻断性容量检查在 approve 与 assign 两处都有、写死 60 不读 `maxStudents`；统计口径不含 Pending 类状态（Q3）。
- **PS-R3-05**：终稿 Accepted 后主 status 保持 `'Submitted'`（无 Completed）；学生改 targets/timeline 被各函数 Accepted 守卫拦截（Q4）。
- **PS-R3-06**：Accepted 锁漏网三处（faculty.updateProgress、hod.approveProposal、hod.rejectProposal），项目仍可被 faculty/HOD 写（Q4）。
- **PS-R3-07**：PS-R2-01 最小复现三步，与 R1 迁移表完全一致，R2 判定成立维持「高」（Q5）。
- **PS-R3-08**：无 refresh 端点 + 前端 401 一刀切 = 每小时强制重登、refresh 空转、误踢与 XSS 盗 token 无缓冲（Q6）。

### 三轮追溯摘要

| Round1编号 | Round2编号 | Round3编号 |
| --- | --- | --- |
| PS-R1-09（acceptProposal 无状态前置） | PS-R2-01（绕过 HOD 审批，高） | PS-R3-07（最小复现验证成立） |
| PS-R1-16 / PS-R1-17（assignedFaculty 写入链） | PS-R2-05（跨系指导关系，中） | PS-R3-07（复现第 2 步占位行为） |
| PS-R1-22 / PS-R1-23（容量口径与写死 60） | PS-R2-01（容量检查被绕过） | PS-R3-04（两处阻断检查与 maxStudents 关系澄清） |
| PS-R1-18 / PS-R1-19 / PS-R1-21（token 签发与存储） | PS-R2-09 / PS-R2-10（refresh 死代码、封禁滞后） | PS-R3-01 / PS-R3-02 / PS-R3-08（Q1 角色解析层、Q6 产品后果） |
| PS-R1-14（终稿 Accepted 全局锁） | PS-R2-15（锁漏网三处，低） | PS-R3-05 / PS-R3-06（Q4 守卫清单与反例） |
| PS-R1-06（HOD Approved 死状态） | —（R2 未单独立条，最近相关 PS-R2-03） | PS-R3-03（字面量全清单与「无写入点」终判） |
