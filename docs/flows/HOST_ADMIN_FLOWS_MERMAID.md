graph TD
    Start([Host Admin Portal]) --> Dashboard[SCR-DASH-01: Platform Overview]
    
    Dashboard --> DecideFlow{What to configure?}
    
    DecideFlow -->|Taxonomy| TaxFlow["<b>WORKFLOW A: Taxonomy Management</b>"]
    DecideFlow -->|Policies| PolicyFlow["<b>WORKFLOW B: Policy Management</b>"]
    DecideFlow -->|Commission/Cron| CommFlow["<b>WORKFLOW C: Commission & Cron</b>"]
    DecideFlow -->|Org Setup| OrgFlow["<b>WORKFLOW D: Org Setup</b>"]
    
    %% ===== WORKFLOW A: TAXONOMY =====
    TaxFlow --> TaxNav["Host: Navigate to SCR-CFG-01<br/>(Taxonomy Management)"]
    TaxNav --> TaxView["System: Load taxonomy tree<br/>Categories → Main Services → Sub-services"]
    TaxView --> TaxDecide{Host action?}
    
    TaxDecide -->|Add Category| TaxAddCat["Host: Click 'Add Category'"]
    TaxAddCat --> TaxCatForm["System: Show category form<br/>(name, description, icon)"]
    TaxCatForm --> TaxCatInput["Host: Enter name + description + icon"]
    TaxCatInput --> TaxCatValidate["System: Validate inputs<br/>⚠️ Name required | No duplicates | Icon upload OK"]
    TaxCatValidate -->|Invalid| TaxCatError["Show error + retry"]
    TaxCatError --> TaxCatInput
    TaxCatValidate -->|Valid| TaxCatSave["Host: Click 'Save Category'"]
    TaxCatSave --> TaxCatPersist["System: Save to DB<br/>🔄 [API] [PERSIST]<br/>Log action: 'Created category'"]
    TaxCatPersist --> TaxCatBack["Navigate back to SCR-CFG-01<br/>✓ Toast: 'Category created'"]
    TaxCatBack --> TaxExit["EXIT: Taxonomy complete"]
    
    TaxDecide -->|Add/Edit Main Service| TaxMainSvc["Host: Click on category or<br/>'Add Main Service'"]
    TaxMainSvc --> TaxSvcForm["System: Show main service form<br/>(name, description, parent category)"]
    TaxSvcForm --> TaxSvcInput["Host: Enter/edit main service name"]
    TaxSvcInput --> TaxSvcValidate["System: Validate<br/>⚠️ Name required | No duplicates in category"]
    TaxSvcValidate -->|Invalid| TaxSvcError["Show error + retry"]
    TaxSvcError --> TaxSvcInput
    TaxSvcValidate -->|Valid| TaxSvcSave["Host: Click 'Save Main Service'"]
    TaxSvcSave --> TaxSvcPersist["System: Save to DB<br/>🔄 [API] [PERSIST]<br/>Log action"]
    TaxSvcPersist --> TaxSvcBack["Navigate back to SCR-CFG-01<br/>✓ Toast: 'Main Service created/updated'"]
    TaxSvcBack --> TaxExit
    
    TaxDecide -->|Deactivate Item| TaxDeact["Host: Click item<br/>Click 'Deactivate'"]
    TaxDeact --> TaxDeactConfirm["System: Show confirmation dialog<br/>⚠️ 'Deactivate [Item]?<br/>Active uses grandfathered,<br/>new uses blocked'"]
    TaxDeactConfirm --> TaxDeactCheck["System: Check if in use<br/>🔄 [API]"]
    TaxDeactCheck -->|In use| TaxDeactWarn["Show warning (non-blocking)<br/>'Used by [X] benefits & [Y] packages'"]
    TaxDeactWarn --> TaxDeactSave["Host: Confirm deactivation"]
    TaxDeactCheck -->|Not in use| TaxDeactSave
    TaxDeactSave --> TaxDeactPersist["System: Mark inactive<br/>🔄 [API] [PERSIST]<br/>Log action"]
    TaxDeactPersist --> TaxDeactBack["Navigate back to SCR-CFG-01<br/>Item shown as deactivated (gray strikethrough)<br/>✓ Toast: 'Service deactivated'"]
    TaxDeactBack --> TaxExit
    
    %% ===== WORKFLOW B: POLICY MANAGEMENT =====
    PolicyFlow --> PolicyNav["Host: Navigate to SCR-HST-02<br/>(Policy List)"]
    PolicyNav --> PolicyView["System: Load policy list<br/>Name | Status | Assigned Orgs | Created Date<br/>🔄 [API]"]
    PolicyView --> PolicyDecide{Host action?}
    
    PolicyDecide -->|Create Policy| PolicyCreate["Host: Click 'Create Policy'"]
    PolicyCreate --> PolicyForm1["System: Show Step 1 - Policy Basics<br/>- Policy name (text)<br/>- Eligible roles (multi-select)<br/>- Employee types (multi-select)"]
    PolicyForm1 --> PolicyInput1["Host: Enter basics"]
    PolicyInput1 --> PolicyForm2["System: Show Step 2 - Benefit Pool Config<br/>- Pool type (Individual | Shared)<br/>- Utilization mode (Fixed | Prorated)<br/>- Prorate unit (if Prorated)<br/>- Refresh cycle (dropdown, valid per prorate)<br/>- Refresh start ref (FY Start | Join Date | Custom)"]
    PolicyForm2 --> PolicyInput2["Host: Select pool config"]
    PolicyInput2 --> PolicyValidate1["System: Validate compound field<br/>⚠️ Valid combinations enforced<br/>Prorate unit required if Prorated<br/>Refresh cycle must match prorate unit"]
    PolicyValidate1 -->|Invalid| PolicyError1["Show error + retry"]
    PolicyError1 --> PolicyInput2
    PolicyValidate1 -->|Valid| PolicyForm3["System: Show Step 3 - Benefit Groups<br/>Add rows: name | distribution type |<br/>max usage per cycle (optional)"]
    PolicyForm3 --> PolicyInput3["Host: Add benefit groups<br/>(e.g. Fitness RM 2000/year)"]
    PolicyInput3 --> PolicyForm4["System: Show Step 4 - Add Benefits<br/>Per group:<br/>- Taxonomy main services (multi-select)<br/>- Per service: benefit_amount (RM) |<br/>  co_payment_required | co_payment_value"]
    PolicyForm4 --> PolicyInput4["Host: Select services + amounts + co-pays"]
    PolicyInput4 --> PolicyValidate2["System: Validate amounts<br/>⚠️ No negatives<br/>Co-pay consistency checks"]
    PolicyValidate2 -->|Invalid| PolicyError2["Show error + retry"]
    PolicyError2 --> PolicyInput4
    PolicyValidate2 -->|Valid| PolicySave["Host: Click 'Save Policy'"]
    PolicySave --> PolicyPersist["System: Create policy (status=draft)<br/>Create benefit groups & benefits<br/>🔄 [API] [PERSIST]<br/>Log: 'Created policy [Name] with [X] groups'"]
    PolicyPersist --> PolicyDetail["Show policy detail view<br/>Status badge: DRAFT<br/>CTAs: Activate | Clone | Delete | Assign"]
    PolicyDetail --> PolicyActivate["Host: Click 'Activate'<br/>(to make available for org assignment)"]
    PolicyActivate --> PolicyActivatePersist["System: Status draft → active<br/>🔄 [API] [PERSIST]<br/>Policy now visible in org assignment dropdowns<br/>Log action"]
    PolicyActivatePersist --> PolicyCreateExit["✓ Toast: 'Policy activated'<br/>EXIT: Policy creation complete"]
    
    PolicyDecide -->|Edit Policy| PolicyEdit["Host: Click policy row"]
    PolicyEdit --> PolicyEditDetail["System: Show policy detail (editable)<br/>⚠️ If assigned to orgs: warning banner<br/>'Changes apply to future assignments only'"]
    PolicyEditDetail --> PolicyEditInput["Host: Edit fields (name, groups, benefits, etc.)"]
    PolicyEditInput --> PolicyEditValidate["System: Validate<br/>Same as creation flow"]
    PolicyEditValidate -->|Invalid| PolicyEditError["Show error + retry"]
    PolicyEditError --> PolicyEditInput
    PolicyEditValidate -->|Valid| PolicyEditSave["Host: Click 'Save Changes'"]
    PolicyEditSave --> PolicyEditPersist["System: Update policy<br/>🔄 [API] [PERSIST]<br/>Log: 'Edited policy [Name]: [specific changes]'<br/>⚠️ Existing assignments NOT retroactively recalc"]
    PolicyEditPersist --> PolicyEditExit["✓ Toast: 'Policy updated'<br/>EXIT: Edit complete"]
    
    PolicyDecide -->|Clone Policy| PolicyClone["Host: Click policy → Click 'Clone'"]
    PolicyClone --> PolicyCloneForm["System: Show clone form<br/>Pre-filled name: '[Original] — 2026 Copy'"]
    PolicyCloneForm --> PolicyCloneInput["Host: Update name if desired"]
    PolicyCloneInput --> PolicyCloneAction["Host: Click 'Clone'"]
    PolicyCloneAction --> PolicyClonePersist["System: Create copy with all groups/benefits<br/>Status = draft<br/>cloned_from = original policy ID<br/>🔄 [API] [PERSIST]<br/>Log action"]
    PolicyClonePersist --> PolicyCloneDetail["Show cloned policy detail<br/>Banner: 'Clone of [Original]'<br/>CTAs: Activate | Assign | Delete"]
    PolicyCloneDetail --> PolicyCloneExit["EXIT: Clone complete<br/>Host can edit before activation"]
    
    PolicyDecide -->|Assign to Orgs| PolicyAssign["Host: Click policy<br/>Click 'Assign to Orgs'"]
    PolicyAssign --> PolicyAssignDialog["System: Show org assignment dialog<br/>Multi-select list of active orgs<br/>Already-assigned orgs: checked, disabled<br/>New orgs: unchecked"]
    PolicyAssignDialog --> PolicyAssignSelect["Host: Select one or more orgs"]
    PolicyAssignSelect --> PolicyAssignAction["Host: Click 'Assign'"]
    PolicyAssignAction --> PolicyAssignPersist["System: Add policy to assigned_orgs<br/>🔄 [API] [PERSIST]<br/>Org Admins now see in Policy Assignment wizard<br/>Log: 'Assigned policy to [X] orgs'"]
    PolicyAssignPersist --> PolicyAssignExit["✓ Toast: 'Policy assigned'<br/>EXIT: Assignment complete"]
    
    PolicyDecide -->|Deactivate Policy| PolicyDeact["Host: Click policy<br/>Click 'Deactivate'"]
    PolicyDeact --> PolicyDeactDialog["System: Show confirmation<br/>'Deactivate [Policy]?<br/>Existing assignments unaffected,<br/>new assignments blocked'"]
    PolicyDeactDialog --> PolicyDeactCheck["System: Check if in use<br/>🔄 [API]"]
    PolicyDeactCheck -->|Active assignments exist| PolicyDeactWarn["Show warning (non-blocking)<br/>'[X] active assignments will remain active'"]
    PolicyDeactWarn --> PolicyDeactConfirm["Host: Confirm"]
    PolicyDeactCheck -->|No assignments| PolicyDeactConfirm
    PolicyDeactConfirm --> PolicyDeactPersist["System: Status active → deactivated<br/>🔄 [API] [PERSIST]<br/>Log action"]
    PolicyDeactPersist --> PolicyDeactExit["✓ Toast: 'Policy deactivated'<br/>EXIT: Deactivation complete"]
    
    %% ===== WORKFLOW C: COMMISSION & CRON CONFIG =====
    CommFlow --> CommNav{Which config?}
    
    CommNav -->|Commission| CommComm["Host: Navigate to SP detail (SCR-SP-05)<br/>Click 'Commission' tab or link"]
    CommComm --> CommCommLoad["System: Load commission schema for this SP<br/>Table: Category | Rate (Redeemed) |<br/>Rate (Expired) | Last Updated<br/>🔄 [API]<br/>Only categories SP selected are shown"]
    CommCommLoad --> CommCommInput["Host: Enter commission rates<br/>Per category:<br/>- Redeemed rate (0.10–0.30)<br/>- Expired rate (0.10–0.30)<br/>Can differ or lock to same"]
    CommCommInput --> CommCommValidate["System: Real-time validation<br/>⚠️ Each rate: 0.10 ≤ rate ≤ 0.30"]
    CommCommValidate -->|Invalid| CommCommError["Show inline error<br/>Save button disabled"]
    CommCommError --> CommCommInput
    CommCommValidate -->|Valid| CommCommSave["Host: Click 'Save Commission Schema'"]
    CommCommSave --> CommCommPersist["System: Save rates<br/>🔄 [API] [PERSIST]<br/>Applies to all future transactions<br/>Log: 'Configured commission for SP:<br/>[rate breakdown]'<br/>⚠️ Past transactions immutable"]
    CommCommPersist --> CommCommExit["✓ Toast: 'Commission saved'<br/>EXIT: Commission config complete"]
    
    CommNav -->|Cron Settings| CommCron["Host: Navigate to SCR-CFG-02<br/>(Global Cron Settings)"]
    CommCron --> CommCronLoad["System: Load current defaults<br/>- Cancellation window: [value] [unit]<br/>  (default 3 hours)<br/>- Validity period: [value] [unit]<br/>  (default 15 days)<br/>- Settlement cycle: [frequency]<br/>  (default Monthly)"]
    CommCronLoad --> CommCronInput["Host: Update values<br/>- Cancellation: numeric + unit<br/>- Validity: numeric + unit<br/>- Settlement: radio (Weekly|Monthly|On-Demand)"]
    CommCronInput --> CommCronValidate["System: Validate ranges<br/>⚠️ Cancellation: 30 min–7 days<br/>Validity: 1 day–365 days"]
    CommCronValidate -->|Outside range| CommCronWarn["Show warning (non-blocking)<br/>'This is outside recommended range'<br/>Host can confirm to proceed"]
    CommCronWarn --> CommCronPreview
    CommCronValidate -->|In range| CommCronPreview["System: Show impact preview<br/>'Cancellation change: [X] pending vouchers<br/>will be affected within [timeframe]'"]
    CommCronPreview --> CommCronSave["Host: Click 'Save Settings'"]
    CommCronSave --> CommCronPersist["System: Save new defaults<br/>🔄 [API] [PERSIST]<br/>Apply to future cron jobs only<br/>No retroactive changes<br/>Log action"]
    CommCronPersist --> CommCronExit["✓ Toast: 'Settings saved'<br/>EXIT: Cron config complete"]
    
    CommNav -->|Expired Voucher Split| CommExpired["Host: Navigate to SCR-CFG-03<br/>(Expired Voucher Policy)"]
    CommExpired --> CommExpiredLoad["System: Load current split<br/>% Org Refund | % SP Ledger |<br/>% Welluber Commission<br/>(must sum to 100%)"]
    CommExpiredLoad --> CommExpiredInput["Host: Adjust percentages<br/>Three input fields or sliders<br/>Real-time sum validation"]
    CommExpiredInput --> CommExpiredValidate["System: Validate sum<br/>⚠️ Must equal 100%"]
    CommExpiredValidate -->|Invalid| CommExpiredError["Show error<br/>'Sum must = 100%. Current: [X]%'<br/>Save button disabled"]
    CommExpiredError --> CommExpiredInput
    CommExpiredValidate -->|Valid| CommExpiredPreview["System: Show impact preview<br/>'RM 1,000 expired voucher:<br/>Org gets RM [X], SP gets RM [Y],<br/>Welluber keeps RM [Z]'"]
    CommExpiredPreview --> CommExpiredSave["Host: Click 'Save Policy'"]
    CommExpiredSave --> CommExpiredPersist["System: Save split<br/>🔄 [API] [PERSIST]<br/>Apply to future expired vouchers<br/>Log action"]
    CommExpiredPersist --> CommExpiredExit["✓ Toast: 'Policy saved'<br/>EXIT: Expired voucher config complete"]
    
    %% ===== WORKFLOW D: ORG SETUP =====
    OrgFlow --> OrgFlowTitle["<b>WORKFLOW D: Organization Setup</b><br/>(Host → Org Admin interaction)"]
    OrgFlowTitle --> OrgCreate["HOST: Navigate to Org registration<br/>(self-serve portal or Host Admin creates)"]
    OrgCreate --> OrgCreateForm["HOST: Create org account<br/>- Company name<br/>- Registration no.<br/>- Industry<br/>- Org type (SME|Enterprise|NGO)<br/>- Financial year start date<br/>- Subscription plan"]
    OrgCreateForm --> OrgCreatePersist["SYSTEM: Save org account<br/>Status = Active (v1: no approval)<br/>🔄 [API] [PERSIST]<br/>Create default branch (HQ)"]
    OrgCreatePersist --> OrgAddAdmin["HOST: Add Org Admin user(s)<br/>User Mgmt → Add User<br/>Name + Email<br/>Role = Org Admin"]
    OrgAddAdmin --> OrgInviteSend["SYSTEM: Send magic link to Org Admin email<br/>60 min expiry<br/>Link opens Welluber Org Portal"]
    OrgInviteSend --> OrgAdminBox["<b>ORG ADMIN receives email</b><br/>Clicks magic link"]
    OrgAdminBox --> OrgAdminSetup["ORG ADMIN: Completes account setup<br/>via universal link<br/>Name + password-less SSO<br/>(Google/Apple)"]
    OrgAdminSetup --> OrgAdminLogin["ORG ADMIN: Logged into<br/>Welluber Org Portal"]
    OrgAdminLogin --> HostContinue["HOST (parallel):<br/>Assigns policies to org<br/>Creates branch wallet<br/>Sends payment link to Org Finance"]
    HostContinue --> HostPersist["SYSTEM:<br/>- Policies assigned (read in wizard)<br/>- Branch wallet created (balance=0)<br/>- Payment link sent<br/>🔄 [API] [PERSIST]<br/>Log: 'Org setup completed'"]
    HostPersist --> OrgAdminWorkflow["ORG ADMIN (self-serve from v2):<br/>- Upload employee CSV<br/>- Review employees<br/>- Trigger bulk invites<br/>- Assign policies to employees<br/>- Manage wallet<br/>(v1: Host does this on behalf)"]
    OrgAdminWorkflow --> OrgExit["EXIT: Org activation complete<br/>Employees can now link corporate identity"]
    
    %% Styling
    classDef workflow fill:#e1f5ff,stroke:#0277bd,stroke-width:3px,color:#000
    classDef actor fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#000
    classDef system fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef decision fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef success fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef exit fill:#fff176,stroke:#f57f17,stroke-width:3px,color:#000
    
    class TaxFlow,PolicyFlow,CommFlow,OrgFlow,OrgFlowTitle workflow
    class TaxNav,TaxInput,PolicyInput1,PolicyInput2,PolicyInput3,PolicyInput4,PolicyEditInput,PolicyCloneInput,PolicyCloneAction,PolicyAssignSelect,PolicyAssignAction,PolicyDeactConfirm,CommCommInput,CommCronInput,CommExpiredInput,OrgCreate,OrgAddAdmin,OrgAdminBox,OrgAdminSetup,OrgAdminWorkflow,HostContinue actor
    class TaxView,TaxCatForm,TaxCatValidate,TaxSvcForm,TaxSvcValidate,PolicyView,PolicyForm1,PolicyForm2,PolicyForm3,PolicyForm4,PolicyValidate1,PolicyValidate2,PolicyEditDetail,PolicyEditValidate,PolicyCloneForm,PolicyAssignDialog,PolicyDeactDialog,CommCommLoad,CommCommValidate,CommCronLoad,CommCronValidate,CommCronPreview,CommExpiredLoad,CommExpiredValidate,CommExpiredPreview,OrgCreateForm,OrgInviteSend,OrgAdminLogin system
    class TaxDecide,PolicyDecide,CommNav,TaxDeactCheck,PolicyDeactCheck,PolicyDeactWarn decision
    class TaxCatError,TaxSvcError,PolicyError1,PolicyError2,PolicyEditError,CommCommError,CommCronError,CommExpiredError error
    class PolicyCreateExit,TaxExit,PolicyCloneExit,PolicyAssignExit,PolicyDeactExit,CommCommExit,CommCronExit,CommExpiredExit,OrgExit exit
