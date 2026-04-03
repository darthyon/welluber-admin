graph TD
    Start([Host Admin Portal]) --> Nav["HOST: Navigate to SCR-CFG-01<br/>(Service Taxonomy)"]
    Nav --> Load["SYSTEM: Load taxonomy tree<br/>Categories → Main Services"]
    Load --> Decide{What to do?}
    
    Decide -->|Add Category| AddCat["HOST: Click 'Add Category'"]
    AddCat --> CatForm["SYSTEM: Show form<br/>(name, description, icon)"]
    CatForm --> CatInput["HOST: Enter name + description"]
    CatInput --> CatVal["SYSTEM: Validate<br/>✓ Name unique | Icon OK"]
    CatVal -->|Invalid| CatErr["❌ Show error"]
    CatErr --> CatInput
    CatVal -->|Valid| CatSave["HOST: Click 'Save'"]
    CatSave --> CatPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Category created<br/>Log action"]
    CatPersist --> CatExit["✓ Category added<br/>EXIT"]
    
    Decide -->|Add/Edit Main Service| AddSvc["HOST: Click category or<br/>'Add Main Service'"]
    AddSvc --> SvcForm["SYSTEM: Show form<br/>(name, description, parent category)"]
    SvcForm --> SvcInput["HOST: Enter/edit name"]
    SvcInput --> SvcVal["SYSTEM: Validate<br/>✓ Unique in category"]
    SvcVal -->|Invalid| SvcErr["❌ Show error"]
    SvcErr --> SvcInput
    SvcVal -->|Valid| SvcSave["HOST: Click 'Save'"]
    SvcSave --> SvcPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Main Service created/updated<br/>Log action"]
    SvcPersist --> SvcExit["✓ Main Service saved<br/>EXIT"]
    
    Decide -->|Deactivate| Deact["HOST: Click item<br/>Click 'Deactivate'"]
    Deact --> DeactConf["SYSTEM: Show confirmation<br/>⚠️ 'Active uses grandfathered,<br/>new uses blocked'"]
    DeactConf --> DeactCheck["SYSTEM: Check if in use<br/>🔄 [API]"]
    DeactCheck -->|In use| DeactWarn["⚠️ Show warning<br/>'Used by [X] policies'<br/>(non-blocking)"]
    DeactWarn --> DeactSave["HOST: Confirm"]
    DeactCheck -->|Not in use| DeactSave
    DeactSave --> DeactPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Mark inactive<br/>Item shown as deactivated (strikethrough)<br/>Log action"]
    DeactPersist --> DeactExit["✓ Deactivated<br/>EXIT"]
    
    classDef host fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#000
    classDef system fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef decision fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef exit fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px,color:#000
    
    class Nav,AddCat,CatInput,AddSvc,SvcInput,Deact host
    class Load,CatForm,CatVal,CatSave,CatPersist,SvcForm,SvcVal,SvcSave,SvcPersist,DeactConf,DeactCheck,DeactSave,DeactPersist system
    class Decide,DeactCheck decision
    class CatErr,SvcErr error
    class CatExit,SvcExit,DeactExit exit
