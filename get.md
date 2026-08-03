## Round 1 - 逻辑解释

| 源码文件路径 | 本轮涉及的核心导出符号（函数/中间件/字段） |
| --- | --- |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | `projectProposalSchema`；主字段 `status`（枚举 L65-L78）；`finalSubmission.status`（枚举 L31-L35）；`assignedFaculty`（L86）；`supervisorRequested`（L64）；`submissionHistory`、`timeline` |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | `submitProposal`（L92-L160）、`updateProposal`（L162-L242）、`requestSupervisor`（L326-L352）、`submitFinalProject`（L402-L459）、`getAvailableFaculty`（L294-L324）、`addTimelineUpdate`（L489-L535） |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | `approveProposal`（L202-L253）、`rejectProposal`（L255-L276）、`assignFacultyToProposal`（L278-L319）、`updateProjectSubmission`（L450-L537）、`getHodDashboard`（L16-L60）、`getFacultyWorkload`（L133-L153）、`getApprovedFacultyList`（L181-L200） |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | `acceptProposal`（L129-L151）、`rejectProposal`（L154-L178）、`approveFinalSubmission`（L240-L275）、`rejectFinalSubmission`（L181-L237）、`getFacultyDashboard`（L12-L126） |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | `generateTokens`（L14-L18）、`login`（L209-L267）、`registerStudent`/`registerFaculty`、`verifyOTP`、`getModelByRole`（L20-L28） |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | `protect`（L7-L29）、`authorizeRoles`（L31-L46） |
| [student.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/student.routes.js) | 路由级 `protect`+`authorizeRoles('student')`（L13-L14）；`POST /proposal`（L18）、`POST /faculty/request/:facultyId`（L28）、`POST /submit-final`（L34） |
| [hod.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/hod.routes.js) | `authorizeRoles('hod','admin')`（L13）；`PUT /proposals/:id/approve`（L24）、`/reject`（L25）、`/assign`（L26）、`/submission`（L29） |
| [faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js) | `authorizeRoles('faculty','hod')`（L11）；`PUT /proposals/:id/accept`（L14）、`/reject`（L15）、`/approve-submission`（L19）、`/reject-submission`（L18） |
| [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) | `POST /login`（L19）、`GET /me`（L25-L27）；全表无 `/refresh` 路由 |
| [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) | axios 实例（L14-L18）、请求拦截器注入 Bearer（L21-L31）、响应拦截器 401 登出（L34-L43） |

1. **PS-R1-01**：主字段 `status` 的枚举共 8 个值，模型默认值为 `'Pending HOD Review'`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L65-L78) 的 `status` 定义，枚举依次为 `Pending HOD Review`、`Pending Faculty Assignment`、`HOD Approved`、`Rejected (HOD)`、`Faculty Assigned`、`Faculty Accepted`、`Rejected (Faculty)`、`Submitted`。

2. **PS-R1-02**：嵌套 `finalSubmission.status` 的枚举共 5 个值，默认 `'Not Submitted'`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L26-L37) 的 `finalSubmission` 子文档，枚举为 `Not Submitted`、`Under HOD Review`、`Under Faculty Review`、`Accepted`、`Rejected`。

3. **PS-R1-03**：主 `status` 的可达写入路径如下——学生 `submitProposal` 以默认值建单为 `Pending HOD Review`；HOD `approveProposal` 在不带 `facultyId` 时写 `Pending Faculty Assignment`，带 `facultyId` 时直接写 `Faculty Assigned`；HOD `rejectProposal` 写 `Rejected (HOD)`；HOD `assignFacultyToProposal` 写 `Faculty Assigned`；导师 `acceptProposal` 写 `Faculty Accepted`；导师 `rejectProposal` 写 `Rejected (Faculty)` 并清空 `assignedFaculty`；学生 `submitFinalProject` 写 `Submitted`；终稿被 HOD 或导师驳回时 `updateProjectSubmission`/`rejectFinalSubmission` 把主状态回退为 `Faculty Accepted`；学生 `updateProposal`（仅在被拒后）把状态重置回 `Pending HOD Review`。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L147-L153) `submitProposal`、[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L234-L235) `updateProposal`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L231) `approveProposal`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L259-L262) `rejectProposal`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L303-L305) `assignFacultyToProposal`、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L131-L135) `acceptProposal`、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L158-L162) `rejectProposal`、[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L434-L442) `submitFinalProject`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L511-L514) `updateProjectSubmission`、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L215-L218) `rejectFinalSubmission`。

4. **PS-R1-04**：`finalSubmission.status` 的可达写入路径为——建单默认 `Not Submitted`；学生 `submitFinalProject` 写 `Under HOD Review`；HOD `updateProjectSubmission` 在 `status==='Under Faculty Review'` 时写 `Under Faculty Review`（转发给导师），在 `status==='Rejected'` 时写 `Rejected`；导师 `rejectFinalSubmission` 写 `Rejected`；导师 `approveFinalSubmission` 写 `Accepted`。注意不存在把 `Under HOD Review` 直接写为 `Accepted` 的路径，HOD 只能转发或驳回。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L434-L442)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L467-L514)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L215-L218)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L252-L254)。

5. **PS-R1-05**：枚举值 `'HOD Approved'` 是“死状态”——它出现在 schema 枚举里，也被仪表盘查询和 `assignFacultyToProposal` 的前置条件引用，但在本轮所读控制器中没有任何函数把 `status` 写成 `'HOD Approved'`；`approveProposal` 不带教师时写的是 `'Pending Faculty Assignment'` 而非它。证据：枚举见 [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L67-L77)；读取/前置条件见 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L30-L33) `getHodDashboard`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L287-L289) `assignFacultyToProposal`；`approveProposal` 实际写入值见 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L228)。

6. **PS-R1-06**：学生 `requestSupervisor` 在“无 proposal→400、已有 `assignedFaculty`→400、`supervisorRequested` 已为 true→400、找不到教师→404”之后，直接把 `supervisorRequested` 置 true 并把 `assignedFaculty` 写成所请教师（注释标明“requested supervisor”），但**不改动主 `status`、不校验教师是否 `isApproved`、不校验院系、不做容量校验**。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L326-L352) `requestSupervisor`（写入在 L337-L339）。

