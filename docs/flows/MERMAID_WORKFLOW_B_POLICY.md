graph TD
    Start([Host Admin Portal]) --> Nav["HOST: Navigate to SCR-HST-02<br/>(Benefit Policy List)"]
    Nav --> View["SYSTEM: Load benefit policy list<br/>🔄 [API]"]
    View --> Decide{What to do?}
    
    Decide -->|Create Benefit Policy| Create["HOST: Click 'Create Benefit Policy'"]
    Create --> Step1["SYSTEM: Step 1 - Benefit Policy Basics<br/>- Policy name<br/>- Eligible roles (Full-time|Part-time|etc)<br/>- Employee types"]
    Step1 --> Input1["HOST: Enter basics"]
    Input1 --> Step2["SYSTEM: Step 2 - Benefit Pool<br/>- Pool type (Individual|Shared)<br/>- Utilization (Fixed|Prorated)<br/>- Prorate unit (if Prorated)<br/>- Refresh cycle (dropdown)<br/>- Refresh start (FY|JoinDate|Custom)"]
    Step2 --> Input2["HOST: Select pool config"]
    Input2 --> Val1["SYSTEM: Validate compound field<br/>⚠️ Utilization + Refresh must match<br/>allowed combinations"]
    Val1 -->|Invalid| Err1["❌ Show error<br/>Invalid combination"]
    Err1 --> Input2
    Val1 -->|Valid| Step3["SYSTEM: Step 3 - Benefit Groups<br/>Add rows packs:<br/>- Group name<br/>- Distribution type<br/>- Max usage/cycle"]
    Step3 --> Input3["HOST: Add groups<br/>(e.g. Fitness RM 2000/yr)"]
    Input3 --> Step4["SYSTEM: Step 4 - Add Benefits<br/>Per group:<br/>- Select taxonomy services (multi)<br/>- Per service:<br/>  - benefit_amount (RM)<br/>  - co_payment required<br/>  - co_payment value"]
    Step4 --> Input4["HOST: Select services + amounts"]
    Input4 --> Val2["SYSTEM: Validate amounts<br/>⚠️ No negatives<br/>Co-pay consistency"]
    Val2 -->|Invalid| Err2["❌ Show error"]
    Err2 --> Input4
    Val2 -->|Valid| Save["HOST: Click 'Save Benefit Policy'"]
    Save --> Persist["🔄 SYSTEM: [API] [PERSIST]<br/>Create benefit policy (status=draft)<br/>Create benefit groups & benefits<br/>Log: 'Created benefit policy with [X] groups'"]
    Persist --> Detail["Show benefit policy detail<br/>Status: DRAFT<br/>CTAs: Activate|Clone|Delete"]
    Detail --> Activate["HOST: Click 'Activate'<br/>(make available for org assignment)"]
    Activate --> ActivatePersist["🔄 SYSTEM: [API] [PERSIST]<br/>Status: draft → active<br/>Now visible in org dropdowns<br/>Log action"]
    ActivatePersist --> Exit["✓ Benefit policy activated<br/>EXIT: Benefit policy ready for org assignment"]
    
    Decide -->|Edit Existing| Edit["HOST: Click benefit policy row"]
    Edit --> EditDetail["SYSTEM: Show benefit policy detail (editable)<br/>⚠️ If assigned to orgs:<br/>warning 'Changes apply to<br/>future assignments only'"]
    EditDetail --> EditInput["HOST: Edit fields"]
    EditInput --> EditVal["SYSTEM: Validate"]
    EditVal -->|Invalid| EditErr["❌ Show error"]
    EditErr --> EditInput
    EditVal -->|Valid| EditSave["HOST: Click 'Save Changes'"]
    EditSave --> EditPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Update benefit policy<br/>⚠️ Existing assignments NOT retroactively<br/>recalculated<br/>Log: 'Edited [specific changes]'"]
    EditPersist --> EditExit["✓ Updated<br/>EXIT"]
    
    classDef host fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#000
    classDef system fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef decision fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef exit fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px,color:#000
    
    class Nav,Create,Input1,Input2,Input3,Input4,Save,Activate,Edit,EditInput,EditSave host
    class View,Step1,Step2,Val1,Step3,Step4,Val2,Persist,Detail,ActivatePersist,EditDetail,EditVal,EditPersist system
    class Decide,Val1,EditVal decision
    class Err1,Err2,EditErr error
    class Exit,EditExit exit
