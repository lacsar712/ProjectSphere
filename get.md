## Round 1 - 逻辑解释

| 源码文件路径 | 本轮涉及的核心导出符号（函数/中间件/字段） |
| --- | --- |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | `ProjectProposal`；字段 `status`（L65-L78）、`finalSubmission.status`（L31-L35）、`assignedFaculty`（L86）、`supervisorRequested`（L64）、`progress`（L79） |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | `submitProposal`（L92-L160）、`updateProposal`（L162-L242）、`requestSupervisor`（L326-L352）、`submitFinalProject`（L402-L459）、`getAvailableFaculty`（L294-L324）、`addTimelineUpdate`（L489-L535） |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | `approveProposal`（L202-L253）、`rejectProposal`（L255-L276）、`assignFacultyToProposal`（L278-L319）、`updateProjectSubmission`（L450-L537）、`getFacultyWorkload`（L133-L153）、`getApprovedFacultyList`（L181-L200） |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | `acceptProposal`（L129-L151）、`rejectProposal`（L154-L178）、`approveFinalSubmission`（L240-L275）、`rejectFinalSubmission`（L181-L237）、`getFacultyDashboard`（L12-L126） |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | `generateTokens`（L14-L18）、`login`（L209-L267）、`getModelByRole`（L20-L28） |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | `protect`（L7-L29）、`authorizeRoles`（L31-L46） |
| [student.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/student.routes.js) | 路由守卫 `protect` + `authorizeRoles('student')`（L13-L14）；`POST /proposal`、`POST /faculty/request/:facultyId`、`POST /submit-final` |
| [hod.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/hod.routes.js) | 路由守卫 `protect` + `authorizeRoles('hod','admin')`（L12-L13）；`PUT /proposals/:id/approve`、`PUT /proposals/:id/assign`、`PUT /proposals/:id/submission` |
| [faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js) | 路由守卫 `protect` + `authorizeRoles('faculty','hod')`（L10-L11）；`PUT /proposals/:id/accept`、`PUT /proposals/:id/reject-submission`、`PUT /proposals/:id/approve-submission` |
| [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) | `POST /login`（L19）、`GET /me`（L25-L27）；无 `/refresh`、无 `/logout` 路由 |
| [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) | axios 实例（L14-L18）、请求拦截器（L21-L31）、响应拦截器 401 处理（L34-L43） |
| [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) | 字段 `maxStudents`（L24，默认 60）、`isApproved`（L12） |
| [index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) | 路由挂载（L72-L80）；确认无 refresh 端点 |

> 说明：表格中的 [Faculty.model.js] 与 [index.js] 是为支撑「容量上限字段」与「refresh 端点缺失」两个结论而补充阅读的文件；正文所有证据均来自上表。

### 结论

1. **PS-R1-01（主 status 枚举全集）**：`ProjectProposal.status` 在模型中声明了 8 个枚举值，依次为 `Pending HOD Review`、`Pending Faculty Assignment`、`HOD Approved`、`Rejected (HOD)`、`Faculty Assigned`、`Faculty Accepted`、`Rejected (Faculty)`、`Submitted`，默认值为 `Pending HOD Review`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) `status` 字段 L65-L78。

2. **PS-R1-02（终稿 finalSubmission.status 枚举全集）**：嵌套字段 `finalSubmission.status` 声明了 5 个枚举值：`Not Submitted`、`Under HOD Review`、`Under Faculty Review`、`Accepted`、`Rejected`，默认 `Not Submitted`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) `finalSubmission.status` L31-L35。

3. **PS-R1-03（主状态机可达迁移路径）**：按真实写入代码，主 `status` 的可达迁移如下——
   - 创建：`submitProposal` 不显式写 status，依赖 schema 默认值落入 `Pending HOD Review`。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `submitProposal` L147-L153。
   - HOD 批准但未当场分配导师：`approveProposal` 在请求体**不含** `facultyId` 时写 `Pending Faculty Assignment`。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `approveProposal` L208、L228。
   - HOD 批准并当场分配导师：`approveProposal` 在请求体**含**合法 `facultyId` 且容量校验通过时，一次性写 `Faculty Assigned` 并设置 `assignedFaculty`。证据：同上 L211-L229。
   - HOD 后续补分配：`assignFacultyToProposal` 校验 status ∈ {`HOD Approved`,`Rejected (Faculty)`,`Pending Faculty Assignment`} 后写 `Faculty Assigned` 并设 `assignedFaculty`。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `assignFacultyToProposal` L287-L305。
   - HOD 驳回：`rejectProposal` 写 `Rejected (HOD)`。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `rejectProposal` L259-L262。
   - 学生被驳回后重提：`updateProposal` 仅在当前 status ∈ {`Rejected (HOD)`,`Rejected (Faculty)`} 时允许编辑，并把 status 重置回 `Pending HOD Review`。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `updateProposal` L170-L172、L234。
   - 导师接受：`acceptProposal` 按 `{_id, assignedFaculty: req.user._id}` 定位文档，写 `Faculty Accepted`。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `acceptProposal` L131-L135。
   - 导师驳回开题：`rejectProposal` 写 `Rejected (Faculty)` **同时把 `assignedFaculty` 置为 null**。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `rejectProposal` L158-L162。
   - 学生提交终稿：`submitFinalProject` 校验主 status 必须为 `Faculty Accepted` 后，写主 status 为 `Submitted`。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `submitFinalProject` L411-L413、L441。
   - HOD/导师终稿驳回：`updateProjectSubmission`（HOD）与 `rejectFinalSubmission`（Faculty）均把主 status **回退**为 `Faculty Accepted`，让学生可重新提交。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `updateProjectSubmission` L513；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `rejectFinalSubmission` L217。
   - 导师终稿通过：`approveFinalSubmission` 显式将主 status 保持为 `Submitted`（注释说明「since it's finalized」）。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `approveFinalSubmission` L252-L254。

4. **PS-R1-04（终稿子状态迁移路径）**：`finalSubmission.status` 的写入路径为——
   - 默认/未提交：schema 默认 `Not Submitted`；HOD 侧 `updateProjectSubmission` 还做了空值兜底，若字段不存在则初始化为 `{ status: 'Not Submitted' }`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) L31-L35；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `updateProjectSubmission` L462-L465。
   - 学生提交终稿：`submitFinalProject` 写 `Under HOD Review`（同时主 status → `Submitted`）。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `submitFinalProject` L434-L441。
   - HOD 转交导师：`updateProjectSubmission` 在入参 `status === 'Under Faculty Review'` 时写该值。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `updateProjectSubmission` L467-L488。
   - HOD 驳回：同一函数在入参 `status === 'Rejected'` 时写 `Rejected`（要求 reason 与 requiredCorrections 均 ≥20 字符，并写入 `submissionHistory`）。证据：同上 L489-L529。
   - 导师驳回：`rejectFinalSubmission` 校验主 status 必须为 `Submitted`，写 `Rejected` 并写历史。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `rejectFinalSubmission` L196-L218。
   - 导师通过：`approveFinalSubmission` 校验主 status 必须为 `Submitted`，写 `Accepted`。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `approveFinalSubmission` L248-L254。

5. **PS-R1-05（enum 中存在但实际无写入路径的状态）**：主 status 枚举中的 **`HOD Approved` 是死状态**——全仓搜索显示它只出现在查询过滤器/守卫条件中（HOD 仪表盘「待分配」列表、`getAllProjects` 的 approved 过滤、`assignFacultyToProposal` 的允许前置状态、admin 统计），**没有任何控制器执行 `status = 'HOD Approved'` 的赋值**。`approveProposal` 不传 facultyId 时写的是 `Pending Faculty Assignment`，而非 `HOD Approved`。证据：[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) L70；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L31、L71、L287 与 L208/L228 的对比；`grep` 全仓无 `status = 'HOD Approved'` 赋值。