7. **PS-R1-07**：HOD `approveProposal` 的真实条件顺序为——按 id 找 proposal；默认 `updatedStatus='Pending Faculty Assignment'`、`assignedFaculty=undefined`；**仅当请求体带 `facultyId`** 时才查教师并校验 `isApproved`、做 60 人容量校验，通过则把 `updatedStatus` 改为 `'Faculty Assigned'` 并记录 `assignedFaculty`；最后无条件 `proposal.status = updatedStatus`，且只有 `assignedFaculty` 非 undefined 时才覆盖 `proposal.assignedFaculty`。关键副作用：该函数**不检查 proposal 当前状态**，且当不带 `facultyId` 时不会清空学生之前通过 `requestSupervisor` 写入的 `assignedFaculty`，可能出现 `status='Pending Faculty Assignment'` 却仍挂着所请教师的不一致。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L202-L231) `approveProposal`。

8. **PS-R1-08**：HOD `assignFacultyToProposal` 的前置条件比 `approveProposal` 严：终稿未 `Accepted`，且主状态必须属于 `'HOD Approved'`、`'Rejected (Faculty)'`、`'Pending Faculty Assignment'` 三者之一；随后校验教师 `isApproved` 与 60 人容量，通过后写 `assignedFaculty=facultyId`、`status='Faculty Assigned'`。由于 `'HOD Approved'` 无写入路径，真正可进入该分支的常态只有 `'Pending Faculty Assignment'`（无教师批准）与 `'Rejected (Faculty)'`（导师拒后重新分配）。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L278-L305) `assignFacultyToProposal`。

9. **PS-R1-09**：导师 `acceptProposal` 用 `findOneAndUpdate({ _id, assignedFaculty: req.user._id }, { status:'Faculty Accepted', ... })` 直接改状态，**除“归属该导师”外没有任何主状态前置校验**，也没有容量校验；这意味着若某 proposal 因 `requestSupervisor` 已挂到该导师且尚未经 HOD 批准，理论上可被导师直接接受（绕过 HOD 审批），只是仪表盘 UI 默认只把 `'Faculty Assigned'` 列为待处理。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L129-L151) `acceptProposal`，UI 过滤见 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L19-L21) `getFacultyDashboard`。

10. **PS-R1-10**：导师 `rejectProposal` 把主状态置为 `'Rejected (Faculty)'`，同时把 `assignedFaculty` 置为 `null`（但未复位 `supervisorRequested`），从而使该 proposal 重新进入 HOD 的 `assignFacultyToProposal` 可分配集合。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L154-L178) `rejectProposal`（更新在 L158-L162）。

11. **PS-R1-11**：`generateTokens(id)` 生成两枚 JWT，payload 均只含 `{ id }`（不含 role）；access token 用 `JWT_SECRET`、有效期 `1h`，refresh token 用 `JWT_REFRESH_SECRET`、有效期 `7d`。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L14-L18) `generateTokens`。

12. **PS-R1-12**：`login` 按 body 里的 `role` 选择模型（student/faculty/hod/admin），依次校验邮箱存在、邮箱已验证、教师需 `isApproved`、学生未被封禁、bcrypt 密码匹配；通过后生成双 token，把 refresh token **bcrypt 哈希后存入对应用户文档的 `refreshToken` 字段**，并通过 `Set-Cookie` 写入名为 `refreshToken` 的 httpOnly cookie（生产环境 secure，7 天）；响应体 JSON 只返回 `_id/name/email/role/accessToken`，**不返回 refresh token**。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L209-L267) `login`（token 与存储 L249-L259，响应 L262），模型选择见 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L20-L28) `getModelByRole`。

13. **PS-R1-13**：`protect` 从 `Authorization: Bearer` 头取 access token，用 `JWT_SECRET` 验证（即只认 access token），解码得到 `id` 后**依次尝试 Student→Faculty→Hod→Admin** 四个模型查库，命中即挂到 `req.user`（剔除 password），查不到或验证失败返回 401；因此 access token 本身不带 role，角色由查中的模型/文档决定。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L7-L29) `protect`。

14. **PS-R1-14**：`authorizeRoles(...roles)` 校验 `req.user.role` 是否在白名单，否则 403；并对 `faculty` 额外检查 `isApproved`，未批准返回 403。三类路由分别绑定：学生路由 `('student')`、HOD 路由 `('hod','admin')`、导师路由 `('faculty','hod')`（即 HOD 也可调用导师侧接口）。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L31-L46) `authorizeRoles`；绑定见 [student.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/student.routes.js#L13-L14)、[hod.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/hod.routes.js#L12-L13)、[faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js#L10-L11)。

15. **PS-R1-15**：前端把登录返回的用户对象（含 `accessToken`）整体存 `localStorage`，axios 请求拦截器每次从 `localStorage.user` 读取并注入 `Authorization: Bearer <accessToken>`，`withCredentials:true` 使 httpOnly refresh cookie 也会随请求发送；但响应拦截器在收到 401 时只是 `localStorage.removeItem('user')` 并跳转 `/login`，**没有任何用 refresh cookie 换新 access token 的逻辑**，且 [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js#L14-L28) 也不存在 `/refresh` 端点。因此实际效果是 access token 1 小时过期即被强制登出，refresh token 虽签发并落库/种 cookie 却未被使用。证据：[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js#L14-L43)。

16. **PS-R1-16**：导师容量“硬校验”只在两个写函数触发——HOD `approveProposal`（带 `facultyId` 时）与 HOD `assignFacultyToProposal`；两者都统计该教师名下 `status` 属于 `['Faculty Assigned','Faculty Accepted','Submitted']` 的 proposal，以 `1 + teamMembers.length` 累加学生数，再加本次项目人数，若超过 **写死的 60** 则 400 拒绝。注意这里的 60 是字面量，并**未读取 `Faculty.maxStudents`**。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L215-L222) `approveProposal` 容量段、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L294-L301) `assignFacultyToProposal` 容量段。