6. **PS-R1-06（终稿流转的实际跳跃点）**：终稿从学生提交到导师通过的正常路径是 `Under HOD Review` →（HOD 调 `updateProjectSubmission`）→ `Under Faculty Review` →（导师调 `approveFinalSubmission`）→ `Accepted`。但代码中 **`approveFinalSubmission` 并不校验 `finalSubmission.status` 是否为 `Under Faculty Review`**，它只校验主 status === `Submitted`（[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) L248-L250）；因此只要主 status 是 `Submitted`，导师可在 `finalSubmission.status` 仍为 `Under HOD Review` 时直接写 `Accepted`，存在绕过 HOD 转交步骤的可能。同理 `rejectFinalSubmission` 也只看主 status。

7. **PS-R1-07（学生 requestSupervisor 的真实效果）**：`requestSupervisor` 的前置判断顺序为：① 必须存在 proposal；② `proposal.assignedFaculty` 必须为空（否则报「Supervisor already assigned」）；③ `proposal.supervisorRequested` 必须为 false（否则报「request already pending」）；④ facultyId 对应导师存在。通过后它**同时**设置 `supervisorRequested = true` 与 `assignedFaculty = facultyId`，但**不改动主 status**（提案仍是 `Pending HOD Review`）。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `requestSupervisor` L329-L339。

8. **PS-R1-08（supervisorRequested 是只写标志位）**：全仓后端代码中 `supervisorRequested` 仅在 `requestSupervisor` 内被读取一次（作幂等守卫）并置 true，**没有任何 HOD/导师控制器读取或重置它**；HOD 的 `approveProposal`/`assignFacultyToProposal` 完全不感知该字段。因此学生「请求导师」这一动作的唯一持久效果是预填 `assignedFaculty`，而该字段是否被采纳完全取决于 HOD 后续是否传入同一个 facultyId。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L332、L337-L338；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `approveProposal` L202-L231 与 `assignFacultyToProposal` L278-L305（均未引用 `supervisorRequested`）。