17. **PS-R1-17**：容量统计口径统一为 `assignedFaculty = 该教师` 且 `status ∈ {Faculty Assigned, Faculty Accepted, Submitted}` 的 proposal，按“队长 1 人 + 每名 `teamMembers` 1 人”计学生数（不是项目数）；`Rejected (Faculty)` 因被清空 `assignedFaculty` 不再计入，`Pending HOD Review`/`Pending Faculty Assignment`/`HOD Approved`/`Rejected (HOD)` 均不计入。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L216-L218)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L295-L297)，学生侧展示口径相同见 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L300-L307)。

18. **PS-R1-18**：容量“只读展示”出现在学生 `getAvailableFaculty`、HOD `getFacultyWorkload`、HOD `getApprovedFacultyList`，这三处用的是 `faculty.maxStudents || 60`（尊重教师个人上限，缺省 60）；而真正拦截写入的两处却硬编码 60，二者口径不一致。此外学生 `requestSupervisor` 与导师 `acceptProposal` 均**不做任何容量校验**，因此可绕过 HOD 分配时的 60 人限制。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L299-L316)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L136-L148)、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L184-L195)，对比 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L220-L222) 与 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L299-L301) 的硬编码 60。

### 本轮编号索引

- PS-R1-01：主 `status` 共 8 个枚举值，默认 `Pending HOD Review`。
- PS-R1-02：`finalSubmission.status` 共 5 个枚举值，默认 `Not Submitted`。
- PS-R1-03：主状态从提交到终稿的完整可达迁移链及各写入函数。
- PS-R1-04：终稿子状态从 `Not Submitted`→`Under HOD Review`→`Under Faculty Review`/`Rejected`→`Accepted`/回退的写入链。
- PS-R1-05：`HOD Approved` 是有读取/前置条件但无任何写入路径的死状态。
- PS-R1-06：`requestSupervisor` 提前写入 `assignedFaculty`，不改状态、不校验审批/院系/容量。
- PS-R1-07：`approveProposal` 按是否带 `facultyId` 分叉到 `Pending Faculty Assignment` 或 `Faculty Assigned`，无状态前置且不清空旧 `assignedFaculty`。
- PS-R1-08：`assignFacultyToProposal` 要求状态为 `HOD Approved`/`Rejected (Faculty)`/`Pending Faculty Assignment`，校验后写 `Faculty Assigned`。
- PS-R1-09：`acceptProposal` 仅校验归属，不校验主状态，存在绕过 HOD 直接接受的路径。
- PS-R1-10：导师 `rejectProposal` 置 `Rejected (Faculty)` 并清空 `assignedFaculty`。
- PS-R1-11：`generateTokens` 双 token payload 仅 `{id}`，access 1h / refresh 7d，密钥不同。
- PS-R1-12：登录把 refresh 哈希存库并种 httpOnly cookie，响应体只回 access token。
- PS-R1-13：`protect` 用 access token 解出 id 后跨四模型查库确定 `req.user`，失败即 401。
- PS-R1-14：`authorizeRoles` 做角色白名单 + 教师 `isApproved` 校验，三类路由绑定不同角色。
- PS-R1-15：前端 access token 存 localStorage 并注入头，401 直接登出；无刷新逻辑、后端无 `/refresh`，refresh token 实际未被使用。
- PS-R1-16：容量硬校验仅在 `approveProposal`/`assignFacultyToProposal`，上限写死 60。
- PS-R1-17：容量统计口径为 `Faculty Assigned/Faculty Accepted/Submitted`，按队长+队员数计。
- PS-R1-18：展示接口用 `maxStudents||60`，与写入处硬编码 60 不一致；`requestSupervisor`/`acceptProposal` 无容量校验。

## Round 2 - 潜在风险