9. **PS-R1-09（requestSupervisor 预填 assignedFaculty 与 HOD 分配的交互陷阱）**：学生调用 `requestSupervisor` 后 `assignedFaculty` 已被设为该导师，但主 status 仍为 `Pending HOD Review`。随后 HOD 调 `approveProposal` 时：若 body 不带 facultyId，代码走 L228-L229，只写 `proposal.status = 'Pending Faculty Assignment'`，**不会清空已存在的 `assignedFaculty`**；若 body 带 facultyId，则用新值覆盖（L229）。而 `assignFacultyToProposal` 同样直接覆盖 `assignedFaculty`（L303），不判断其是否已被学生预填。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L208-L229、L303-L304；[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L337-L338。

10. **PS-R1-10（approveProposal 的条件判断顺序）**：真实顺序为——① 按 id 找 proposal 并 populate student；② 默认 `updatedStatus='Pending Faculty Assignment'`、`assignedFaculty=undefined`；③ 仅当 body 含 `facultyId` 时才查 Faculty、校验 `isApproved`、做容量校验，通过则把 `updatedStatus` 改为 `Faculty Assigned`、`assignedFaculty=facultyId`；④ 最后统一写 `proposal.status`、按需写 `assignedFaculty`、写 `hodReview`。注意：该函数**不校验 proposal 当前 status 是否为 `Pending HOD Review`**，即任何 id 都能被「批准」并覆盖状态。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `approveProposal` L202-L231。

11. **PS-R1-11（assignFacultyToProposal 的条件判断顺序）**：① 按 id 找 proposal；② 若 `finalSubmission.status === 'Accepted'` 直接拒绝；③ 校验主 status 必须 ∈ {`HOD Approved`,`Rejected (Faculty)`,`Pending Faculty Assignment`}，否则 400；④ 校验 faculty 存在且 `isApproved`；⑤ 容量校验（硬上限 60）；⑥ 通过后覆盖 `assignedFaculty` 并写 status=`Faculty Assigned`。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `assignFacultyToProposal` L281-L305。

12. **PS-R1-12（acceptProposal 的条件判断顺序）**：导师侧不做显式 status 前置校验，而是用查询条件 `{ _id: req.params.id, assignedFaculty: req.user._id }` 做「所有权 + 存在性」原子过滤，`findOneAndUpdate` 直接把 status 改为 `Faculty Accepted`。这意味着只要该导师是 `assignedFaculty`，无论提案当前是 `Faculty Assigned` 还是其他值，更新都会成功（包括终稿驳回后回退到 `Faculty Accepted` 的情形，此时再调 accept 实际是幂等空转）。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `acceptProposal` L131-L136。

13. **PS-R1-13（assignedFaculty 与 status 的共同决定关系汇总）**：综合 PS-R1-07~PS-R1-12——`assignedFaculty` 可被学生（requestSupervisor，预填但不推进 status）、HOD（approveProposal 带 facultyId / assignFacultyToProposal，覆盖并推进到 `Faculty Assigned`）、导师（rejectProposal 清空为 null 并置 `Rejected (Faculty)`）三方写入；主 status 只有在 HOD 分配或导师接受/驳回时才推进。学生预填的 `assignedFaculty` 不会让提案进入导师仪表板，因为导师仪表板只查 `status: 'Faculty Assigned'` 的 pendingProposals。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `getFacultyDashboard` L19-L21；[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L337-L338；[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L224-L229、L303-L304。

14. **PS-R1-14（generateTokens 的 payload 与有效期）**：`generateTokens(id)` 用 `JWT_SECRET` 签 access token（payload 仅 `{ id }`，有效期 `1h`），用 `JWT_REFRESH_SECRET` 签 refresh token（payload 同样仅 `{ id }`，有效期 `7d`）。注意 payload **不含 role**，role 信息完全靠后续用 id 依次查四张表得到。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `generateTokens` L14-L18。

15. **PS-R1-15（登录响应中 token 的存储位置）**：`login` 成功后，refresh token 经 bcrypt 哈希后存入对应用户文档的 `refreshToken` 字段，同时以 **httpOnly cookie**（名为 `refreshToken`，`maxAge=7d`，生产环境 `secure:true`）下发；access token 则**明文放进 JSON 响应体** `{ _id, name, email, role, accessToken }`，不下发 cookie。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `login` L249-L262。

16. **PS-R1-16（protect 中间件的取人逻辑）**：`protect` 从 `Authorization: Bearer <token>` 头取 access token，用 `JWT_SECRET` 验证后，按 `Student → Faculty → Hod → Admin` 顺序依次 `findById(decoded.id).select('-password')`，第一个命中即赋给 `req.user`；都查不到返回 401。它不校验 refresh token、不检查 token 版本/黑名单，也不区分角色。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) `protect` L7-L29。

17. **PS-R1-17（authorizeRoles 的角色与审批校验）**：`authorizeRoles(...roles)` 返回中间件，先确认 `req.user` 存在，再判断 `req.user.role` 是否在允许列表；额外对 faculty 角色检查 `isApproved`，未批准返回 403。三类路由的角色约束为：student 路由仅 `student`；hod 路由允许 `hod` 与 `admin`；faculty 路由允许 `faculty` 与 `hod`（即 HOD 也可调用导师侧接口）。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) `authorizeRoles` L31-L46；[student.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/student.routes.js) L13-L14；[hod.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/hod.routes.js) L12-L13；[faculty.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/faculty.routes.js) L10-L11。

18. **PS-R1-18（前端 axios 拦截器的配合方式）**：前端创建 axios 实例时开启 `withCredentials: true`（会携带 httpOnly refresh cookie）；**请求拦截器**从 `localStorage.user.accessToken` 读取 access token 并塞入 `Authorization: Bearer` 头；**响应拦截器**对任何 401 响应执行「清空 localStorage.user + 跳转 `/login`」。证据：[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) L14-L43。

19. **PS-R1-19（Access/Refresh 的实际过期处理——refresh 名存实亡）**：后端虽生成并下发 refresh token（cookie + DB 哈希），但 **auth.routes.js 与 index.js 中均不存在 `/refresh` 或类似换发端点，也没有 `/logout` 端点**；前端 `src` 全目录也搜不到任何 refreshToken 调用。因此 access token 1 小时过期后，`protect` 直接返回 401，前端响应拦截器只会**强制登出并跳转登录页**，不存在「用 refresh token 静默换新 access token」的实际路径；refresh token 的 7 天有效期在当前代码中未被消费。证据：[auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) L14-L27（无 refresh/logout 路由）；[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) L72-L80（路由挂载确认）；[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) L34-L43（401 即登出）。

20. **PS-R1-20（导师容量校验的触发函数）**：硬上限容量校验在两处写入路径触发——① HOD `approveProposal` 当场带 facultyId 时（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L215-L222）；② HOD `assignFacultyToProposal`（同文件 L294-L301）。学生侧 `requestSupervisor` **不做任何容量校验**（[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L326-L352）。导师侧 `acceptProposal` 也不做容量校验。

21. **PS-R1-21（容量统计口径）**：两处校验的统计口径完全一致——查询 `assignedFaculty = 该导师` 且主 status ∈ {`Faculty Assigned`,`Faculty Accepted`,`Submitted`} 的所有 proposal，记为 `activeProps`；学生数 `currentStudentCount` 为每个项目 `1 + teamMembers.length` 的累加（即组长 + 所有队员）；本次待分配项目所需名额 `incomingStudentCount = 1 + proposal.teamMembers.length`。注意被导师驳回（`Rejected (Faculty)`，且 assignedFaculty 已被清空）与 HOD 驳回（`Rejected (HOD)`）的项目不计入。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L216-L220、L295-L299。

22. **PS-R1-22（上限数字写死为 60，与 Faculty.maxStudents 脱钩）**：两处容量校验都把上限**硬编码为字面量 `60`**（`if (current + incoming > 60)`，错误信息也写死 60），并未读取 `faculty.maxStudents`。尽管 [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) L24 定义了 `maxStudents`（默认 60），且只读展示接口 `getAvailableFaculty`/`getFacultyWorkload`/`getApprovedFacultyList` 都用 `f.maxStudents || 60` 计算 `capacity` 与 `availableSlots`（[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L306-L315、[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L140、L187），但这些展示值不参与真正的写入拦截；即若把某导师 `maxStudents` 改成小于 60，前端会显示「名额不足」，后端 `approveProposal`/`assignFacultyToProposal` 仍会按 60 放行，形成展示与强制校验不一致。

### 本轮编号索引

- **PS-R1-01**：主 `status` 枚举共 8 个值，默认 `Pending HOD Review`。
- **PS-R1-02**：`finalSubmission.status` 枚举共 5 个值，默认 `Not Submitted`。
- **PS-R1-03**：主状态机从提交到终稿的全部可达迁移路径及写入函数。
- **PS-R1-04**：终稿子状态从 `Under HOD Review` 到 `Accepted`/`Rejected` 的写入路径。
- **PS-R1-05**：枚举值 `HOD Approved` 在真实代码中无任何写入路径，属死状态。
- **PS-R1-06**：导师终稿通过/驳回只校验主 status，不校验 finalSubmission.status，可绕过 HOD 转交。
- **PS-R1-07**：`requestSupervisor` 预填 `assignedFaculty`、置 `supervisorRequested=true`，但不改主 status。
- **PS-R1-08**：`supervisorRequested` 是只写标志位，HOD/导师侧从不读取或重置。
- **PS-R1-09**：学生预填的 `assignedFaculty` 在 HOD 不带 facultyId 批准时不会被清空，存在状态悬挂。
- **PS-R1-10**：`approveProposal` 默认写 `Pending Faculty Assignment`，带 facultyId 才写 `Faculty Assigned`，且不校验前置 status。
- **PS-R1-11**：`assignFacultyToProposal` 要求 status ∈ {HOD Approved, Rejected (Faculty), Pending Faculty Assignment} 并做容量校验。
- **PS-R1-12**：`acceptProposal` 用查询条件做所有权过滤，不做显式 status 前置校验。
- **PS-R1-13**：`assignedFaculty` 由学生/HOD/导师三方写入，但只有 HOD/导师能推进主 status。
- **PS-R1-14**：`generateTokens` 的 access/refresh payload 均只含 `{id}`，有效期分别为 1h、7d。
- **PS-R1-15**：登录后 refresh 存 httpOnly cookie 与 DB 哈希，access 明文返回到响应体。
- **PS-R1-16**：`protect` 从 Bearer 头取 access token，按 Student→Faculty→Hod→Admin 顺序查表赋 `req.user`。
- **PS-R1-17**：`authorizeRoles` 校验角色并对 faculty 额外检查 `isApproved`；faculty 路由同时放行 hod。
- **PS-R1-18**：前端请求拦截器从 localStorage 取 access token 加头，响应拦截器遇 401 即清 storage 跳登录。
- **PS-R1-19**：后端无 refresh/logout 端点、前端无刷新逻辑，access 过期实际只能重新登录，refresh token 未被消费。
- **PS-R1-20**：容量硬校验仅在 HOD `approveProposal`（带 facultyId）与 `assignFacultyToProposal` 触发。
- **PS-R1-21**：容量统计口径为 status ∈ {Faculty Assigned, Faculty Accepted, Submitted}，学生数 = 1 + teamMembers.length 累加。
- **PS-R1-22**：上限字面量写死为 60，与 `Faculty.maxStudents` 字段及前端展示脱钩。

## Round 2 - 潜在风险

| 源码文件路径 | 核心导出符号 |
| --- | --- |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | 复用 R1（`requestSupervisor`、`submitFinalProject`、`addTimelineUpdate`、`uploadFile` L244-L283、`getAvailableFaculty`） |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | 复用 R1（`approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`、读路径 `getHodDashboard`/`getAllProjects`） |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | 复用 R1（`acceptProposal`、`rejectProposal`、`approveFinalSubmission`、`rejectFinalSubmission`、`getFacultyDashboard`） |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | 复用 R1（`login`、`generateTokens`）；本轮新增 `registerStudent` L45-L102、`registerFaculty` L104-L167、`verifyOTP` L169-L207、`forgotPassword` L269-L305、`verifyResetOtp` L307-L335、`shouldSkipEmailVerification` L31-L34 |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | 复用 R1（`protect`、`authorizeRoles`） |
| [auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) | 复用 R1（确认无 refresh/logout） |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | 复用 R1（`status`、`finalSubmission`、`progress`、`timeline`、`supervisorRequested`） |
| [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) | 复用 R1（`maxStudents`、`department`、`isApproved`） |
| [Student.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Student.model.js) | 本轮新读：`isBanned` L24、`banReason` L25、`otpAttempts` L15、`branch` L20 |
| [upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js) | 本轮新读：`upload`（multer 配置）L11-L25；无 `fileFilter` |
| [localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js) | 本轮新读：`UPLOAD_ROOT` L6、`toPublicUrl` L23-L27、`deleteLocalFile` L30-L39、`pickUploadSubdir` L41-L49 |
| [index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) | 复用 R1（路由挂载）；本轮新增 `/uploads` 静态托管 L35、CORS L20-L29 |

> 本轮未发现需要纠正的第 1 轮结论；所有风险均挂接在 Round 1 已建立的状态机/鉴权链路之上。

### 风险结论

1. **PS-R2-01｜requestSupervisor + acceptProposal 可绕过 HOD 分配与容量校验，导师直接「自助接单」｜严重度：高**
   - 回引：PS-R1-07、PS-R1-08、PS-R1-12、PS-R1-20。
   - 触发条件：拥有任意合法 student 账号与目标 faculty 账号（二者可同谋）；提案初始 status=`Pending HOD Review`。
   - 风险说明：学生调 `POST /api/student/faculty/:facultyId` 后，`assignedFaculty` 被直接写成该导师（PS-R1-07），且此路径**不做任何容量校验**（PS-R1-20）。而导师侧 `acceptProposal` 仅以 `{_id, assignedFaculty: req.user._id}` 作为查询条件，**不校验提案当前是否处于 `Faculty Assigned`、也不校验是否经过 HOD 批准**（PS-R1-12）。于是导师只需对一个学生「自助请求」自己的提案调 `PUT /api/faculty/proposals/:id/accept`，即可把 status 从 `Pending HOD Review` 直接改写为 `Faculty Accepted`，完整绕过 HOD 审批、绕过 `Faculty Assigned` 中间态，也绕过了 60 人容量上限（因为容量校验只在 HOD 写路径触发）。
   - 证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `requestSupervisor` L337-L339（写 assignedFaculty 不改 status）；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `acceptProposal` L131-L135（无 status 前置条件，findOneAndUpdate 直接置 `Faculty Accepted`）；容量校验仅见于 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L215-L222、L294-L301。

2. **PS-R2-02｜HOD 全部写操作缺少 department 归属校验，存在跨部门水平越权（IDOR）｜严重度：高**
   - 回引：PS-R1-10、PS-R1-11、PS-R1-17。
   - 触发条件：任意已登录 HOD（或 admin，因 hod 路由放行 admin，见 PS-R1-17）；只需知道/枚举其他部门提案的 `_id`。
   - 风险说明：HOD 读路径严格按 `req.user.department` 过滤（`getHodDashboard` L27/L32/L50、`getAllProjects` L65、`getAllStudents` L122），但四个写操作——`approveProposal`、`rejectProposal`、`assignFacultyToProposal`、`updateProjectSubmission`——均只用 `findById(req.params.id)` 取提案，**没有任何一行校验 `proposal.department === req.user.department`**。这意味着 A 部门 HOD 可直接批准/驳回/改派/终稿评审 B 部门的任意提案，属于典型的水平越权；且 `assignFacultyToProposal` 也不校验被分配 faculty 是否与当前 HOD 同部门。
   - 证据：读路径过滤见 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L23-L50、L65、L122；写路径无 department 判断见 `approveProposal` L205（仅 `findById`）、`rejectProposal` L259、`assignFacultyToProposal` L281、`updateProjectSubmission` L454。

3. **PS-R2-03｜导师侧终稿可绕过 HOD 转交直接 Accepted｜严重度：中**
   - 回引：PS-R1-04、PS-R1-06、PS-R1-17。
   - 触发条件：assignedFaculty 导师（或 HOD，因 faculty 路由允许 hod，PS-R1-17）；提案主 status=`Submitted`、`finalSubmission.status='Under HOD Review'`。
   - 风险说明：Round 1 已指出 `approveFinalSubmission` 不校验 `finalSubmission.status`（PS-R1-06）。本轮进一步确认其前置判断只有 `proposal.status !== 'Submitted'`（L248-L250），因此在 HOD 尚未调用 `updateProjectSubmission` 转交（即尚未置为 `Under Faculty Review`）时，导师即可直接 `PUT /api/faculty/proposals/:id/approve-submission` 把终稿置为 `Accepted`。这使 HOD 终稿初审环节在程序上可被跳过，审批流名存实亡。`rejectFinalSubmission` 同理（L196-L198 仅看主 status）。
   - 证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `approveFinalSubmission` L242-L254；`rejectFinalSubmission` L190-L218；对比 HOD 转交流程 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `updateProjectSubmission` L467-L488。

4. **PS-R2-04｜approveProposal 不校验前置 status，可把任意状态提案「重置」为已批准｜严重度：中**
   - 回引：PS-R1-10、PS-R1-03。
   - 触发条件：任意 HOD/admin；提案可为任意 status（包括已 `Submitted`、已 `Faculty Accepted`、甚至已 `Rejected (HOD)`）。
   - 风险说明：PS-R1-10 已记录 `approveProposal` 不校验当前 status。本轮强调其破坏性：该函数无条件 `proposal.status = updatedStatus`（L228）并写 `hodReview.action='Approved'`，可把一个已经进入终稿阶段（`Submitted`）或已被驳回的提案，强行覆盖回 `Pending Faculty Assignment`/`Faculty Assigned`，且不重置 `finalSubmission`、不重置 `progress`。这会造成状态机「回卷」，与终稿 `Accepted` 后的只读守卫形成竞态——若在导师 `approveFinalSubmission` 之前并发调用，可让已提交终稿的提案退回分配阶段。
   - 证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `approveProposal` L205-L231（无 `proposal.status` 白名单判断，对比 `assignFacultyToProposal` L287 有白名单）。

5. **PS-R2-05｜isBanned 仅在 login 校验，access token 有效期内被封禁学生仍可完整访问｜严重度：中**
   - 回引：PS-R1-16、PS-R1-19、PS-R1-18。
   - 触发条件：学生先登录拿到 access token（有效期 1h，见 PS-R1-14），随后被 HOD 通过 `toggleStudentBan` 封禁。
   - 风险说明：`login` 在 L238-L241 检查 `user.isBanned` 并拒绝登录，但 `protect` 中间件（PS-R1-16）只按 id 查库并组装 `req.user`，**不检查 `isBanned`**；`authorizeRoles` 也只对 faculty 检查 `isApproved`，不检查 student 的封禁状态。因此封禁生效后，该学生在已签发 access token 的 1 小时内仍可调用所有 `/api/student/*` 接口（提交终稿、上传文件、改提案等）。又因没有 refresh/logout 端点（PS-R1-19），服务端也无法主动使已签发 token 失效，封禁存在最长 1 小时的执行空窗。
   - 证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `login` L238-L241；[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) `protect` L14-L20（查库后不判 isBanned）、`authorizeRoles` L36-L43（仅 faculty 判 isApproved）；封禁写入 [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `toggleStudentBan` L381-L396；字段定义 [Student.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Student.model.js) L24-L25。

6. **PS-R2-06｜reset-password OTP 无尝试次数限制且不计入 otpAttempts，可暴力枚举｜严重度：高**
   - 回引：PS-R1-14（reset token 机制）、对比注册验证 OTP。
   - 触发条件：未认证攻击者；知道目标邮箱并已通过 `forgot-password` 触发 OTP。
   - 风险说明：注册/登录邮箱验证用的 `verifyOTP` 有 `otpAttempts >= 5` 锁定（[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) L184-L191）。但密码重置链路 `verifyResetOtp`（L307-L335）只校验 OTP 存在、未过期、bcrypt 比对是否匹配，**完全不读取/递增 `otpAttempts`**。由于 OTP 由 `generateOTP()` 生成（通常为 6 位数字），攻击者可在 10 分钟有效期内无限次尝试，在线暴力破解重置 OTP 进而接管账户。重置成功后签发的 `resetToken` 还同时带 `id` 与 `role`（L329），可直接用于 `resetPassword`。
   - 证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `verifyOTP` L184-L198（有计数）对比 `verifyResetOtp` L307-L335（无计数、无锁定）；`forgotPassword` L280-L284 写入 `otpHash/otpExpiry`。

7. **PS-R2-07｜邮件发送失败时把明文 OTP 通过 HTTP 响应返回，生产环境可泄露验证码｜严重度：中**
   - 回引：PS-R1-15（登录响应也返明文 access token，属设计内）。
   - 触发条件：SMTP 不可用（`sendEmail` 返回 false）或显式开启 `SKIP_EMAIL_VERIFICATION`/`LOCAL_OFFLINE`；任意访问注册/忘记密码接口者。
   - 风险说明：注册时若邮件发送失败，控制器把 `otp` 直接放进 JSON 响应体（`registerStudent` L96 的 `...(verified ? {} : { otp })`，以及 L81-L85 邮件失败后自动 verified 并在控制台打印）。更关键的是 `forgotPassword` 在邮件发送失败时返回 `{ message, otp, local: true }`（L292-L299），并在控制台打印明文 OTP（L293）。这一行为**不区分 NODE_ENV**：只要生产环境 SMTP 临时故障，任意请求者都能从响应体直接拿到重置 OTP，结合 PS-R2-06 可直接接管账户。`shouldSkipEmailVerification` 仅由环境变量/`isOfflineEmail()` 决定，无强制生产环境关闭。
   - 证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `registerStudent` L72-L97、`registerFaculty` L134-L162、`forgotPassword` L286-L301；`shouldSkipEmailVerification` L31-L34。

8. **PS-R2-08｜/uploads 静态目录无鉴权公开托管，所有上传文件可被未授权直链下载｜严重度：高**
   - 回引：PS-R1-16（protect 仅挂在业务路由）。
   - 触发条件：未认证攻击者；只需知道或枚举文件路径（文件名由 `Date.now()_原文件名` 构成，可预测/可遍历）。
   - 风险说明：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) L35 通过 `express.static(UPLOAD_ROOT)` 将整个上传根目录挂在 `/uploads`，**该中间件位于所有 `/api` 路由之前，不经过 `protect`**。学生简历（`profiles/`）、项目报告/PPT/论文（`documents/`、`presentations/`）等本应仅限本人/导师/HOD 可见的文件，任何知道 URL 者均可直接下载，造成学生 PII 与学业材料泄露。`getFiles` 接口虽然按 `studentId` 过滤返回元数据（[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L287），但文件实体本身的公开托管使该过滤形同虚设。
   - 证据：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) L35（`app.use('/uploads', express.static(UPLOAD_ROOT))`）；URL 生成 [localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js) `toPublicUrl` L23-L27；文件名规则 [upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js) L16-L19。

9. **PS-R2-09｜上传无 fileFilter/MIME 白名单，任意类型文件均可落盘并被静态托管｜严重度：中**
   - 回引：PS-R2-08（静态托管放大危害）。
   - 触发条件：任意已认证 student；提交任意扩展名/MIME 的文件。
   - 风险说明：`upload` multer 配置只设了 `storage` 和 50MB 大小限制，**没有 `fileFilter`**（[upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js) L22-L25）。`pickUploadSubdir` 仅按 mimetype/扩展名决定子目录，无法识别的一律落 `misc/`，也不拒绝（[localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js) L41-L49）。同时 `uploadFile` 把客户端传入的 `fileType` 直接写入数据库（L267-L272），不校验其与真实 MIME 是否一致——攻击者可把任意文件（含 HTML/SVG/可执行脚本）标记为 `document` 上传。结合 PS-R2-08 的公开静态托管，若部署环境对 `/uploads` 下资源按 Content-Type 渲染（尤其 HTML/SVG），可演化为存储型 XSS / 恶意软件分发。文件名虽经 `replace(/[^a-zA-Z0-9._-]/g,'_')` 清洗，不构成路径穿越。
   - 证据：[upload.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/upload.middleware.js) L22-L25（无 fileFilter）；[localFiles.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/localFiles.js) L44-L48；[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `uploadFile` L246-L249（仅禁止 `fileType==='code'`）、L267-L272（信任 body.fileType）。

10. **PS-R2-10｜终稿被驳回后旧链接/旧文件仍保留，学生可在不重传材料的情况下再提交｜严重度：低**
    - 回引：PS-R1-03、PS-R1-04、PS-R1-06。
    - 触发条件：学生；终稿已被 HOD 或导师驳回（主 status 回退为 `Faculty Accepted`）。
    - 风险说明：HOD `updateProjectSubmission` 驳回（L511-L514）和导师 `rejectFinalSubmission` 驳回（L215-L218）都只把 `finalSubmission.status` 置 `Rejected`、主 status 回退 `Faculty Accepted`，并写入 `submissionHistory`，但**不清除 `finalSubmission.liveLink/githubLink/linkedinLink`，也不删除已上传的报告/PPT FileSubmission**。学生再次调用 `submitFinalProject` 时，链接来自 body 可重新填写，但文件存在性检查 `files.some(f => f.fileType === 'document')`（L422-L427）只看是否「曾经上传过」，不要求驳回后重新上传新版本。结果是：学生被要求修改报告后，可完全不重传文件、直接再点提交，界面会显示「已重新提交」但附件仍是被驳回前的旧版本，存在「界面以为已整改/实际未改」的契约缺口。
    - 证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `updateProjectSubmission` L497-L514；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `rejectFinalSubmission` L200-L218；重提校验 [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `submitFinalProject` L422-L440。

11. **PS-R2-11｜progress 可由学生自助推进到 100%，无导师确认即解锁终稿提交｜严重度：中**
    - 回引：PS-R1-03、PS-R1-13。
    - 触发条件：学生本人；提案 status=`Faculty Accepted`。
    - 风险说明：`addTimelineUpdate` 接收学生传入的任意 `status`，通过 `progressMap` 直接把 `proposal.progress` 写到 20/50/80/100（L506-L515），服务端**不校验 timeline.status 是否属于 schema 枚举、也不要求导师确认**。而 `uploadFile`（L259-L261）和 `submitFinalProject`（L414-L416）都以 `progress >= 100` 作为解锁门槛。这意味着学生只需对自己的项目 POST 一个 `{status:'PROJECT COMPLETE'}` 的 timeline 更新，即可自助把进度刷到 100%，进而上传终稿文件并提交终稿，绕开本应由导师把关的「项目确实完成」语义。timeline 枚举虽在 schema 层定义（Proposal.model.js L103-L107），但 Mongoose 在数组 push 时对未知 enum 值默认不抛错（除非上层校验），且控制器无显式白名单。
    - 证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `addTimelineUpdate` L489-L517（progress 写入 L506-L515、无 status 白名单）；门槛校验 `uploadFile` L259-L261、`submitFinalProject` L414-L416；枚举定义 [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) L101-L112。

12. **PS-R2-12｜HOD 可跨部门分配导师：assignFacultyToProposal 不校验 faculty.department｜严重度：中**
    - 回引：PS-R1-11、PS-R2-02。
    - 触发条件：任意 HOD/admin；把 A 部门提案分配给 B 部门 faculty（或反过来）。
    - 风险说明：`assignFacultyToProposal` 校验了 faculty 存在且 `isApproved`（L291-L292），但**不校验 `faculty.department` 是否等于 `proposal.department` 或 `req.user.department`**。配合 PS-R2-02 的跨部门提案访问，HOD 可把外系项目指派给本院系导师（或把本院系项目指派给外系导师），导致导师仪表板（按 `assignedFaculty` 过滤，不按 department 过滤，见 `getFacultyDashboard` L14-L21）出现跨部门项目，且导师 `acceptProposal` 同样无部门校验，越权关系被进一步固化。`approveProposal` 当场带 facultyId 时同样不校验部门一致性（L211-L226）。
    - 证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `assignFacultyToProposal` L291-L305（无 department 比对）；`approveProposal` L211-L226；导师侧无部门判断 [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `getFacultyDashboard` L14-L21、`acceptProposal` L131-L135。

13. **PS-R2-13｜CORS 实际反射任意 Origin，credentials=true 可被跨站携带 Cookie｜严重度：低**
    - 回引：PS-R1-15（refresh 通过 httpOnly cookie 下发）、PS-R1-19。
    - 触发条件：诱导已登录用户访问恶意站点；浏览器带 cookie 发起跨站请求。
    - 风险说明：CORS 配置的 `origin` 回调虽然写了 `allowedOrigins` 白名单，但无论 origin 是否在白名单内都执行 `callback(null, true)`（L21-L24，最终 `callback(null,true)` 在 else 分支无条件放行），等于反射任意 Origin；同时 `credentials: true`（L26）。这使任意网站都可跨域携带用户的 refresh cookie 发起请求。当前因无 refresh 消费端点（PS-R1-19），该缺陷的直接危害有限，但一旦未来补上 refresh 端点，将立刻面临 CSRF/跨站窃取刷新令牌的风险；此外 `/uploads` 公开资源也可能被跨站读取。
    - 证据：[index.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/index.js) CORS L20-L29；refresh cookie 设置 [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) L255-L259。

14. **PS-R2-14｜终稿 Accepted 后仍有少数写接口未加只读守卫，存在收尾不一致｜严重度：低**
    - 回引：PS-R1-03、PS-R1-04。
    - 触发条件：终稿已 `Accepted` 的项目；学生/导师调用相关接口。
    - 风险说明：多数学生写接口（`updateProposal`、`uploadFile`、`submitFinalProject`、`addProjectTarget`、`addTimelineUpdate`、`requestDeadlineExtension`、`markDeadlineSubmitted`）都有 `finalSubmission.status === 'Accepted'` 守卫。但 `requestSupervisor`（L329-L339）没有该守卫——不过终稿 Accepted 时 `assignedFaculty` 必已存在，实际会被 L331 拦下，危害被间接抵消。相比之下更值得注意的是：HOD 的 `rejectProposal`（L255-L276）与 `assignFacultyToProposal` 对终稿状态的处理不一致——`assignFacultyToProposal` 有 Accepted 守卫（L283-L285），而 `rejectProposal` **没有** Accepted 守卫，理论上可把一个终稿已通过的提案重新置为 `Rejected (HOD)`，与「Accepted 即终态、不可再改」的产品语义冲突。
    - 证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) `rejectProposal` L255-L276（无 Accepted 守卫）对比 `assignFacultyToProposal` L283-L285（有守卫）；[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `requestSupervisor` L329-L339。

### 本轮编号索引

- **PS-R2-01**：学生 requestSupervisor 预填导师后，导师 acceptProposal 无 status 校验，可绕过 HOD 审批与容量校验直接接单（高）。
- **PS-R2-02**：HOD 四个写操作均不校验 proposal.department 与本人部门一致，存在跨部门水平越权（高）。
- **PS-R2-03**：导师 approveFinalSubmission 不校验 finalSubmission.status，可绕过 HOD 终稿转交直接 Accepted（中）。
- **PS-R2-04**：approveProposal 不校验前置 status，可把已提交/已驳回提案强行回卷为待分配/已分配（中）。
- **PS-R2-05**：isBanned 仅 login 检查，protect/authorizeRoles 不复查，封禁后 access token 1h 内仍可访问（中）。
- **PS-R2-06**：verifyResetOtp 无 otpAttempts 次数限制，重置 OTP 可在线暴力枚举（高）。
- **PS-R2-07**：邮件发送失败时注册/忘记密码接口把明文 OTP 放进 HTTP 响应，生产 SMTP 故障即泄露（中）。
- **PS-R2-08**：/uploads 经 express.static 无鉴权公开托管，简历/报告等文件可被直链下载（高）。
- **PS-R2-09**：multer 无 fileFilter，任意类型文件可上传落盘并被公开托管，fileType 信任客户端（中）。
- **PS-R2-10**：终稿驳回不清除旧链接与旧文件，学生可不重传材料直接再提交（低）。
- **PS-R2-11**：progress 由学生通过 addTimelineUpdate 自助写到 100%，无导师确认即解锁终稿提交（中）。
- **PS-R2-12**：assignFacultyToProposal/approveProposal 不校验 faculty 与 proposal/部门一致，可跨部门指派（中）。
- **PS-R2-13**：CORS 回调无条件反射任意 Origin 且 credentials=true，配合 cookie 存在跨站风险（低）。
- **PS-R2-14**：rejectProposal 缺 finalSubmission.Accepted 只读守卫，与其他写接口终态保护不一致（低）。

## Round 3 - 技术细节与跨轮核验

| 源码文件路径 | 核心导出符号 |
| --- | --- |
| [auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) | 复用 R1/R2：`protect` L7-L29、`authorizeRoles` L31-L46 |
| [auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) | 复用 R1/R2：`generateTokens` L14-L18、`login` L209-L267 |
| [Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) | 复用 R1/R2：`status` enum L65-L78、`finalSubmission` L26-L37 |
| [student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) | 复用 R1/R2：`requestSupervisor` L326-L352、`submitFinalProject` L402-L459、`addProjectTarget` L364-L379、`updateProjectTarget` L381-L400、`addTimelineUpdate` L489-L535 |
| [faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) | 复用 R1/R2：`acceptProposal` L129-L151、`approveFinalSubmission` L240-L275 |
| [hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) | 复用 R1/R2：`approveProposal` L202-L253、`assignFacultyToProposal` L278-L319（容量校验 L215-L222、L294-L301） |
| [Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) | 复用 R1/R2：`maxStudents` L24 |
| [api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) | 复用 R1/R2：请求/响应拦截器 L21-L43 |
| [admin.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/admin.controller.js) | 本轮核验新读（仅作 grep 佐证）：L56 对 `'HOD Approved'` 的 countDocuments |

> 说明：本表列出本轮实际重读并引用的文件；`admin.controller.js` 仅在核验 Q2「HOD Approved」是否有写入点时被 grep 命中，未作整文件分析。

### Q1：JWT payload、鉴权层与 protect 查找顺序

1. **PS-R3-01（accessToken payload 不含 role，角色鉴权在中间件层）**：`generateTokens(id)` 签发的 access token 与 refresh token 的 payload 均**只有 `{ id }`，不含 role**；角色信息不在令牌里，而是在请求期由 `protect` 用 id 查库得到 `req.user`（文档自带 `role` 字段）后，再由 `authorizeRoles(...roles)` 比对 `req.user.role` 完成授权。因此鉴权分两层：`protect` 做「认证（你是谁）」，`authorizeRoles` 做「授权（你能干什么）」。回引 R1：PS-R1-14（payload 仅 id）、PS-R1-16（protect 查表赋 req.user）、PS-R1-17（authorizeRoles 比对 role）；回引 R2：PS-R2-05（正因为 role 来自查库而非 token，封禁状态需在查库后复查，而 protect 未复查）。证据：[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `generateTokens` L14-L18；[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) `protect` L12-L17、`authorizeRoles` L36-L43。

2. **PS-R3-02（同一 ObjectId 跨集合存在时的短路行为）**：`protect` 用 `||` 链按 `Student → Faculty → Hod → Admin` 顺序依次 `findById`，**第一个命中即短路返回**并赋给 `req.user`，后续集合不再查询。若某个 ObjectId 在多个集合中同时存在文档（本系统各集合 `_id` 由 Mongoose 独立生成，正常不会重复，但若通过种子/迁移/手工导入产生同 id），则该令牌会被**固定解析为 Student**，即便该 id 同时也是 Faculty/Hod/Admin。后果：①该用户访问 faculty/hod 路由时，`authorizeRoles` 读到 `req.user.role === 'student'`，返回 403，越权反而被「锁死」为低权角色；②各控制器按 `req.user._id` 过滤数据时会读到 Student 文档的字段（如 `branch` 而非 `department`），引发数据错配。这是一个由「id 不带 role + 顺序短路」共同导致的潜在身份混淆，与 R2 的封禁/审批复查缺失同源。回引 R1：PS-R1-16（查找顺序）、PS-R1-14（无 role）；回引 R2：PS-R2-05（protect 查库后只做了部分状态校验，未做角色一致性校验）。证据：[auth.middleware.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/middleware/auth.middleware.js) `protect` L14-L17。

### Q2：`HOD Approved` 是死状态还是仍有写入点

3. **PS-R3-03（`HOD Approved` 确认是无写入点的死状态）**：全仓 grep `'HOD Approved'` 共 6 处命中，**无一属于写入赋值**，分类如下——
   - schema 枚举声明：1 处，[Proposal.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Proposal.model.js) L70。
   - 读取/查询过滤（比较左侧是文档字段或查询条件）：3 处，[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L31（待分配列表 `$in`）、L71（approved 过滤 `$in`）、L287（`assignFacultyToProposal` 的前置状态白名单 `!==` 比较）。
   - 统计计数：1 处，[admin.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/admin.controller.js) L56（`countDocuments({ status: 'HOD Approved' })`，恒为 0）。
   - 注释：1 处，[emailTemplates.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/utils/emailTemplates.js) L209。
   - **写入点：无。** `approveProposal` 在不带 facultyId 时写的是 `Pending Faculty Assignment`（L208、L228），带 facultyId 时写 `Faculty Assigned`（L224），从不写 `HOD Approved`。因此它既非历史兼容的回填目标，也无活跃写入路径，纯为枚举/查询残留。这与 R1 结论一致并由本轮二次核验加固；R2 的 PS-R2-04 也依赖此事实（approveProposal 可把任意状态覆盖为 `Pending Faculty Assignment`/`Faculty Assigned`，但永远不会落到 `HOD Approved`）。回引 R1：PS-R1-05（死状态判定）、PS-R1-10（approveProposal 的两种写入值）；回引 R2：PS-R2-04（无前置 status 校验的状态回卷）。

### Q3：容量上限 60 与 maxStudents 的关系、触发点与统计口径

4. **PS-R3-04（硬编码 60 与 Faculty.maxStudents 并存但脱钩，两处写入路径都校验，Pending 类不计入）**：
   - **关系**：`Faculty.maxStudents` 在模型中默认 60（[Faculty.model.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/models/Faculty.model.js) L24），被三个只读展示接口用于计算 `capacity/availableSlots/isAvailable`（学生侧 `getAvailableFaculty`、HOD 侧 `getFacultyWorkload`/`getApprovedFacultyList`，均用 `f.maxStudents || 60`）。但**真正的写入拦截用的是字面量 `60`，完全不读 `faculty.maxStudents`**。二者数值默认相同，故默认配置下表现一致；一旦把某导师 `maxStudents` 改成非 60，前端会显示新容量，后端仍按 60 拦截。
   - **触发点**：不止 approve 一处。HOD `approveProposal` 在 body 带 facultyId 时校验（[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L215-L222），`assignFacultyToProposal` 也校验（同文件 L294-L301）。两处逻辑完全相同：`currentStudentCount + incomingStudentCount > 60` 则 400。学生 `requestSupervisor` 与导师 `acceptProposal` **不校验**。
   - **统计 status 集合**：计入容量的是 `{ $in: ['Faculty Assigned', 'Faculty Accepted', 'Submitted'] }`，**不包含任何 Pending 类状态**——既不含 `Pending HOD Review`、`Pending Faculty Assignment`，也不含两个 Rejected 态。学生数口径为每个项目 `1 + teamMembers.length` 累加，本次待分配项目也按 `1 + proposal.teamMembers.length` 预占名额。
   - 回引 R1：PS-R1-20（触发函数）、PS-R1-21（统计口径）、PS-R1-22（60 与 maxStudents 脱钩）；回引 R2：PS-R2-01（requestSupervisor+acceptProposal 绕过容量校验，正是因为这两条路径不触发上述两个校验点）。证据：[hod.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/hod.controller.js) L216-L220、L295-L299。

### Q4：终稿 Accepted 后主 status 与学生可写性

5. **PS-R3-05（终稿 Accepted 后主 status 保持 `Submitted`，不会出现 Completed 值；学生不能改 targets/timeline）**：
   - **主 status 终值**：`approveFinalSubmission` 把 `finalSubmission.status` 置 `Accepted` 的同时，显式写 `proposal.status = 'Submitted'`（注释「Keeps Submitted (since it's finalized!)」），**主 status 枚举里根本没有 Completed/Approved 等值**，「完成」语义完全由嵌套的 `finalSubmission.status === 'Accepted'` 表达。回引 R1：PS-R1-01（枚举无 Completed）、PS-R1-04（导师通过写 Accepted）。
   - **targets 守卫**：`addProjectTarget` 在 L369、`updateProjectTarget` 在 L387 均有 `if (proposal.finalSubmission?.status === 'Accepted') return 400`，因此 Accepted 后既不能新增也不能改 target 状态。
   - **timeline 守卫**：`addTimelineUpdate` 在 L494 同样有该守卫，Accepted 后不能再推进度/timeline。
   - 此外 `submitFinalProject`（L408）、`uploadFile`（L253）、`updateProposal`（L167）、`requestDeadlineExtension`（L542）、`markDeadlineSubmitted`（L594）均有同款守卫，构成「Accepted 即学生侧只读」的统一防线。
   - 回引 R2：PS-R2-14 指出该终态守卫在 HOD `rejectProposal` 处缺失（可把已 Accepted 提案重新驳回），与学生侧严密守卫形成不对称；即「学生改不了，但 HOD 的 rejectProposal 仍可改写终态」。证据：[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `approveFinalSubmission` L252-L254；[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) L369、L387、L494。

### Q5：最高严重度 PS-R2-01 的最小复现步骤

6. **PS-R3-06（最高严重度条目为 PS-R2-01，复现可被 R1 迁移图直接验证，判定成立）**：在 R2 的四条高危（R2-01、R2-02、R2-06、R2-08）中，R2-01 是**唯一能让未授权主体在不触碰 HOD 的情况下推动核心业务状态机跨越审批关卡**的漏洞，直接破坏开题审批这一主流程不变式，故取为最高严重度。其最小复现步骤如下（角色：学生 S、同谋导师 F；初始 status=`Pending HOD Review`，`assignedFaculty=null`，`supervisorRequested=false`）：
   1. S 正常登录后 `POST /api/student/proposal` 创建提案 → 主 status=`Pending HOD Review`（R1 迁移：submitProposal 默认值，PS-R1-03 第 1 条）。
   2. S 调 `POST /api/student/faculty/request/:facultyId`（body 无），`requestSupervisor` 守卫依次通过（提案存在、assignedFaculty 为空、supervisorRequested 为 false、导师存在），写入 `supervisorRequested=true`、`assignedFaculty=F._id`，**主 status 仍为 `Pending HOD Review`**（PS-R1-07）。
   3. F 登录后调 `PUT /api/faculty/proposals/:id/accept`。`acceptProposal` 的查询条件 `{_id:id, assignedFaculty:F._id}` 命中第 2 步写入的文档，`findOneAndUpdate` 直接把 status 置为 `Faculty Accepted`（PS-R1-12）。
   4. **最终 status：`Pending HOD Review` → `Faculty Accepted`**，中间既无 HOD 批准（应先到 `Pending Faculty Assignment`/`Faculty Assigned`），也无任何容量校验（容量只在 HOD 两个写路径触发，PS-R1-20）。
   - 与 R1 迁移图比对：R1 明确 `Faculty Accepted` 的合法前驱是 `Faculty Assigned`（由 HOD `approveProposal`/`assignFacultyToProposal` 写入），且导师仪表板只把 `Faculty Assigned` 列为 pendingProposals（PS-R1-13）。本复现跳过了该前驱，故 R2-01 不是 R1 遗漏，而是对 R1-12「acceptProposal 不校验前置 status」这一事实的**利用路径补全**——R1 描述了「能写」，R2 证明了「可被利用越权」，二者一致、无冲突。唯一的现实前提是 F 需要知道提案 `_id`（可由 S 直接告知，因二者同谋），不影响漏洞成立。
   - 回引 R1：PS-R1-07、PS-R1-12、PS-R1-13、PS-R1-20；回引 R2：PS-R2-01 本身。证据：[student.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/student.controller.js) `requestSupervisor` L329-L339；[faculty.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/faculty.controller.js) `acceptProposal` L131-L135。

### Q6：前端 401 行为与未使用 refreshToken 的产品后果

7. **PS-R3-07（401 即登出 + 无 refresh 端点 = 1 小时强制重登录，refreshToken 沦为死凭证）**：
   - 前端 `api.js` 响应拦截器对**任何** 401 一律执行 `localStorage.removeItem('user')` 并 `window.location.href='/login'`，不区分「access 过期可续签」与「真未授权」，也不尝试用 refresh cookie 换新 token（PS-R1-18）。
   - 后端虽在 login 时下发 7 天 httpOnly refresh cookie 并在 DB 存哈希（PS-R1-15），但全仓无 `/refresh` 端点、无 `/logout` 端点（PS-R1-19）。因此 access token 的 1 小时有效期就是用户的**单次登录硬上限**：到期即被前端强制踢出，refresh 的 7 天有效期从未被消费，名存实亡。
   - 产品后果：①正常用户每小时被迫重新登录，体验差；②服务端无法主动吊销令牌（无 logout/黑名单），结合 R2 的封禁/越权问题形成空窗——被封禁学生在 access token 1h 内仍可操作（PS-R2-05），而这 1h 后又必然全员掉线，两端都不正确；③refresh cookie 虽 httpOnly 但因无消费端点而成为「死凭证」，却仍随 `withCredentials` 携带（R1 已述），叠加 R2-13 的 CORS 反射配置，一旦未来补上 naive refresh 端点会立即引入 CSRF 风险。
   - 回引 R1：PS-R1-15、PS-R1-18、PS-R1-19；回引 R2：PS-R2-05（封禁空窗）、PS-R2-13（CORS+cookie 的潜在放大）。证据：[api.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/FRONTEND/src/lib/api.js) L34-L43；[auth.controller.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/controllers/auth.controller.js) `login` L255-L259；[auth.routes.js](file:///d:/work/document/bytecode/GSB0731/ProjectSphere/BACKEND/routes/auth.routes.js) L14-L27。

### 跨轮冲突清单

经逐条比对 R1 状态机描述与 R2 风险描述，**未发现实质性矛盾**（R2 是对 R1 已陈述事实的利用路径补全，而非反证）。仅有一处易被误读为冲突，特列出澄清：

| 冲突编号对 | 冲突点 | 以哪次重读源码为准 | 最终判定 |
| --- | --- | --- | --- |
| PS-R1-13 ↔ PS-R2-01 | R1-13 称「学生预填的 assignedFaculty 不会让提案进入导师仪表板」，R2-01 又称导师可直接 accept 该提案接单，看似矛盾 | 重读 `getFacultyDashboard`（L19-L21 只查 status='Faculty Assigned'）与 `acceptProposal`（L131-L135 用 assignedFaculty 过滤、不校验 status） | **不冲突**。R1-13 描述的是「UI 可见性」（仪表板 pendingProposals 看不到），R2-01 描述的是「API 可达性」（导师知道 id 即可直接调 accept 接口）。二者层次不同；R2-01 恰恰利用了「UI 不显示但后端接口未做 status 守卫」这一缺口，是对 R1-12/R1-13 的合理利用推断，不构成对 R1 的纠正 |

### 本轮编号索引

- **PS-R3-01**：access/refresh token payload 均只含 `{id}` 不含 role；认证在 protect、授权在 authorizeRoles 两层完成。
- **PS-R3-02**：protect 按 Student→Faculty→Hod→Admin 顺序短路查表，同 id 跨集合存在时会被固定解析为 Student，导致高权角色 403 与字段错配。
- **PS-R3-03**：`HOD Approved` 全仓 6 处命中无一是写入点，确认为死状态（enum/查询/统计/注释残留）。
- **PS-R3-04**：容量硬编码 60 与 Faculty.maxStudents 脱钩；approveProposal（带 facultyId）与 assignFacultyToProposal 都校验；统计 status 仅含 Faculty Assigned/Faculty Accepted/Submitted，不含 Pending 类。
- **PS-R3-05**：终稿 Accepted 后主 status 保持 `Submitted`（无 Completed 值）；学生侧 targets 与 timeline 均被 finalSubmission.Accepted 守卫拦截，不可再改。
- **PS-R3-06**：最高危为 PS-R2-01；最小复现为「学生 requestSupervisor 预填导师 → 导师 acceptProposal」，status 从 Pending HOD Review 直达 Faculty Accepted，可被 R1 迁移图验证，R2 判定成立。
- **PS-R3-07**：前端 401 即强制登出、后端无 refresh/logout 端点，导致 1 小时硬重登、refreshToken 成为死凭证，并放大封禁空窗与 CORS 风险。

### 三轮追溯摘要

| Round1 编号 | Round2 编号 | Round3 编号 | 证据链一句话总结 |
| --- | --- | --- | --- |
| PS-R1-07 / PS-R1-12 / PS-R1-13 / PS-R1-20 | PS-R2-01 | PS-R3-06 | 学生 requestSupervisor 预填 assignedFaculty + 导师 acceptProposal 不校验前置 status + 容量校验仅在 HOD 路径 → 绕过 HOD 审批与 60 人上限直达 Faculty Accepted |
| PS-R1-14 / PS-R1-16 | PS-R2-05 | PS-R3-01 / PS-R3-02 | token payload 仅 id、role 靠 protect 查库获得 → protect 查库后不复查 isBanned/角色一致性 → 封禁空窗与跨集合 id 身份混淆 |
| PS-R1-15 / PS-R1-18 / PS-R1-19 | PS-R2-13 | PS-R3-07 | refresh cookie 下发但无 refresh/logout 端点 + 前端 401 即登出 + CORS 反射任意 Origin → 1 小时硬重登、死凭证与潜在 CSRF 放大 |
| PS-R1-04 / PS-R1-06 | PS-R2-03 | PS-R3-05 | 终稿 Accepted 由 finalSubmission.status 表达、主 status 停在 Submitted；导师 approveFinalSubmission 只校验主 status → 可绕过 HOD 转交，但学生侧 Accepted 守卫严密 |
| PS-R1-20 / PS-R1-21 / PS-R1-22 | PS-R2-01（容量绕过面） | PS-R3-04 | 容量统计口径为三态、硬编码 60 与 maxStudents 脱钩、仅 HOD 两写路径校验 → 学生/导师路径可绕过 |
| PS-R1-05 / PS-R1-10 | PS-R2-04 | PS-R3-03 | `HOD Approved` 无写入点为死状态；approveProposal 无前置 status 校验却只写 Pending Faculty Assignment/Faculty Assigned，永远落不到该枚举值 |