| 源码文件路径 | 本轮涉及的核心导出符号（函数/中间件/字段） |
| --- | --- |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | 复用 R1：`status`、`finalSubmission.status`、`assignedFaculty`、`supervisorRequested`、`timeline`、`progress` |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | 复用 R1：`requestSupervisor`、`submitFinalProject`、`addTimelineUpdate`、`uploadFile` |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | 复用 R1：`approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、`getHodDashboard` |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | 复用 R1：`acceptProposal`、`rejectProposal`、`approveFinalSubmission`、`rejectFinalSubmission` |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | 复用 R1：`login`、`generateTokens`、`registerStudent`、`forgotPassword`、`verifyResetOtp`、`resetPassword`、`shouldSkipEmailVerification` |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | 复用 R1：`protect`、`authorizeRoles` |
| [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) | 复用 R1：路由表（确认无 `/refresh`、无 `/logout`） |
| [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) | 复用 R1：401 拦截器 |
| [upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js) | **本轮新读**：`upload`（multer 配置，L22-L25），`storage`（L11-L20） |
| [localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js) | **本轮新读**：`UPLOAD_ROOT`（L6）、`toPublicUrl`（L23-L27）、`deleteLocalFile`（L30-L39）、`pickUploadSubdir`（L41-L49） |
| [index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) | **本轮新读**：`app.use('/uploads', express.static(UPLOAD_ROOT))`（L35）、CORS 配置（L20-L29） |
| [Student.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Student.model.js) | **本轮新读**：`isBanned`、`banReason`、`otpAttempts`（L13-L25） |

1. **PS-R2-01**：回引 PS-R1-06、PS-R1-09 — 风险标题「学生自选导师 + 导师无状态前置校验 = 绕过 HOD 审批链」。**严重度：中**。触发条件：任意已登录学生对一条仍处于 `Pending HOD Review` 的 proposal 调用 `POST /api/student/faculty/request/:facultyId`，把目标教师写入 `assignedFaculty`；该被选教师随后调用 `PUT /api/faculty/proposals/:id/accept` 即可把 proposal 直接改成 `Faculty Accepted`。因 `acceptProposal` 仅按 `{_id, assignedFaculty:req.user._id}` 匹配而不校验当前 `status`，且 `requestSupervisor` 不校验教师 `isApproved`/院系/状态，整条 HOD 审批环节可被跳过；唯一缓解是仪表盘 `pendingProposals` 只列 `Faculty Assigned`，属 UI 层隐藏而非服务端拦截。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L326-L352) `requestSupervisor`（写 assignedFaculty 在 L337-L339）、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L129-L136) `acceptProposal`。

2. **PS-R2-02**：回引 PS-R1-07、PS-R1-08 — 风险标题「HOD 写接口完全不校验 proposal.department，存在跨部门越权写」。**严重度：高**。触发条件：任一已登录 HOD（账号绑定单一 `department`）只要知道（或枚举）其它部门 proposal 的 `_id`，即可调用 `PUT /api/hod/proposals/:id/approve|reject|assign` 操作他部门提案。`approveProposal`、`rejectProposal`、`assignFacultyToProposal` 均直接 `findById` 后写入，没有 `department: req.user.department` 过滤；对比读路径 `getHodDashboard`/`getAllProjects` 都带 `department: dept`，写读授权不一致。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L202-L231) `approveProposal`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L255-L263) `rejectProposal`、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L278-L305) `assignFacultyToProposal`，对比读过滤 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L27-L33)。

3. **PS-R2-03**：回引 PS-R1-07 — 风险标题「approveProposal 不校验当前状态且可跨状态覆盖，可把已提交/已完成提案打回」。**严重度：中**。触发条件：HOD 对任意非终稿 Accepted 的 proposal 调 approve（不带 facultyId），会无条件把 `status` 改成 `Pending Faculty Assignment`，能把已经是 `Faculty Accepted`/`Submitted` 的提案强行回退（终稿 Accepted 有专门拦截，但 `Submitted` 且尚未 Accepted 的可被回退）。与 `assignFacultyToProposal` 有状态白名单不同，approve 没有任何当前状态断言。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L231)（无 status 前置判断，直接 `proposal.status = updatedStatus`）。

4. **PS-R2-04**：回引 PS-R1-11、PS-R1-15 — 风险标题「无 refresh 端点、无 logout 端点，refreshToken 为死凭证且无法吊销」。**严重度：中**。触发条件：登录后服务端签发并哈希落库 refresh、种 httpOnly cookie，但 [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js#L14-L28) 没有 `/refresh` 也没有 `/logout`；access token 一旦签发在 1 小时内无法作废，改密/封号也不会使既有 access 失效（见 PS-R2-05），refresh 哈希长期留库无法主动清除。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L249-L259) 签发与落库、[auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js#L14-L28) 路由表。

5. **PS-R2-05**：回引 PS-R1-13、PS-R1-14 — 风险标题「isBanned 仅在 login 检查，protect/authorizeRoles 不复查，封禁后 token 仍可用最长 1 小时」。**严重度：中**。触发条件：学生被 `toggleStudentBan` 封禁后，若其此前已登录并持有有效 access token，在 token 过期前仍可访问所有学生接口；`protect` 只按 id 查库挂 `req.user`，`authorizeRoles` 只看 role 和 faculty.isApproved，均未判断 `isBanned`。教师无 `isBanned` 字段，`rejectFaculty` 只是 `isApproved:false`，但 access 在过期前同样可用（authorizeRoles 会在每次请求复查 isApproved，故教师侧无此问题；学生侧 isBanned 不被复查）。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L7-L45)、登录检查 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L238-L241)、学生字段 [Student.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Student.model.js#L24-L25)。

6. **PS-R2-06**：回引 PS-R1-12 — 风险标题「离线/邮件失败时注册接口在响应体回传明文 OTP」。**严重度：中**（开发便利但生产配置不当会泄露）。触发条件：当 `SKIP_EMAIL_VERIFICATION=true`、`LOCAL_OFFLINE=true` 或 SMTP 不可用时，`registerStudent`/`registerFaculty` 在 JSON 响应里附带 `otp` 明文，`forgotPassword` 在邮件发送失败时也返回 `otp`。任何能调用注册/忘记密码接口者都能直接拿到验证码完成账号核验或重置流程前置。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L88-L97)（注册回传 otp）、[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L292-L299)（forgotPassword 回传 otp）、离线判定 L31-L34。

7. **PS-R2-07**：回引 PS-R1-13（protect 用 access token）— 风险标题「重置密码 OTP 无尝试次数限制，可暴力枚举」。**严重度：中**。触发条件：`verifyOTP`（注册邮箱验证）有 `otpAttempts>=5` 锁定与失败自增，但 `verifyResetOtp` 只校验过期和 bcrypt 比对，**不读取、不自增 `otpAttempts`**，且 `forgotPassword` 每次都覆盖 `otpHash/otpExpiry` 而不复位计数；攻击者可对 6 位 OTP 在 10 分钟有效期内无限次尝试。证据：注册验证加锁 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L184-L193)，重置验证无计数 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L307-L335) `verifyResetOtp`。

8. **PS-R2-08**：回引 PS-R1-02、PS-R1-04 — 风险标题「multer 无 fileFilter，任意类型文件可上传，类型仅按客户端 mimetype/扩展名归类」。**严重度：中**。触发条件：`upload` 仅设 50MB 体积限制，没有 `fileFilter` 或魔数校验；`pickUploadSubdir` 完全信任 `file.mimetype` 与 `originalname` 后缀来决定子目录，攻击者可把可执行/HTML/SVG 等伪装成图片或文档上传。结合 PS-R2-09 的静态托管，上传的 HTML/SVG 可能被浏览器直接渲染（存储型 XSS/钓鱼载体，取决于 `Content-Type` 嗅探）。证据：[upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js#L22-L25)、[localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js#L41-L49) `pickUploadSubdir`。

9. **PS-R2-09**：回引 PS-R1-13（protect 是唯一鉴权）— 风险标题「/uploads 以 express.static 裸挂载，任何人可未授权下载，且无路径/权限控制」。**严重度：中**。触发条件：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js#L35) 在所有 `protect` 路由之前以 `app.use('/uploads', express.static(UPLOAD_ROOT))` 公开整个上传目录；学生简历、报告、PPT、头像均落在 `UPLOAD_ROOT` 下，文件名仅 `时间戳_清洗后原名`（可猜测/可被列表页泄露 URL），任何人无需登录即可下载，存在简历等个人信息泄露。缓解：`deleteLocalFile` 有 `target.startsWith(UPLOAD_ROOT)` 防目录穿越，static 本身对 `..` 有归一化，但未授权访问本身成立。证据：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js#L35)、文件名生成 [upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js#L16-L19)、[localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js#L30-L39)。

10. **PS-R2-10**：回引 PS-R1-15（withCredentials:true）— 风险标题「CORS 实际反射任意来源，配合 credentials 构成宽松跨域配置」。**严重度：低**。触发条件：CORS `origin` 回调里无论 origin 是否在 `allowedOrigins`，最后都 `callback(null, true)`，即任意站点都被允许携带凭证跨域访问 API。当前 access token 放在 localStorage、由前端手动加头（不会被跨域自动携带），主要风险面在 httpOnly refresh cookie（但无 refresh 端点，见 PS-R2-04），故影响降级；一旦未来加入 cookie 鉴权端点即升级为高危。证据：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js#L20-L29)。

11. **PS-R2-11**：回引 PS-R1-03、PS-R1-04 — 风险标题「终稿通过后 status 仍停留在 Submitted，终稿状态散落在两个字段，前端易判错完成态」。**严重度：中**。触发条件：导师 `approveFinalSubmission` 把 `finalSubmission.status='Accepted'`，但**显式把主 `status` 保持为 `Submitted`**（注释“since it's finalized”）。系统其它写操作多用 `finalSubmission.status==='Accepted'` 作为“已完成/锁死”判据，而仪表盘统计、列表筛选却以主 `status` 为准；两个字段并存且无统一终态，前端若只看 `status==='Submitted'` 会把“待 HOD/导师终审的提交”和“已通过的终稿”混为一谈，造成“界面以为已完成/实际仍可改”或反之。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L252-L254)、锁死判据遍布 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L408-L416) `submitFinalProject`，统计口径 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L44)。

12. **PS-R2-12**：回引 PS-R1-04、PS-R1-03 — 风险标题「终稿驳回后只回退主 status，finalSubmission 残留 Rejected 与历史链接，重提依赖整对象覆盖」。**严重度：中**。触发条件：HOD `updateProjectSubmission` 与导师 `rejectFinalSubmission` 驳回时把主 `status` 回退为 `Faculty Accepted`、写 `finalSubmission.status='Rejected'` 与 `rejectionReason`，但**未清空 liveLink/githubLink/submittedAt**；学生再次 `submitFinalProject` 时用整个新对象覆盖 `finalSubmission` 才清除旧值。若学生在驳回后走了其它只改部分字段的路径，或前端依据残留 `submittedAt` 渲染，会出现“已提交时间仍在但状态为 Rejected/Faculty Accepted”的不一致显示；且驳回后主状态回到 `Faculty Accepted` 但 `progress` 仍为 100，可反复重提。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L497-L514)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L200-L218)、覆盖写入 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L434-L442)。

13. **PS-R2-13**：回引 PS-R1-03（timeline→progress 映射）— 风险标题「addTimelineUpdate 不校验 timeline 顺序，可一步把 progress 刷到 100 直接解锁终稿」。**严重度：中**。触发条件：学生可调用 `POST /api/student/proposal/timeline` 任意推送五个状态之一，代码不检查是否已存在前置节点、不限制顺序；直接提交 `PROJECT COMPLETE` 或 `PROJECT SUBMITTED` 即可把 `progress` 置 100，从而满足 `submitFinalProject` 与 `uploadFile` 的 `progress>=100` 前置，绕过“STARTED→PROTOTYPE→REPORT→COMPLETE”的过程控制。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L489-L517) `addTimelineUpdate`（progressMap 在 L506-L515），解锁判据 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L414-L416) 与 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L259-L261)。

14. **PS-R2-14**：回引 PS-R1-06、PS-R1-10 — 风险标题「requestSupervisor 以 assignedFaculty 作‘已请求’判据，与导师清空 assignedFaculty 的拒接逻辑相互干扰」。**严重度：低**。触发条件：学生 `requestSupervisor` 同时置 `supervisorRequested=true` 与 `assignedFaculty=facultyId`，并用 `if(assignedFaculty) return‘已分配’` 拦截重复请求；导师 `rejectProposal` 会把 `assignedFaculty=null` 但**不复位 `supervisorRequested`**。若出现“学生请求→教师在提案阶段拒接”的路径（结合 PS-R2-01 这是可能的），`assignedFaculty` 被清空而 `supervisorRequested` 仍为 true，学生既不能重新请求导师（被 supervisorRequested 拦截），状态也未定义，需要 HOD 介入；字段语义重叠导致状态机卡死。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L331-L339)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L158-L162)。

15. **PS-R2-15**：回引 PS-R1-09、PS-R1-14 — 风险标题「faculty 路由允许 hod 角色，叠加 acceptProposal 仅按 assignedFaculty 匹配，存在越权语义缺口」。**严重度：低**。触发条件：[faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js#L10-L11) 用 `authorizeRoles('faculty','hod')`，HOD 可调用导师侧所有接口；`acceptProposal`/`approveFinalSubmission` 等用 `assignedFaculty: req.user._id` 限定，正常 HOD 的 `_id` 不会出现在某 proposal 的 `assignedFaculty`（指向 Faculty 集合），故实际命中概率低，但角色边界被放宽——一旦后续出现 ID 重合或把 HOD 兼导师的数据，会让 HOD 直接以“导师”身份通过终稿，绕过 HOD 本人的 `updateProjectSubmission` 流程。证据：[faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js#L10-L19)、[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L240-L254)。

### 本轮编号索引

- PS-R2-01：`requestSupervisor` 预写 assignedFaculty + `acceptProposal` 无状态校验，可绕过 HOD 审批直接到 Faculty Accepted（中）。
- PS-R2-02：HOD approve/reject/assign 不校验 proposal.department，可跨部门越权写，读路径却按部门过滤（高）。
- PS-R2-03：`approveProposal` 不校验当前状态，可把 Faculty Accepted/Submitted 提案强行回退（中）。
- PS-R2-04：无 /refresh 与 /logout，refreshToken 为死凭证，access 签发后无法主动吊销（中）。
- PS-R2-05：`isBanned` 只在登录检查，protect/authorizeRoles 不复查，封禁后旧 token 最长可用 1 小时（中）。
- PS-R2-06：离线/邮件失败时注册与忘记密码接口在响应体回传明文 OTP（中）。
- PS-R2-07：重置密码 OTP 无尝试次数限制，可暴力枚举，而注册 OTP 有 5 次锁定（中）。
- PS-R2-08：multer 无 fileFilter，类型仅依赖客户端 mimetype/扩展名，可上传任意类型（中）。
- PS-R2-09：/uploads 用 express.static 裸挂载，简历等文件可未授权下载，文件名可猜测（中）。
- PS-R2-10：CORS 反射任意来源并允许 credentials，当前影响低但属危险配置（低）。
- PS-R2-11：终稿通过后主 status 仍为 Submitted，完成态散落在两个字段，前后端易判错（中）。
- PS-R2-12：终稿驳回只回退主 status，finalSubmission 残留链接/Rejected，依赖重提整对象覆盖（中）。
- PS-R2-13：timeline 不校验顺序，可一步推 PROJECT COMPLETE 把 progress 刷到 100 解锁终稿（中）。
- PS-R2-14：requestSupervisor 与 rejectProposal 对 assignedFaculty/supervisorRequested 处理不一致，可能导致无法再次请求导师（低）。
- PS-R2-15：faculty 路由放行 hod 角色，叠加按 assignedFaculty 匹配，存在角色边界放宽隐患（低）。

## Round 3 - 技术细节与跨轮核验

| 源码文件路径 | 本轮核验重读的核心导出符号 |
| --- | --- |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | 复用 R1/R2：`generateTokens`（L14-L18）、`login`（L209-L267）、`verifyResetOtp`（L307-L335） |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | 复用 R1/R2：`protect`（L7-L29）、`authorizeRoles`（L31-L46） |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | 复用 R1/R2：`status` enum（L65-L78）、`finalSubmission.status`（L31-L35） |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | 复用 R1/R2：`approveProposal`（L202-L253）、`rejectProposal`（L255-L276）、`assignFacultyToProposal`（L278-L319）、`getHodDashboard`（L27-L33） |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | 复用 R1/R2：`acceptProposal`（L129-L151）、`approveFinalSubmission`（L240-L275）、`getFacultyDashboard`（L19-L21） |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | 复用 R1/R2：`requestSupervisor`（L326-L352）、`submitFinalProject`（L402-L459）、`addProjectTarget`（L364-L379）、`addTimelineUpdate`（L489-L535） |
| [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) | 复用 R2：`maxStudents`（L24，default 60） |
| [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) | 复用 R1/R2：路由表（L14-L28，确认无 /refresh、/logout） |
| [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) | 复用 R1/R2：401 拦截器（L34-L43）、请求拦截器（L21-L31） |

### Q1：JWT payload、鉴权层与 protect 跨集合查找顺序

1. **PS-R3-01**：accessToken 与 refreshToken 的 payload **都只含 `{ id }`，不含 role**。回引 PS-R1-11（双 token payload 仅 `{id}`）、PS-R2-04（无刷新端点使该设计更明显）。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L14-L18) `generateTokens`，两次 `jwt.sign({ id }, ...)`。补充：仅密码重置流程的 `resetToken` 额外带 `{ id, role }`，但它不是会话 access token，见 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js#L329)。

2. **PS-R3-02**：角色鉴权分两层——认证在 `protect`（验签 + 查库挂 `req.user`），**授权在路由级 `authorizeRoles(...roles)`**，依据查库后文档上的 `req.user.role` 字段判断，而不是 token 自描述。回引 PS-R1-13、PS-R1-14；并与 PS-R2-05 呼应（正因为角色来自查库文档，封禁/审批状态才有机会在中间件复查，但当前 `isBanned` 未复查）。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L31-L46) `authorizeRoles`，三类路由绑定见 R1 已引的 student/hod/faculty routes。

3. **PS-R3-03**：`protect` 用解码出的 `id` 按 **Student → Faculty → Hod → Admin** 顺序短路查找，第一个 `findById` 命中即作为 `req.user`。回引 PS-R1-13；与 PS-R2-15（faculty 路由放行 hod）属于同一“角色边界”主题。若同一 ObjectId 理论上跨集合同时存在（MongoDB 不同集合的 `_id` 并非全局唯一约束，可人为重合），则 **Student 永远优先**，该请求会被识别为学生身份，随后被 `authorizeRoles('faculty','hod')` 以 403 拒绝，或在学生路由上以学生身份通过——即“先到先得”，真正的教师/HOD 身份被遮蔽，属于潜在的身份判定歧义。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js#L14-L17)。

### Q2：`HOD Approved` 是否为死状态

4. **PS-R3-04**：`'HOD Approved'` 在本轮重读后**仍判定为死状态：枚举里有、读取/比较里有，但没有任何写入点**。回引 PS-R1-05（R1 已判定死状态）、PS-R2-03（approve 无状态守卫进一步暴露该值无人写入）。所有出现位置如下——
   - 枚举声明：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L67-L77)。
   - 读取/比较：`getHodDashboard` 把它列入 `approvedNeedingAssignment` 查询（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L30-L33)）、`getAllProjects` 的 approved 过滤（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L71)）、`assignFacultyToProposal` 的状态白名单（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L287-L289)）、admin 统计计数（admin.controller.js L56，R2 表格未列但 grep 已确认）。
   - **写入点：无。** `approveProposal` 不带教师写的是 `'Pending Faculty Assignment'`，带教师写 `'Faculty Assigned'`（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L208-L228)），全仓 grep 无 `status = 'HOD Approved'` / `'HOD Approved'` 作为更新值的语句。因此它更像“历史兼容/未接通的预留态”，`assignFacultyToProposal` 中针对它的白名单分支在正常数据流下永远不可达。

### Q3：容量上限 60 与 maxStudents 的关系

5. **PS-R3-05**：硬编码 `60` 与 `Faculty.maxStudents`（schema default 60）是**两套未对齐的口径**。回引 PS-R1-16（写入处硬编码 60）、PS-R1-17（统计 status 集合）、PS-R1-18（展示用 `maxStudents||60` 且 requestSupervisor/accept 无校验）；R2 未单列容量风险编号，此处说明：R2 的 PS-R2-01（绕过 HOD/accept 无校验）与容量主题间接相关，但 R2 无专门容量编号，故 R3 主要回引 R1。核验结论：
   - **两处写操作都做硬校验**：`approveProposal`（带 facultyId 时，[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L215-L222)）与 `assignFacultyToProposal`（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L294-L301)），二者都用字面量 `> 60`，**未读取 `faculty.maxStudents`**。
   - **统计 status 集合固定为 `['Faculty Assigned','Faculty Accepted','Submitted']`**，按“队长 1 + teamMembers 数”累加，**不含任何 Pending 类状态**（`Pending HOD Review`/`Pending Faculty Assignment`/`HOD Approved`/两种 Rejected 都不计），与 PS-R1-17 一致。
   - 只读展示接口（`getAvailableFaculty`、`getFacultyWorkload`、`getApprovedFacultyList`）用的是 `f.maxStudents || 60`，尊重教师个人配置；这意味着把某教师 `maxStudents` 调成 30，界面显示容量 30，但 HOD 分配时仍按 60 拦截——展示与强制校验脱节。

### Q4：终稿 Accepted 后的主状态与可改性

6. **PS-R3-06**：终稿被导师 `approveFinalSubmission` 接受后，主 `status` **不会变成任何 Completed 值**（枚举里本就没有 Completed），而是**显式保持为 `'Submitted'`**，真正的“完成”信号只落在 `finalSubmission.status='Accepted'`。回引 PS-R1-03、PS-R1-04（迁移链）、PS-R2-11（双字段完成态易判错）。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js#L252-L254)，注释写明 `Keeps Submitted (since it's finalized!)`；枚举无 Completed 见 [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js#L67-L77)。

7. **PS-R3-07**：终稿 Accepted 后学生**不能再改 targets、timeline、proposal、文件、终稿**，统一由 `if (proposal.finalSubmission?.status === 'Accepted')` 这一种守卫拦截（而非看主 status）。回引 PS-R1-04、PS-R2-11。具体守卫：
   - targets：`addProjectTarget`（[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L369-L371)）、`updateProjectTarget`（L387-L389）均在函数开头拦截。
   - timeline：`addTimelineUpdate`（[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js#L494-L496)）。
   - 此外 `updateProposal`（L167-L169）、`uploadFile`（L253-L255）、`submitFinalProject`（L408-L410）、`requestDeadlineExtension`（L542-L544）、`markDeadlineSubmitted`（L594-L596）都用同一守卫。
   - 结论：只要 `finalSubmission.status==='Accepted'`，学生侧写操作全部 400；导师/HOD 侧 `addFeedback`、`assignDeadline`、`commentTimelineUpdate`、`resolveExtensionRequest` 也有同样守卫。这是一个跨控制器一致的“终态锁”，但它依赖嵌套字段而非主 status，正是 PS-R2-11 所指前端契约缺口的根源。

### Q5：最高危项 PS-R2-02 的最小复现

8. **PS-R3-08**：Round 2 最高严重度为 **PS-R2-02（高，HOD 跨部门越权写）**。最小复现步骤（角色/动作/期望 status）如下，可被 PS-R1-03/PS-R1-07/PS-R1-08 的迁移描述验证：
   1. 准备：HOD-A 属于部门 A（`req.user.department=A`），学生 S 属于部门 B 并已提交提案 P（`submitProposal` 后 `P.status='Pending HOD Review'`、`P.department=B`），HOD-A 持有自己的有效 access token。
   2. HOD-A 调用 `PUT /api/hod/proposals/P._id/reject`，body `{reason:'...>=20 chars...'}`。路由经 `protect`+`authorizeRoles('hod','admin')` 通过（HOD-A 是 hod），`rejectProposal` 仅按 `req.params.id` 做 `findByIdAndUpdate`，**无 department 过滤**。期望：`P.status` 被改为 `'Rejected (HOD)'`、`hodReview.reviewedBy=HOD-A._id`（部门 B 的提案被部门 A 的 HOD 驳回）。
   3. 变体（更严重）：HOD-A 调用 `PUT /api/hod/proposals/P._id/assign`，body `{facultyId: F_A}`，其中 F_A 是部门 A 的教师。`assignFacultyToProposal` 只校验 `faculty.isApproved` 与 60 人容量，**既不校验 `P.department===HOD-A.department`，也不校验 `F_A.department===P.department`**。期望：`P.assignedFaculty=F_A._id`、`P.status='Faculty Assigned'`——跨部门分配导师成立，随后 F_A 即可在导师侧看到并接受该提案。
   4. 读路径对照：HOD-A 的 `getHodDashboard`/`getAllProjects` 都带 `department: req.user.department=A` 过滤（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L27-L33)），所以 P 不会出现在 HOD-A 的列表里，但这不影响其凭已知 `_id` 直接写入——越权是“写放大、读不可见”。

9. **PS-R3-09**：判定结论——该复现**完全可由 R1 迁移描述验证**（reject→`Rejected (HOD)`、assign→`Faculty Assigned` 均在 PS-R1-03 迁移链中），**不是 R1 遗漏，也不是 R2 误判**。R1 在 PS-R1-07/PS-R1-08 已如实记录了 approve/assign 的状态写入逻辑，但 R1 的任务边界是“逻辑解释”，未对“缺少 department 守卫”做风险定性；R2-02 正是在 R1 事实基础上补上的授权风险定性，两轮为递进关系而非冲突。证据：写入无 department 过滤见 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L259-L262) 与 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js#L281-L305)。

### Q6：401 行为与“已签发但未使用的 refreshToken”的产品后果

10. **PS-R3-10**：产品后果是**会话体验退化为“固定 1 小时硬过期 + 强制重新登录”，refresh 机制名存实亡，并带来无意义的安全面**。回引 PS-R1-12（登录签发 refresh、种 httpOnly cookie、哈希落库）、PS-R1-15（前端 401 直接清 localStorage 跳登录、无刷新逻辑、后端无 /refresh）、PS-R2-04（refresh 为死凭证、无法吊销 access）。具体链路：
    - 登录后 access token 存 localStorage，refresh 在 httpOnly cookie 且哈希存库（PS-R1-12）。
    - access 1 小时过期，`protect` 用 `JWT_SECRET` 验签失败返回 401（PS-R1-13）。
    - 前端 axios 响应拦截器对任何 401 只做 `localStorage.removeItem('user')` + `window.location.href='/login'`，**不会用 cookie 里的 refresh 去换新 access**（[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js#L34-L43)），后端也没有 `/refresh` 端点（[auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js#L14-L28)）。
    - 净效果：用户每小时被强制登出一次；同时 refresh token 仍在浏览器 cookie 与数据库中留存 7 天，既未用于续期，也无法通过 logout 清除（无该端点），成为“只承担泄露风险、不提供续期收益”的冗余凭证。

### 跨轮冲突清单

经逐条比对 Round 1 状态解释与 Round 2 风险描述，**未发现实质性事实冲突**。需要说明的两处“表面张力”及裁定如下：

| 冲突编号对 | 冲突点 | 以哪次重读源码为准 | 最终判定 |
| --- | --- | --- | --- |
| PS-R1-05 ↔ PS-R2-03 / PS-R3-04 | R1 称 `HOD Approved` 无写入点；R2 说 approve 无状态守卫、可能回退状态，看似该值可达 | 重读 `approveProposal`（L202-L253）全函数 | 不冲突：approve 不带教师写 `Pending Faculty Assignment`、带教师写 `Faculty Assigned`，确无写 `HOD Approved` 的语句；R2-03 指的是可把已有状态回退到 `Pending Faculty Assignment`，不是写 `HOD Approved`。维持 R1-05 死状态判定 |
| PS-R1-09 ↔ PS-R2-01 | R1 已指出 acceptProposal 可绕过 HOD，R2 又把它列为中危风险，是否重复 | 重读 `acceptProposal`（L129-L136）与 `requestSupervisor`（L326-L352） | 不冲突、为递进：R1-09 是逻辑事实陈述（“除归属外无状态校验”），R2-01 补上攻击前提（需先经 requestSupervisor 预写 assignedFaculty）与严重度定性。两者一致，维持 |
| PS-R1-15 ↔ PS-R2-04 | R1 说 refresh 未被使用，R2 说 access 无法吊销 | 重读 auth.routes 与 auth.controller | 不冲突：R1-15 描述“无刷新端点/前端不刷新”，R2-04 描述同一事实的安全后果（无法主动作废 token）。互补，维持 |

### 本轮编号索引

- PS-R3-01：access/refresh token payload 仅 `{id}`，不含 role；仅 resetToken 带 role。
- PS-R3-02：鉴权分两层——protect 认证、authorizeRoles 基于查库文档的 role 授权。
- PS-R3-03：protect 按 Student→Faculty→Hod→Admin 短路查找，跨集合同 id 时 Student 遮蔽其余身份。
- PS-R3-04：`HOD Approved` 是死状态，有枚举/读取/比较但无写入点，属历史兼容预留。
- PS-R3-05：写入处硬编码 60 且不读 maxStudents；approve 与 assign 都校验；统计集合不含 Pending 类。
- PS-R3-06：终稿 Accepted 后主 status 仍为 Submitted，枚举无 Completed，完成信号在嵌套字段。
- PS-R3-07：终稿 Accepted 后由统一的 `finalSubmission.status==='Accepted'` 守卫锁死 targets/timeline 等学生写操作。
- PS-R3-08：PS-R2-02 最小复现——HOD-A 凭提案 _id 跨部门 reject/assign，可被 R1 迁移链验证。
- PS-R3-09：R2-02 非误判、R1 非遗漏，两轮是事实到风险的递进关系。
- PS-R3-10：401 即登出 + 无 /refresh，导致 1 小时硬过期与冗余 refresh 凭证并存。

### 三轮追溯摘要

| Round1 编号 | Round2 编号 | Round3 编号 | 证据链要点 |
| --- | --- | --- | --- |
| PS-R1-13 / PS-R1-14 | PS-R2-05 | PS-R3-01 / PS-R3-02 / PS-R3-03 | protect 验签后跨四模型查库、authorizeRoles 按文档 role 授权；token 不带 role；isBanned 未在中间件复查；同 id 跨集合时 Student 优先 |
| PS-R1-05 | PS-R2-03 | PS-R3-04 | `HOD Approved` 在枚举/查询/白名单中存在但全仓无写入，approve 无状态守卫也不写它，判定死状态 |
| PS-R1-16 / PS-R1-17 / PS-R1-18 | PS-R2-01 | PS-R3-05 | 容量写入处硬编码 60、展示处用 maxStudents\|\|60；approve 与 assign 都校验、status 集合不含 Pending；requestSupervisor/accept 无校验可绕过 |
| PS-R1-03 / PS-R1-04 | PS-R2-11 | PS-R3-06 / PS-R3-07 | 终稿 Accepted 后主 status 停留 Submitted、无 Completed；完成态仅在 finalSubmission.status，并由统一守卫锁死学生写操作 |
| PS-R1-07 / PS-R1-08 | PS-R2-02 | PS-R3-08 / PS-R3-09 | approve/assign/reject 按 id 直写无 department 过滤，读路径却按部门过滤；HOD 可跨部门驳回/分配导师，R1 事实→R2 高危→R3 复现 |
| PS-R1-12 / PS-R1-15 | PS-R2-04 | PS-R3-10 | 登录签发 refresh（cookie+落库）但无 /refresh、/logout，前端 401 直接登出；1 小时硬过期 + 冗余 refresh 凭证 |
